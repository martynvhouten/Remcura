import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import {
  useOrderListsSupplierSplitting,
  type SupplierOrder,
  type OrderSendingResult,
} from '@/stores/orderLists/orderLists-supplier-splitting';
import { useInventoryMovements } from '@/stores/inventory/inventory-movements';
import type { ReorderSuggestion } from '@/stores/orderLists/orderLists-minmax';
import type { LowStockItemDTO } from '@/types/analytics';
import { AnalyticsService } from '@/services/analytics';

// Extended ReorderSuggestion with additional fields used in this service
// Independent interface - not extending ReorderSuggestion to avoid conflicts
interface ExtendedReorderSuggestion {
  product_id: string;
  product_name?: string;
  sku?: string;
  location_id?: string;
  location_name?: string;
  current_stock: number;
  minimum_stock: number;
  reorder_point: number | null;
  calculated_order_quantity: number;
  unit_price: number;
  preferred_supplier_id?: string | null;
  preferred_supplier_name?: string;
  urgency_level: string;
  estimated_cost?: number;
  lead_time_days?: number;
  practice_id?: string;
  last_ordered_at?: string | null;
  stock_trend?: string;
}

export interface OrderResult {
  orderId: string;
  supplierOrders: SupplierOrder[];
  sendingResults: OrderSendingResult[];
  totalItems: number;
  totalValue: number;
  status: 'success' | 'partial' | 'failed';
  errors: string[];
}

export interface AutoReorderConfig {
  practiceId: string;
  locationId?: string;
  enableLowStockReorder: boolean;
  enableScheduledReorder: boolean;
  maxOrderValue?: number;
  approvalRequired: boolean;
}

export interface OrderStatus {
  orderId: string;
  supplierOrderId: string;
  supplierId: string;
  supplierName: string;
  status:
    | 'pending'
    | 'sent'
    | 'confirmed'
    | 'shipped'
    | 'delivered'
    | 'cancelled';
  orderReference: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  lastUpdated: string;
}

/**
 * Central Order Orchestration Service
 *
 * This service provides a unified interface for:
 * - Automatic reorder processing
 * - Multi-supplier order creation and management
 * - Order status tracking
 * - Inventory updates after delivery
 */
export class CentralOrderService {
  private supplierSplittingService = useOrderListsSupplierSplitting();

  /**
   * Process automatic reorder for a practice
   * Analyzes stock levels and creates orders where needed
   */
  async processAutomaticReorder(
    config: AutoReorderConfig
  ): Promise<OrderResult> {
    try {
      orderLogger.info(
        `Starting automatic reorder for practice ${config.practiceId}`
      );

      // 1. Get low stock items that need reordering
      const lowStockItems = await this.getLowStockItems(
        config.practiceId,
        config.locationId
      );

      if (lowStockItems.length === 0) {
        orderLogger.info('No items need reordering');
        return {
          orderId: '',
          supplierOrders: [],
          sendingResults: [],
          totalItems: 0,
          totalValue: 0,
          status: 'success',
          errors: [],
        };
      }

      // 2. Generate reorder suggestions
      const reorderSuggestions =
        await this.generateReorderSuggestions(lowStockItems);

      // 3. Check approval requirements
      const totalValue = reorderSuggestions.reduce(
        (sum, item) => sum + item.calculated_order_quantity * item.unit_price,
        0
      );

      if (
        config.approvalRequired ||
        (config.maxOrderValue && totalValue > config.maxOrderValue)
      ) {
        // Create draft order list for approval
        return await this.createDraftOrderForApproval(
          config.practiceId,
          reorderSuggestions
        );
      }

      // 4. Process automatic order
      return await this.createMultiSupplierOrder(reorderSuggestions);
    } catch (error) {
      orderLogger.error(
        'Error in automatic reorder process:',
        error as Record<string, unknown>
      );
      throw error;
    }
  }

