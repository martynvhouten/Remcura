import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import { useOrderListsSupplierSplitting, type SupplierOrder, type OrderSendingResult } from '@/stores/orderLists/orderLists-supplier-splitting';
import { useInventoryMovements } from '@/stores/inventory/inventory-movements';
import type { ReorderSuggestion } from '@/stores/orderLists/orderLists-minmax';

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
  status: 'pending' | 'sent' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
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
  async processAutomaticReorder(config: AutoReorderConfig): Promise<OrderResult> {
    try {
      orderLogger.info(`Starting automatic reorder for practice ${config.practiceId}`);

      // 1. Get low stock items that need reordering
      const lowStockItems = await this.getLowStockItems(config.practiceId, config.locationId);
      
      if (lowStockItems.length === 0) {
        orderLogger.info('No items need reordering');
        return {
          orderId: '',
          supplierOrders: [],
          sendingResults: [],
          totalItems: 0,
          totalValue: 0,
          status: 'success',
          errors: []
        };
      }

      // 2. Generate reorder suggestions
      const reorderSuggestions = await this.generateReorderSuggestions(lowStockItems);

      // 3. Check approval requirements
      const totalValue = reorderSuggestions.reduce((sum, item) => 
        sum + (item.calculated_order_quantity * item.unit_price), 0);

      if (config.approvalRequired || (config.maxOrderValue && totalValue > config.maxOrderValue)) {
        // Create draft order list for approval
        return await this.createDraftOrderForApproval(config.practiceId, reorderSuggestions);
      }

      // 4. Process automatic order
      return await this.createMultiSupplierOrder(reorderSuggestions);

    } catch (error) {
      orderLogger.error('Error in automatic reorder process:', error);
      throw error;
    }
  }

  /**
   * Create multi-supplier order from reorder suggestions
   */
  async createMultiSupplierOrder(items: ReorderSuggestion[]): Promise<OrderResult> {
    try {
      orderLogger.info(`Creating multi-supplier order for ${items.length} items`);

      // 1. Split items by supplier
      const splitResult = await this.supplierSplittingService.splitOrderBySuppliers(items);
      
      if (!splitResult.success) {
        throw new Error('Failed to split order by suppliers');
      }

      // 2. Send orders to suppliers
      const sendingResults = await this.sendOrdersToSuppliers(splitResult.supplierOrders);

      // 3. Record orders in database
      await this.recordSupplierOrders(splitResult.supplierOrders, sendingResults);

      // 4. Update stock reservations
      await this.updateStockReservations(items, 'reserve');

      const totalItems = splitResult.supplierOrders.reduce((sum, order) => sum + order.total_items, 0);
      const totalValue = splitResult.supplierOrders.reduce((sum, order) => sum + order.total_value, 0);
      
      const errors = sendingResults.filter(result => result.status === 'failed')
        .map(result => result.error_message || 'Unknown error');

      return {
        orderId: this.generateOrderId(),
        supplierOrders: splitResult.supplierOrders,
        sendingResults,
        totalItems,
        totalValue,
        status: errors.length === 0 ? 'success' : 
                errors.length < sendingResults.length ? 'partial' : 'failed',
        errors
      };

    } catch (error) {
      orderLogger.error('Error creating multi-supplier order:', error);
      throw error;
    }
  }

  /**
   * Send orders to multiple suppliers
   */
  async sendOrdersToSuppliers(orders: SupplierOrder[]): Promise<OrderSendingResult[]> {
    try {
      const results = await this.supplierSplittingService.sendOrdersToSuppliers(orders);
      
      // Create notifications for successful orders
      for (const result of results) {
        if (result.status === 'sent' || result.status === 'confirmed') {
          await this.createOrderNotification(
            result.supplier_id,
            result.supplier_name,
            result.order_reference || '',
            'success'
          );
        } else if (result.status === 'failed') {
          await this.createOrderNotification(
            result.supplier_id,
            result.supplier_name,
            result.order_reference || '',
            'error',
            result.error_message
          );
        }
      }

      return results;
    } catch (error) {
      orderLogger.error('Error sending orders to suppliers:', error);
      throw error;
    }
  }

  /**
   * Track order status across suppliers
   */
  async trackOrderStatus(orderIds: string[]): Promise<OrderStatus[]> {
    try {
      const { data, error } = await supabase
        .from('supplier_orders')
        .select(`
          id,
          order_reference,
          status,
          tracking_number,
          estimated_delivery_date,
          actual_delivery_date,
          updated_at,
          suppliers(id, name)
        `)
        .in('id', orderIds);

      if (error) throw error;

      return (data || []).map(order => ({
        orderId: order.id,
        supplierOrderId: order.id,
        supplierId: order.suppliers.id,
        supplierName: order.suppliers.name,
        status: order.status,
        orderReference: order.order_reference,
        trackingNumber: order.tracking_number,
        estimatedDelivery: order.estimated_delivery_date,
        actualDelivery: order.actual_delivery_date,
        lastUpdated: order.updated_at
      }));

    } catch (error) {
      orderLogger.error('Error tracking order status:', error);
      throw error;
    }
  }

  /**
   * Update stock levels after delivery confirmation
   */
  async updateStockAfterDelivery(orderId: string): Promise<void> {
    try {
      orderLogger.info(`Updating stock after delivery for order ${orderId}`);

      // Get order items
      const { data: orderItems, error } = await supabase
        .from('supplier_order_items')
        .select(`
          product_id,
          quantity_ordered,
          quantity_received,
          supplier_orders!inner(practice_id, location_id)
        `)
        .eq('supplier_order_id', orderId);

      if (error) throw error;

      if (!orderItems?.length) {
        orderLogger.warn(`No items found for order ${orderId}`);
        return;
      }

      // Update stock levels for each item
      const inventoryMovements = useInventoryMovements(
        { value: orderItems[0].supplier_orders.practice_id },
        { value: 'system' }, // System user
        async () => {} // fetchStockLevels callback
      );

      for (const item of orderItems) {
        const quantityReceived = item.quantity_received || item.quantity_ordered;
        
        await inventoryMovements.updateStockLevel({
          practice_id: item.supplier_orders.practice_id,
          location_id: item.supplier_orders.location_id,
          product_id: item.product_id,
          quantity_change: quantityReceived,
          movement_type: 'order_received',
          reference_type: 'supplier_order',
          reference_id: orderId,
          reason: `Stock received from supplier order ${orderId}`,
          batch_number: null,
          expiry_date: null
        });
      }

      // Update stock reservations (unreserve)
      await this.updateStockReservations(
        orderItems.map(item => ({
          product_id: item.product_id,
          calculated_order_quantity: item.quantity_ordered,
          practice_id: item.supplier_orders.practice_id,
          location_id: item.supplier_orders.location_id
        })) as ReorderSuggestion[],
        'unreserve'
      );

      // Create notification
      await supabase.from('notifications').insert({
        practice_id: orderItems[0].supplier_orders.practice_id,
        title: 'Bestelling ontvangen',
        message: `Voorraad is bijgewerkt voor ${orderItems.length} producten`,
        category: 'order_update',
        priority: 'normal',
        action_url: '/inventory/levels',
        action_label: 'Bekijk voorraad'
      });

      orderLogger.info(`Successfully updated stock for ${orderItems.length} items`);

    } catch (error) {
      orderLogger.error('Error updating stock after delivery:', error);
      throw error;
    }
  }

  // Private helper methods

  private async getLowStockItems(practiceId: string, locationId?: string): Promise<any[]> {
    let query = supabase
      .from('stock_levels')
      .select(`
        id,
        product_id,
        location_id,
        current_quantity,
        minimum_quantity,
        reorder_point,
        preferred_supplier_id,
        products!inner(name, sku, unit_price),
        practice_locations!inner(name)
      `)
      .eq('practice_id', practiceId)
      .lt('current_quantity', supabase.rpc('minimum_quantity'));

    if (locationId) {
      query = query.eq('location_id', locationId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data || [];
  }

  private async generateReorderSuggestions(lowStockItems: any[]): Promise<ReorderSuggestion[]> {
    return lowStockItems.map(item => ({
      product_id: item.product_id,
      product_name: item.products.name,
      sku: item.products.sku,
      location_id: item.location_id,
      location_name: item.practice_locations.name,
      current_stock: item.current_quantity,
      minimum_stock: item.minimum_quantity,
      reorder_point: item.reorder_point,
      calculated_order_quantity: Math.max(
        item.minimum_quantity * 2 - item.current_quantity,
        item.minimum_quantity
      ),
      unit_price: item.products.unit_price || 0,
      preferred_supplier_id: item.preferred_supplier_id,
      preferred_supplier_name: '', // Will be populated by supplier splitting
      urgency_level: item.current_quantity <= 0 ? 'urgent' :
                    item.current_quantity <= item.minimum_quantity / 2 ? 'high' : 'medium',
      estimated_cost: 0, // Will be calculated
      lead_time_days: 7, // Default
      practice_id: '', // Will be set by caller
      last_ordered_at: null,
      stock_trend: 'decreasing'
    }));
  }

  private async createDraftOrderForApproval(
    practiceId: string, 
    items: ReorderSuggestion[]
  ): Promise<OrderResult> {
    // Create draft order list for manual approval
    const { data: orderList, error } = await supabase
      .from('order_lists')
      .insert({
        practice_id: practiceId,
        name: `Auto-reorder ${new Date().toLocaleDateString()}`,
        description: 'Automatic reorder requiring approval',
        status: 'draft',
        total_items: items.length,
        estimated_total: items.reduce((sum, item) => 
          sum + (item.calculated_order_quantity * item.unit_price), 0),
        auto_calculate_quantities: true
      })
      .select()
      .single();

    if (error) throw error;

    // Add items to order list
    const orderItems = items.map(item => ({
      order_list_id: orderList.id,
      product_id: item.product_id,
      current_stock: item.current_stock,
      minimum_stock: item.minimum_stock,
      suggested_quantity: item.calculated_order_quantity,
      ordered_quantity: item.calculated_order_quantity,
      unit_cost: item.unit_price,
      priority: item.urgency_level === 'urgent' ? 'urgent' : 'normal'
    }));

    await supabase.from('order_list_items').insert(orderItems);

    return {
      orderId: orderList.id,
      supplierOrders: [],
      sendingResults: [],
      totalItems: items.length,
      totalValue: orderList.estimated_total,
      status: 'success',
      errors: []
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

      await supabase.from('supplier_orders').insert({
        supplier_id: order.supplier_id,
        practice_id: '', // Will be set from context
        order_reference: result.order_reference,
        status: result.status,
        total_items: order.total_items,
        total_amount: order.total_value,
        currency: 'EUR',
        order_method: order.order_method,
        estimated_delivery_date: order.estimated_delivery_date,
        sent_at: result.sent_at,
        tracking_number: result.tracking_number
      });
    }
  }

  private async updateStockReservations(
    items: ReorderSuggestion[], 
    action: 'reserve' | 'unreserve'
  ): Promise<void> {
    for (const item of items) {
      const quantityChange = action === 'reserve' 
        ? item.calculated_order_quantity 
        : -item.calculated_order_quantity;

      await supabase
        .from('stock_levels')
        .update({
          reserved_quantity: supabase.rpc('reserved_quantity') + quantityChange
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
    errorMessage?: string
  ): Promise<void> {
    const title = type === 'success' 
      ? 'Bestelling verzonden'
      : 'Bestelling mislukt';
    
    const message = type === 'success'
      ? `Bestelling ${orderReference} is succesvol verzonden naar ${supplierName}`
      : `Bestelling naar ${supplierName} is mislukt: ${errorMessage}`;

    await supabase.from('notifications').insert({
      practice_id: '', // Will be set from context
      title,
      message,
      category: 'order_update',
      priority: type === 'error' ? 'high' : 'normal',
      action_url: '/orders',
      action_label: 'Bekijk bestellingen'
    });
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const centralOrderService = new CentralOrderService();