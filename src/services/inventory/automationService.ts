import { supabase } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';
import { centralOrderService, type AutoReorderConfig } from '@/services/orderOrchestration/centralOrderService';

export interface LowStockItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  locationId: string;
  locationName: string;
  currentQuantity: number;
  minimumQuantity: number;
  reorderPoint: number;
  preferredSupplierId?: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  daysOutOfStock?: number;
}

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
  async checkLowStockItems(practiceId: string, locationId?: string): Promise<LowStockItem[]> {
    try {
      inventoryLogger.info(`Checking low stock items for practice ${practiceId}`);

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
          last_movement_at,
          products!inner(name, sku),
          practice_locations!inner(name)
        `)
        .eq('practice_id', practiceId);

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      // Get items where current quantity is below minimum or reorder point
      query = query.or('current_quantity.lt.minimum_quantity,current_quantity.lt.reorder_point');

      const { data, error } = await query.order('current_quantity', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => {
        const urgencyLevel = this.calculateUrgencyLevel(
          item.current_quantity,
          item.minimum_quantity,
          item.reorder_point
        );

        const daysOutOfStock = item.current_quantity <= 0 
          ? this.calculateDaysOutOfStock(item.last_movement_at)
          : undefined;

        return {
          id: item.id,
          productId: item.product_id,
          productName: item.products.name,
          sku: item.products.sku,
          locationId: item.location_id,
          locationName: item.practice_locations.name,
          currentQuantity: item.current_quantity,
          minimumQuantity: item.minimum_quantity,
          reorderPoint: item.reorder_point,
          preferredSupplierId: item.preferred_supplier_id,
          urgencyLevel,
          daysOutOfStock
        };
      });

    } catch (error) {
      inventoryLogger.error('Error checking low stock items:', error);
      throw error;
    }
  }

  /**
   * Generate reorder suggestions based on stock analysis
   */
  async generateReorderSuggestions(practiceId: string): Promise<any[]> {
    try {
      inventoryLogger.info(`Generating reorder suggestions for practice ${practiceId}`);

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
          item.reorderPoint
        );

        return {
          ...item,
          suggestedQuantity,
          supplierName: supplier?.name || 'No preferred supplier',
          minimumOrderAmount: supplier?.minimum_order_amount || 0,
          leadTimeDays: supplier?.lead_time_days || 7,
          estimatedCost: suggestedQuantity * 10, // Placeholder - would need product pricing
          priority: item.urgencyLevel === 'critical' ? 'urgent' : 'normal'
        };
      });

      return suggestions;

    } catch (error) {
      inventoryLogger.error('Error generating reorder suggestions:', error);
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
        .select(`
          practice_id,
          auto_reorder_enabled,
          practices!inner(id, name)
        `)
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
            maxOrderValue: 1000 // Default limit for automatic orders
          };

          const result = await centralOrderService.processAutomaticReorder(config);
          
          if (result.status === 'success' && result.totalItems > 0) {
            inventoryLogger.info(
              `Successfully processed automatic reorder for ${practice.practices.name}: ` +
              `${result.totalItems} items, €${result.totalValue.toFixed(2)}`
            );

            // Create success notification
            await this.createAutomationNotification(
              practice.practice_id,
              'Automatische bestelling geplaatst',
              `${result.totalItems} producten besteld voor €${result.totalValue.toFixed(2)}`,
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
            practiceError
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
      inventoryLogger.error('Error in scheduled automatic reorders:', error);
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
        .select(`
          id,
          order_reference,
          supplier_id,
          practice_id,
          status,
          suppliers(name)
        `)
        .eq('status', 'delivered')
        .is('stock_updated_at', null); // Not yet processed

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

          // Mark order as stock updated
          await supabase
            .from('supplier_orders')
            .update({ 
              stock_updated_at: new Date().toISOString(),
              status: 'completed'
            })
            .eq('id', order.id);

          results.push({
            orderId: order.id,
            itemsProcessed: 0, // Would need to count items
            stockUpdated: true,
            notificationSent: true,
            errors: []
          });

          inventoryLogger.info(
            `Successfully processed delivery for order ${order.order_reference} ` +
            `from ${order.suppliers.name}`
          );

        } catch (orderError) {
          inventoryLogger.error(
            `Error processing delivery for order ${order.id}:`,
            orderError
          );

          results.push({
            orderId: order.id,
            itemsProcessed: 0,
            stockUpdated: false,
            notificationSent: false,
            errors: [orderError instanceof Error ? orderError.message : 'Unknown error']
          });
        }
      }

      return results;

    } catch (error) {
      inventoryLogger.error('Error processing incoming deliveries:', error);
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
      inventoryLogger.info(`Running inventory health check for practice ${practiceId}`);

      // Check low stock items
      const lowStockItems = await this.checkLowStockItems(practiceId);
      const zeroStockItems = lowStockItems.filter(item => item.currentQuantity <= 0);

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
      const { data: overStockItems } = await supabase
        .from('stock_levels')
        .select('id')
        .eq('practice_id', practiceId)
        .not('maximum_quantity', 'is', null)
        .gt('current_quantity', supabase.rpc('maximum_quantity'));

      // Generate recommendations
      const recommendations = [];
      
      if (lowStockItems.length > 0) {
        recommendations.push(`${lowStockItems.length} producten hebben lage voorraad en moeten worden besteld`);
      }
      
      if (zeroStockItems.length > 0) {
        recommendations.push(`${zeroStockItems.length} producten zijn uitverkocht - prioriteit bestelling nodig`);
      }
      
      if (expiredBatches?.length) {
        recommendations.push(`${expiredBatches.length} batches zijn verlopen en moeten worden weggegooid`);
      }
      
      if (expiringBatches?.length) {
        recommendations.push(`${expiringBatches.length} batches verlopen binnen 30 dagen - gebruik eerst`);
      }
      
      if (overStockItems?.length) {
        recommendations.push(`${overStockItems.length} producten hebben overvoorraad - overweeg minder te bestellen`);
      }

      return {
        lowStockCount: lowStockItems.length,
        expiredBatchCount: expiredBatches?.length || 0,
        expiringBatchCount: expiringBatches?.length || 0,
        zeroStockCount: zeroStockItems.length,
        overStockCount: overStockItems?.length || 0,
        recommendations
      };

    } catch (error) {
      inventoryLogger.error('Error running inventory health check:', error);
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
    return Math.floor((now.getTime() - lastMovement.getTime()) / (1000 * 60 * 60 * 24));
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
    const priority = type === 'error' ? 'high' : type === 'warning' ? 'normal' : 'low';

    await supabase.from('notifications').insert({
      practice_id: practiceId,
      title,
      message,
      category: 'system_notification',
      priority,
      action_url: '/inventory/levels',
      action_label: 'Bekijk voorraad'
    });
  }
}

// Export singleton instance
export const inventoryAutomationService = new InventoryAutomationService();