  /**
   * Create multi-supplier order from reorder suggestions
   */
  async createMultiSupplierOrder(
    items: ExtendedReorderSuggestion[]
  ): Promise<OrderResult> {
    try {
      orderLogger.info(
        `Creating multi-supplier order for ${items.length} items`
      );

      // 1. Split items by supplier
      const splitResult =
        await this.supplierSplittingService.splitOrderBySuppliers(items as any);

      // 2. Send orders to suppliers
      const sendingResults = await this.sendOrdersToSuppliers(
        splitResult.supplier_orders
      );

      // 3. Record orders in database
      await this.recordSupplierOrders(
        splitResult.supplier_orders,
        sendingResults
      );

      // 4. Update stock reservations
      await this.updateStockReservations(items, 'reserve');

      const totalItems = splitResult.supplier_orders.reduce(
        (sum, order) => sum + order.total_items,
        0
      );
      const totalValue = splitResult.supplier_orders.reduce(
        (sum, order) => sum + (order.total_cost ?? 0),
        0
      );

      const errors = sendingResults
        .filter(result => result.status === 'failed')
        .map(result => result.error_message || 'Unknown error');

      return {
        orderId: this.generateOrderId(),
        supplierOrders: splitResult.supplier_orders,
        sendingResults,
        totalItems,
        totalValue,
        status:
          errors.length === 0
            ? 'success'
            : errors.length < sendingResults.length
              ? 'partial'
              : 'failed',
        errors,
      };
    } catch (error) {
      orderLogger.error(
        'Error creating multi-supplier order:',
        error as Record<string, unknown>
      );
      throw error;
    }
  }

  /**
   * Send orders to multiple suppliers
   */
  async sendOrdersToSuppliers(
    orders: SupplierOrder[]
  ): Promise<OrderSendingResult[]> {
    try {
      const results =
        await this.supplierSplittingService.sendOrdersToSuppliers(orders);

      // Create notifications for successful orders
      for (const result of results) {
        const practiceId = orders[0]?.practice_id || '';
        if (result.status === 'success') {
          await this.createOrderNotification(
            result.supplier_id,
            result.supplier_name,
            result.order_reference || '',
            'success',
            practiceId
          );
        } else if (result.status === 'failed') {
          await this.createOrderNotification(
            result.supplier_id,
            result.supplier_name,
            result.order_reference || '',
            'error',
            practiceId,
            result.error_message ?? ''
          );
        }
      }

      return results;
    } catch (error) {
      orderLogger.error(
        'Error sending orders to suppliers:',
        error as Record<string, unknown>
      );
      throw error;
    }
  }

  /**
   * Track order status across suppliers
   */
  async trackOrderStatus(orderIds: string[]): Promise<OrderStatus[]> {
    try {
      // Boundary type for Supabase response - aligned with actual DB columns
      interface SupplierOrderRow {
        id: string;
        status: string | null;
        tracking_info: Record<string, unknown> | null;
        delivery_expected: string | null;
        delivery_confirmed_at: string | null;
        updated_at: string | null;
        suppliers: { id: string; name: string } | null;
      }

      const { data, error } = await supabase
        .from('supplier_orders')
        .select(
          `
          id,
          status,
          delivery_expected,
          delivery_confirmed_at,
          tracking_info,
          updated_at,
          suppliers(id, name)
        `
        )
        .in('id', orderIds);

      if (error) throw error;

      return (((data as SupplierOrderRow[] | null) || []).map(order => ({
        orderId: order.id,
        supplierOrderId: order.id,
        supplierId: order.suppliers?.id ?? '',
        supplierName: order.suppliers?.name ?? 'Unknown',
        status: order.status ?? 'unknown',
        orderReference: order.id,
        trackingNumber: (order.tracking_info as any)?.trackingNumber ?? null,
        estimatedDelivery: order.delivery_expected ?? null,
        actualDelivery: order.delivery_confirmed_at ?? null,
        lastUpdated: order.updated_at ?? null,
      })) as any);
    } catch (error) {
      orderLogger.error(
        'Error tracking order status:',
        error as Record<string, unknown>
      );
      throw error;
    }
  }

