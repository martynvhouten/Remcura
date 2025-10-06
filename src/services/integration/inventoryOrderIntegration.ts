import { centralOrderService } from '@/services/orderOrchestration/centralOrderService';
import { inventoryAutomationService } from '@/services/inventory/automationService';
import { supabase } from '@/boot/supabase';
import { orderLogger, toLogData } from '@/utils/logger';

/**
 * Integration Service for Inventory & Order Management
 *
 * This service provides high-level integration between:
 * - Inventory automation
 * - Order orchestration
 * - Real-time notifications
 * - Dashboard updates
 */
export class InventoryOrderIntegrationService {
  /**
   * Initialize automated inventory management for a practice
   */
  async initializeAutomation(practiceId: string): Promise<{
    lowStockItems: number;
    automationEnabled: boolean;
    schedulesCreated: number;
    notificationsEnabled: boolean;
  }> {
    try {
      orderLogger.info(`Initializing automation for practice ${practiceId}`);

      // 1. Run initial inventory health check
      const healthCheck =
        await inventoryAutomationService.runInventoryHealthCheck(practiceId);

      // 2. Check if automation is already enabled
      const { data: settings } = await supabase
        .from('practice_inventory_settings')
        .select('auto_reorder_enabled')
        .eq('practice_id', practiceId)
        .single();

      let automationEnabled = settings?.auto_reorder_enabled || false;

      // 3. Enable automation if not already enabled and there are actionable items
      if (!automationEnabled && healthCheck.lowStockCount > 0) {
        await supabase.from('practice_inventory_settings').upsert({
          practice_id: practiceId,
          auto_reorder_enabled: true,
          low_stock_threshold_percent: 20,
          notify_on_low_stock: true,
          notify_on_stock_out: true,
        });
        automationEnabled = true;
      }

      // 4. Create default automation schedule if none exists
      const { data: existingSchedules } = await supabase
        .from('automation_schedules')
        .select('id')
        .eq('practice_id', practiceId);

      let schedulesCreated = 0;
      if (!existingSchedules?.length && automationEnabled) {
        await supabase.from('automation_schedules').insert({
          practice_id: practiceId,
          name: 'Daily Low Stock Check',
          description:
            'Automatically check for low stock items and create orders',
          schedule_type: 'daily',
          schedule_time: '09:00',
          auto_approve: false,
          max_order_value: 1000,
          min_urgency_level: 'medium',
        } as any);
        schedulesCreated = 1;
      }

      // 5. Create initial notifications for critical items
      const criticalItems = await inventoryAutomationService.checkLowStockItems(
        practiceId
      );
      const urgentItems = criticalItems.filter(
        item => item.urgencyLevel === 'critical'
      );

      if (urgentItems.length > 0) {
        await supabase.from('notifications').insert({
          practice_id: practiceId,
          title: 'Kritieke voorraadtekorten gedetecteerd',
          message: `${urgentItems.length} producten zijn uitverkocht en hebben directe aandacht nodig`,
          category: 'stock_alert',
          priority: 'urgent',
          action_url: '/inventory/levels',
          action_label: 'Bekijk voorraad',
        });
      }

      return {
        lowStockItems: healthCheck.lowStockCount,
        automationEnabled,
        schedulesCreated,
        notificationsEnabled: true,
      };
    } catch (error) {
      orderLogger.error('Error initializing automation:', toLogData(error));
      throw error;
    }
  }

