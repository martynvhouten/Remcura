import { supabase } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';
import {
  centralOrderService,
  type AutoReorderConfig,
} from '@/services/orderOrchestration/centralOrderService';
import { AnalyticsService } from '@/services/analytics';
import type { LowStockItemDTO } from '@/types/analytics';

export interface AutomationSchedule {
  practiceId: string;
  enabled: boolean;
  scheduleType: 'daily' | 'weekly' | 'monthly';
  scheduleTime: string; // HH:MM format
  scheduleDays?: number[]; // 0-6, Sunday-Saturday for weekly
  scheduleDate?: number; // 1-31 for monthly
  lastRun?: string;
  nextRun?: string;
}

export interface DeliveryProcessingResult {
  orderId: string;
  itemsProcessed: number;
  stockUpdated: boolean;
  notificationSent: boolean;
  errors: string[];
}

/**
 * Inventory Automation Service
 *
 * Handles automated inventory operations:
 * - Low stock detection and alerts
 * - Scheduled automatic reordering
 * - Delivery processing and stock updates
 * - Inventory analytics and reporting
 */
export class InventoryAutomationService {
  /**
   * Check for low stock items across all locations
   */
  async checkLowStockItems(
    practiceId: string,
    locationId?: string
  ): Promise<
    (LowStockItemDTO & {
      urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
      daysOutOfStock?: number;
    })[]
  > {
    const items = await AnalyticsService.getLowStockItems(practiceId);
    const filteredItems = locationId
      ? items.filter(item => item.locationId === locationId)
      : items;

    return filteredItems.map(item => {
      const urgencyLevel = this.calculateUrgencyLevel(
        item.currentQuantity,
        item.minimumQuantity,
        item.minimumQuantity
      );

      const daysOutOfStock =
        item.currentQuantity <= 0
          ? this.calculateDaysOutOfStock((item as any).lastMovementAt ?? new Date().toISOString())
          : undefined;

      return {
        ...item,
        urgencyLevel,
        daysOutOfStock,
      };
    });
  }