  /**
   * Update stock levels after delivery confirmation
   * TODO: Implement once supplier_order_items table is available
   */
  async updateStockAfterDelivery(orderId: string): Promise<void> {
    try {
      orderLogger.info(`Updating stock after delivery for order ${orderId}`);

      // TODO: This functionality requires supplier_order_items table
      // which doesn't exist yet in the schema. Needs to be implemented
      // when the proper schema is in place.
      orderLogger.warn(
        'updateStockAfterDelivery not yet implemented - requires supplier_order_items table',
        { orderId }
      );

      return;

      // Get order items - PLACEHOLDER CODE
      /*
      const { data: orderItemsResult, error } = await supabase
        .from('supplier_order_items')
        .select(
          `
          product_id,
          quantity_ordered,
          quantity_received
        `
        )
        .eq('supplier_order_id', orderId);

      if (error) throw error;

      const orderItems = (orderItemsResult as any) ?? [];

      for (const item of orderItems) {
        // TODO: Implement stock update logic
      }

      // Update stock reservations (unreserve)
      await this.updateStockReservations(
        orderItems.map((item: any) => ({
          product_id: item.product_id,
          calculated_order_quantity: item.quantity_ordered,
          practice_id: '', // TODO
          location_id: '', // TODO
        })) as ReorderSuggestion[],
        'unreserve'
      );
      */

      // Create notification
      /*
      await supabase.from('notifications').insert({
        practice_id: '', // TODO
        title: 'Bestelling ontvangen',
        message: `Voorraad is bijgewerkt`,
        category: 'order_update',
        priority: 'normal',
        action_url: '/inventory/levels',
        action_label: 'Bekijk voorraad',
      });

      orderLogger.info('Successfully updated stock');
      */
    } catch (error) {
      orderLogger.error(
        'Error updating stock after delivery:',
        error as Record<string, unknown>
      );
      throw error;
    }
  }

  // Private helper methods

  private async getLowStockItems(
    practiceId: string,
    locationId?: string
  ): Promise<LowStockItemDTO[]> {
    const lowStockItems = await AnalyticsService.getLowStockItems(practiceId);

    if (locationId) {
      return lowStockItems.filter(item => item.locationId === locationId);
    }

    return lowStockItems;
  }

  private async generateReorderSuggestions(
    lowStockItems: LowStockItemDTO[]
  ): Promise<ExtendedReorderSuggestion[]> {
    return lowStockItems.map(item => ({
      product_id: item.productId,
      product_name: item.productName,
      sku: item.productSku ?? '',
      location_id: item.locationId ?? '',
      location_name: item.locationName ?? '',
      current_stock: item.currentQuantity,
      minimum_stock: item.minimumQuantity,
      reorder_point: null,
      calculated_order_quantity: Math.max(
        item.minimumQuantity * 2 - item.currentQuantity,
        item.minimumQuantity
      ),
      unit_price: item.unitPrice ?? 0,
      preferred_supplier_id: item.preferredSupplierId ?? null,
      preferred_supplier_name: '', // Will be populated by supplier splitting
      urgency_level:
        item.currentQuantity <= 0
          ? 'urgent'
          : item.currentQuantity <= item.minimumQuantity / 2
            ? 'high'
            : 'medium',
      estimated_cost: 0, // Will be calculated
      lead_time_days: 7, // Default
      practice_id: '', // Will be set by caller
      last_ordered_at: null,
      stock_trend: 'decreasing',
    }));
  }