  /**
   * Process a complete reorder workflow
   */
  async processCompleteReorderWorkflow(
    practiceId: string,
    options: {
      locationId?: string;
      autoApprove?: boolean;
      maxOrderValue?: number;
      urgencyFilter?: 'low' | 'medium' | 'high' | 'critical';
    } = {}
  ): Promise<{
    itemsAnalyzed: number;
    itemsToOrder: number;
    ordersCreated: number;
    totalValue: number;
    status: 'success' | 'partial' | 'failed';
    details: string[];
  }> {
    try {
      orderLogger.info(
        `Processing complete reorder workflow for practice ${practiceId}`
      );

      // 1. Generate reorder suggestions
      const suggestions =
        await inventoryAutomationService.generateReorderSuggestions(practiceId);

      // 2. Apply filters
      let filteredSuggestions = suggestions;

      if (options.locationId) {
        filteredSuggestions = filteredSuggestions.filter(
          s => s.locationId === options.locationId
        );
      }

      if (options.urgencyFilter) {
        const urgencyLevels = ['low', 'medium', 'high', 'critical'];
        const minIndex = urgencyLevels.indexOf(options.urgencyFilter);
        filteredSuggestions = filteredSuggestions.filter(
          s => urgencyLevels.indexOf(s.urgencyLevel) >= minIndex
        );
      }

      if (filteredSuggestions.length === 0) {
        return {
          itemsAnalyzed: suggestions.length,
          itemsToOrder: 0,
          ordersCreated: 0,
          totalValue: 0,
          status: 'success',
          details: ['No items need reordering with current filters'],
        };
      }

      // 3. Calculate total value and check approval requirements
      const totalValue = filteredSuggestions.reduce(
        (sum, item) => sum + item.suggestedQuantity * item.estimatedCost,
        0
      );

      const needsApproval =
        !options.autoApprove ||
        (options.maxOrderValue && totalValue > options.maxOrderValue);

      // 4. Transform suggestions to reorder format
      const reorderItems = filteredSuggestions.map(suggestion => ({
        product_id: suggestion.productId,
        product_name: suggestion.productName,
        sku: suggestion.sku,
        location_id: suggestion.locationId,
        location_name: suggestion.locationName,
        current_stock: suggestion.currentQuantity,
        minimum_stock: suggestion.minimumQuantity,
        reorder_point: suggestion.reorderPoint,
        calculated_order_quantity: suggestion.suggestedQuantity,
        unit_price: suggestion.estimatedCost,
        preferred_supplier_id: suggestion.preferredSupplierId,
        preferred_supplier_name: suggestion.supplierName,
        urgency_level: suggestion.urgencyLevel,
        estimated_cost: suggestion.estimatedCost * suggestion.suggestedQuantity,
        lead_time_days: suggestion.leadTimeDays,
        practice_id: practiceId,
        last_ordered_at: null,
        stock_trend: 'decreasing',
      }));

      // 5. Process the order
      if (needsApproval) {
        // Create draft order for approval
        const result = await centralOrderService.createMultiSupplierOrder(
          reorderItems
        );

        // Create notification for approval
        await supabase.from('notifications').insert({
          practice_id: practiceId,
          title: 'Bestelling wacht op goedkeuring',
          message: `Automatische bestelling van €${totalValue.toFixed(
            2
          )} wacht op goedkeuring`,
          category: 'order_update',
          priority: 'normal',
          action_url: '/orders',
          action_label: 'Bekijk bestelling',
        });

        return {
          itemsAnalyzed: suggestions.length,
          itemsToOrder: filteredSuggestions.length,
          ordersCreated: result.supplierOrders.length,
          totalValue,
          status: 'success',
          details: ['Order created and waiting for approval'],
        };
      } else {
        // Process automatic order
        const result = await centralOrderService.createMultiSupplierOrder(
          reorderItems
        );

        return {
          itemsAnalyzed: suggestions.length,
          itemsToOrder: filteredSuggestions.length,
          ordersCreated: result.supplierOrders.length,
          totalValue,
          status: result.status,
          details:
            result.errors.length > 0
              ? result.errors
              : ['Orders processed successfully'],
        };
      }
    } catch (error) {
      orderLogger.error('Error in complete reorder workflow:', toLogData(error));
      return {
        itemsAnalyzed: 0,
        itemsToOrder: 0,
        ordersCreated: 0,
        totalValue: 0,
        status: 'failed',
        details: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Monitor and process delivery updates
   */
  async processDeliveryUpdates(): Promise<{
    ordersChecked: number;
    deliveriesProcessed: number;
    stockUpdates: number;
    errors: string[];
  }> {
    try {
      orderLogger.info('Processing delivery updates');

      // 1. Process incoming deliveries
      const deliveryResults =
        await inventoryAutomationService.processIncomingDeliveries();

      // 2. Check for overdue orders and send notifications
      const { data: overdueOrders } = await supabase
        .from('supplier_orders')
        .select(
          `
          id,
          delivery_expected,
          suppliers(name)
        `
        )
        .eq('status', 'shipped')
        .lt('delivery_expected', new Date().toISOString().split('T')[0]);

      // Create notifications for overdue orders
      for (const order of overdueOrders || []) {
        const orderAny = order as any;
        await supabase.from('notifications').insert({
          practice_id: orderAny.practice_id ?? '',
          title: 'Bestelling is verlaat',
          message: `Bestelling ${orderAny.id} had ${orderAny.delivery_expected} moeten aankomen`,
          category: 'order_update',
          priority: 'normal',
          action_url: '/orders',
          action_label: 'Bekijk bestelling',
        } as any);
      }

      const successfulDeliveries = deliveryResults.filter(
        r => r.stockUpdated
      ).length;
      const totalErrors = deliveryResults.reduce(
        (sum, r) => sum + r.errors.length,
        0
      );

      return {
        ordersChecked: deliveryResults.length + (overdueOrders?.length || 0),
        deliveriesProcessed: successfulDeliveries,
        stockUpdates: successfulDeliveries,
        errors: deliveryResults.flatMap(r => r.errors),
      };
    } catch (error) {
      orderLogger.error('Error processing delivery updates:', toLogData(error));
      throw error;
    }
  }

  /**
   * Generate comprehensive inventory dashboard data
   */
  async generateInventoryDashboardData(practiceId: string): Promise<{
    healthCheck: any;
    lowStockItems: any[];
    reorderSuggestions: any[];
    recentOrders: any[];
    pendingDeliveries: any[];
    automationStatus: any;
  }> {
    try {
      orderLogger.info(
        `Generating inventory dashboard data for practice ${practiceId}`
      );

      // Run all data collection in parallel for better performance
      const [
        healthCheck,
        lowStockItems,
        reorderSuggestions,
        recentOrders,
        pendingDeliveries,
        automationSettings,
      ] = await Promise.all([
        inventoryAutomationService.runInventoryHealthCheck(practiceId),
        inventoryAutomationService.checkLowStockItems(practiceId),
        inventoryAutomationService.generateReorderSuggestions(practiceId),
        this.getRecentOrders(practiceId),
        this.getPendingDeliveries(practiceId),
        this.getAutomationStatus(practiceId),
      ]);

      return {
        healthCheck,
        lowStockItems: lowStockItems.slice(0, 10), // Top 10 most urgent
        reorderSuggestions: reorderSuggestions.slice(0, 10), // Top 10 suggestions
        recentOrders,
        pendingDeliveries,
        automationStatus: automationSettings,
      };
    } catch (error) {
      orderLogger.error('Error generating inventory dashboard data:', toLogData(error));
      throw error;
    }
  }

  // Private helper methods

  private async getRecentOrders(practiceId: string): Promise<any[]> {
    const { data } = await supabase
      .from('supplier_orders')
      .select(
        `
        id,
        order_reference,
        status,
        total_amount,
        created_at,
        suppliers(name)
      `
      )
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: false })
      .limit(5);

    return data || [];
  }

  private async getPendingDeliveries(practiceId: string): Promise<any[]> {
    const { data } = await supabase
      .from('supplier_orders')
      .select(
        `
        id,
        order_reference,
        estimated_delivery_date,
        tracking_number,
        suppliers(name)
      `
      )
      .eq('practice_id', practiceId)
      .in('status', ['sent', 'confirmed', 'shipped'])
      .order('estimated_delivery_date', { ascending: true });

    return data || [];
  }

  private async getAutomationStatus(practiceId: string): Promise<any> {
    const { data: settings } = await supabase
      .from('practice_inventory_settings')
      .select('*')
      .eq('practice_id', practiceId)
      .single();

    const { data: schedules } = await supabase
      .from('automation_schedules')
      .select('*')
      .eq('practice_id', practiceId)
      .eq('enabled', true);

    return {
      autoReorderEnabled: settings?.auto_reorder_enabled || false,
      notificationsEnabled: settings?.notify_on_low_stock || false,
      activeSchedules: schedules?.length || 0,
      lastRunAt: schedules?.[0]?.last_run_at,
      nextRunAt: schedules?.[0]?.next_run_at,
    };
  }
}

// Export singleton instance
export const inventoryOrderIntegration = new InventoryOrderIntegrationService();