  /**
   * Generate reorder suggestions based on stock analysis
   */
  async generateReorderSuggestions(practiceId: string): Promise<any[]> {
    try {
      inventoryLogger.info(
        `Generating reorder suggestions for practice ${practiceId}`
      );

      const lowStockItems = await this.checkLowStockItems(practiceId);

      if (lowStockItems.length === 0) {
        return [];
      }

      // Get supplier information for items with preferred suppliers
      const supplierIds = lowStockItems
        .map(item => item.preferredSupplierId)
        .filter(Boolean) as string[];

      let suppliers: any[] = [];
      if (supplierIds.length > 0) {
        const { data: supplierData } = await supabase
          .from('suppliers')
          .select('id, name, minimum_order_amount, lead_time_days')
          .in('id', supplierIds);
        suppliers = supplierData || [];
      }

      // Generate suggestions with supplier information
      const suggestions = lowStockItems.map(item => {
        const supplier = suppliers.find(s => s.id === item.preferredSupplierId);

        // Calculate suggested order quantity
        const suggestedQuantity = this.calculateOrderQuantity(
          item.currentQuantity,
          item.minimumQuantity,
          item.minimumQuantity
        );

        return {
          ...item,
          suggestedQuantity,
          supplierName: supplier?.name || 'No preferred supplier',
          minimumOrderAmount: supplier?.minimum_order_amount || 0,
          leadTimeDays: supplier?.lead_time_days || 7,
          estimatedCost: suggestedQuantity * 10, // Placeholder - would need product pricing
          priority: item.urgencyLevel === 'critical' ? 'urgent' : 'normal',
        };
      });

      return suggestions;
    } catch (error) {
      inventoryLogger.error(
        'Error generating reorder suggestions:',
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) }
      );
      throw error;
    }
  }

  /**
   * Schedule and execute automatic reorders
   */
  async scheduleAutomaticReorders(): Promise<void> {
    try {
      inventoryLogger.info('Running scheduled automatic reorders');

      // Get all practices with automation enabled
      const { data: practices, error } = await supabase
        .from('practice_inventory_settings')
        .select(
          `
          practice_id,
          auto_reorder_enabled,
          practices!inner(id, name)
        `
        )
        .eq('auto_reorder_enabled', true);

      if (error) throw error;

      if (!practices?.length) {
        inventoryLogger.info('No practices have automatic reordering enabled');
        return;
      }

      // Process each practice
      for (const practice of practices) {
        try {
          const config: AutoReorderConfig = {
            practiceId: practice.practice_id,
            enableLowStockReorder: true,
            enableScheduledReorder: true,
            approvalRequired: false, // For scheduled orders, we assume approval is not required
            maxOrderValue: 1000, // Default limit for automatic orders
          };

          const result =
            await centralOrderService.processAutomaticReorder(config);

          if (result.status === 'success' && result.totalItems > 0) {
            inventoryLogger.info(
              `Successfully processed automatic reorder for ${practice.practices.name}: ` +
                `${result.totalItems} items, €${result.totalValue.toFixed(2)}`
            );

            // Create success notification
            await this.createAutomationNotification(
              practice.practice_id,
              'Automatische bestelling geplaatst',
              `${
                result.totalItems
              } producten besteld voor €${result.totalValue.toFixed(2)}`,
              'success'
            );
          } else if (result.errors.length > 0) {
            inventoryLogger.warn(
              `Partial success for automatic reorder for ${practice.practices.name}: ` +
                `${result.errors.length} errors`
            );

            // Create warning notification
            await this.createAutomationNotification(
              practice.practice_id,
              'Automatische bestelling gedeeltelijk mislukt',
              `${result.errors.length} fouten opgetreden bij bestelling`,
              'warning'
            );
          }
        } catch (practiceError) {
          inventoryLogger.error(
            `Error processing automatic reorder for practice ${practice.practice_id}:`,
            practiceError instanceof Error
              ? { message: practiceError.message, stack: practiceError.stack }
              : { error: String(practiceError) }
          );

          // Create error notification
          await this.createAutomationNotification(
            practice.practice_id,
            'Automatische bestelling mislukt',
            'Er is een fout opgetreden bij de automatische bestelling',
            'error'
          );
        }
      }
    } catch (error) {
      inventoryLogger.error(
        'Error in scheduled automatic reorders:',
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) }
      );
      throw error;
    }
  }

  /**
   * Process incoming deliveries and update stock
   */
  async processIncomingDeliveries(): Promise<DeliveryProcessingResult[]> {
    try {
      inventoryLogger.info('Processing incoming deliveries');

      // Get orders that are marked as delivered but not yet processed
      const { data: deliveredOrders, error } = await supabase
        .from('supplier_orders')
        .select(
          `
          id,
          order_list_id,
          supplier_id,
          status,
          delivery_expected,
          delivery_confirmed_at,
          tracking_info,
          suppliers(name)
        `
        )
        .eq('status', 'delivered');

      if (error) throw error;

      if (!deliveredOrders?.length) {
        inventoryLogger.info('No delivered orders to process');
        return [];
      }

      const results: DeliveryProcessingResult[] = [];

      for (const order of deliveredOrders) {
        try {
          // Update stock for this order
          await centralOrderService.updateStockAfterDelivery(order.id);

          // Mark order as completed
          await supabase
            .from('supplier_orders')
            .update({
              status: 'completed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', order.id);

          results.push({
            orderId: order.id,
            itemsProcessed: 0, // Would need to count items
            stockUpdated: true,
            notificationSent: true,
            errors: [],
          });

          // Extract tracking number from tracking_info JSON if available
          const trackingNumber = order.tracking_info
            ? (order.tracking_info as any)?.trackingNumber || 'N/A'
            : 'N/A';

          inventoryLogger.info(
            `Successfully processed delivery for order ${order.id} (tracking: ${trackingNumber}) ` +
              `from ${order.suppliers?.name ?? 'Unknown supplier'}`
          );
        } catch (orderError) {
          inventoryLogger.error(
            `Error processing delivery for order ${order.id}:`,
            orderError instanceof Error
              ? { message: orderError.message, stack: orderError.stack }
              : { error: String(orderError) }
          );

          results.push({
            orderId: order.id,
            itemsProcessed: 0,
            stockUpdated: false,
            notificationSent: false,
            errors: [
              orderError instanceof Error
                ? orderError.message
                : 'Unknown error',
            ],
          });
        }
      }

      return results;
    } catch (error) {
      inventoryLogger.error(
        'Error processing incoming deliveries:',
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) }
      );
      throw error;
    }
  }

  /**
   * Run comprehensive inventory health check
   */
  async runInventoryHealthCheck(practiceId: string): Promise<{
    lowStockCount: number;
    expiredBatchCount: number;
    expiringBatchCount: number;
    zeroStockCount: number;
    overStockCount: number;
    recommendations: string[];
  }> {
    try {
      inventoryLogger.info(
        `Running inventory health check for practice ${practiceId}`
      );

      // Check low stock items
      const lowStockItems = await this.checkLowStockItems(practiceId);
      const zeroStockItems = lowStockItems.filter(
        item => item.currentQuantity <= 0
      );

      // Check expired batches
      const { data: expiredBatches } = await supabase
        .from('product_batches')
        .select('id')
        .eq('practice_id', practiceId)
        .lt('expiry_date', new Date().toISOString().split('T')[0])
        .eq('status', 'active');

      // Check expiring batches (next 30 days)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const { data: expiringBatches } = await supabase
        .from('product_batches')
        .select('id')
        .eq('practice_id', practiceId)
        .gte('expiry_date', new Date().toISOString().split('T')[0])
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .eq('status', 'active');

      // Check overstock items (above maximum quantity)
      const { data: overStockData } = await supabase
        .from('stock_levels')
        .select('id, current_quantity, maximum_quantity')
        .eq('practice_id', practiceId)
        .not('maximum_quantity', 'is', null);
      
      const overStockItems = (overStockData || []).filter(
        (item: any) => item.current_quantity > (item.maximum_quantity ?? 0)
      );

      // Generate recommendations
      const recommendations = [];

      if (lowStockItems.length > 0) {
        recommendations.push(
          `${lowStockItems.length} producten hebben lage voorraad en moeten worden besteld`
        );
      }

      if (zeroStockItems.length > 0) {
        recommendations.push(
          `${zeroStockItems.length} producten zijn uitverkocht - prioriteit bestelling nodig`
        );
      }

      if (expiredBatches?.length) {
        recommendations.push(
          `${expiredBatches.length} batches zijn verlopen en moeten worden weggegooid`
        );
      }

      if (expiringBatches?.length) {
        recommendations.push(
          `${expiringBatches.length} batches verlopen binnen 30 dagen - gebruik eerst`
        );
      }

      if (overStockItems?.length) {
        recommendations.push(
          `${overStockItems.length} producten hebben overvoorraad - overweeg minder te bestellen`
        );
      }

      return {
        lowStockCount: lowStockItems.length,
        expiredBatchCount: expiredBatches?.length || 0,
        expiringBatchCount: expiringBatches?.length || 0,
        zeroStockCount: zeroStockItems.length,
        overStockCount: overStockItems?.length || 0,
        recommendations,
      };
    } catch (error) {
      inventoryLogger.error(
        'Error running inventory health check:',
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { error: String(error) }
      );
      throw error;
    }
  }

  // Private helper methods

  private calculateUrgencyLevel(
    currentQuantity: number,
    minimumQuantity: number,
    reorderPoint: number
  ): 'low' | 'medium' | 'high' | 'critical' {
    if (currentQuantity <= 0) return 'critical';
    if (currentQuantity <= minimumQuantity / 2) return 'high';
    if (currentQuantity <= minimumQuantity) return 'medium';
    if (currentQuantity <= reorderPoint) return 'low';
    return 'low';
  }

  private calculateDaysOutOfStock(lastMovementAt: string): number {
    const lastMovement = new Date(lastMovementAt);
    const now = new Date();
    return Math.floor(
      (now.getTime() - lastMovement.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  private calculateOrderQuantity(
    currentQuantity: number,
    minimumQuantity: number,
    reorderPoint: number
  ): number {
    // Order enough to reach double the minimum quantity, or at least the reorder point
    const targetQuantity = Math.max(minimumQuantity * 2, reorderPoint);
    return Math.max(targetQuantity - currentQuantity, minimumQuantity);
  }

  private async createAutomationNotification(
    practiceId: string,
    title: string,
    message: string,
    type: 'success' | 'warning' | 'error'
  ): Promise<void> {
    const priority =
      type === 'error' ? 'high' : type === 'warning' ? 'normal' : 'low';

    await supabase.from('notifications').insert({
      practice_id: practiceId,
      title,
      message,
      category: 'system_notification',
      priority,
      action_url: '/inventory/levels',
      action_label: 'Bekijk voorraad',
    });
  }
}

// Export singleton instance
export const inventoryAutomationService = new InventoryAutomationService();