  private async createDraftOrderForApproval(
    practiceId: string,
    items: ExtendedReorderSuggestion[]
  ): Promise<OrderResult> {
    // Create draft order list for manual approval
    const totalValue = items.reduce(
      (sum, item) => sum + item.calculated_order_quantity * item.unit_price,
      0
    );

    const { data: orderList, error } = await supabase
      .from('order_lists')
      .insert({
        practice_id: practiceId,
        location_id: items[0]?.location_id ?? '', // Use first item's location
        name: `Auto-reorder ${new Date().toLocaleDateString()}`,
        description: 'Automatic reorder requiring approval',
        status: 'draft',
        total_items: items.length,
        total_value: totalValue,
      } as any) // Cast to any due to optional field differences
      .select()
      .single();

    if (error) throw error;
    if (!orderList) throw new Error('Failed to create order list');

    // Add items to order list
    const orderItems = items.map(item => ({
      order_list_id: orderList.id,
      product_id: item.product_id,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      suggested_quantity: item.calculated_order_quantity,
      ordered_quantity: item.calculated_order_quantity,
      unit_price: item.unit_price ?? 0,
    }));

    await supabase.from('order_list_items').insert(orderItems as any);

    return {
      orderId: orderList.id,
      supplierOrders: [],
      sendingResults: [],
      totalItems: items.length,
      totalValue: totalValue,
      status: 'success',
      errors: [],
    };
  }

  private async recordSupplierOrders(
    supplierOrders: SupplierOrder[],
    sendingResults: OrderSendingResult[]
  ): Promise<void> {
    // Record orders in supplier_orders table for tracking
    for (let i = 0; i < supplierOrders.length; i++) {
      const order = supplierOrders[i];
      const result = sendingResults[i];

      if (!order || !result) {
        orderLogger.warn('Skipping order record due to missing data', { i });
        continue;
      }

      await supabase.from('supplier_orders').insert({
        supplier_id: order.supplier_id,
        order_list_id: null,
        method_used: order.order_method,
        sent_at: result.sent_at ?? new Date().toISOString(),
        delivery_expected: order.estimated_delivery_date ?? null,
        total_items: order.total_items ?? null,
        total_value: (order as any).total_value ?? null,
        response_data: {
          status: result.status,
          order_reference: result.order_reference ?? null,
          tracking_info: result.tracking_info ?? null,
          error: result.error_message ?? null,
        },
        status: result.status,
        tracking_info: result.tracking_info ?? null,
      } as any); // Cast to any due to complex types
    }
  }

  private async updateStockReservations(
    items: ExtendedReorderSuggestion[],
    action: 'reserve' | 'unreserve'
  ): Promise<void> {
    for (const item of items) {
      const quantityChange =
        action === 'reserve'
          ? item.calculated_order_quantity
          : -item.calculated_order_quantity;

      if (!item.location_id) {
        orderLogger.warn('Skipping reservation update - no location_id', {
          item,
        });
        continue;
      }

      // Get current stock level
      const { data: stockLevel } = await supabase
        .from('stock_levels')
        .select('reserved_quantity')
        .eq('product_id', item.product_id)
        .eq('location_id', item.location_id)
        .single();

      const currentReserved = stockLevel?.reserved_quantity ?? 0;
      const newReserved = currentReserved + quantityChange;

      await supabase
        .from('stock_levels')
        .update({
          reserved_quantity: Math.max(0, newReserved),
        })
        .eq('product_id', item.product_id)
        .eq('location_id', item.location_id);
    }
  }

  private async createOrderNotification(
    supplierId: string,
    supplierName: string,
    orderReference: string,
    type: 'success' | 'error',
    practiceId: string,
    errorMessage?: string
  ): Promise<void> {
    const title =
      type === 'success' ? 'Bestelling verzonden' : 'Bestelling mislukt';

    const message =
      type === 'success'
        ? `Bestelling ${orderReference} is succesvol verzonden naar ${supplierName}`
        : `Bestelling naar ${supplierName} is mislukt: ${errorMessage}`;

    await supabase.from('notifications').insert({
      practice_id: practiceId,
      title,
      message,
      category: 'order_update',
      priority: type === 'error' ? 'high' : 'normal',
      action_url: '/orders',
      action_label: 'Bekijk bestellingen',
    } as any); // Cast due to optional field differences
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const centralOrderService = new CentralOrderService();
