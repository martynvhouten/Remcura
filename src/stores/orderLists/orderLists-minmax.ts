import { ref, computed, onUnmounted } from 'vue';
import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';
import type { OrderListWithItems } from '@/types/stores';

// Min/Max specific types
export interface MinMaxItem {
  id: string;
  order_list_id: string;
  product_id: string;
  minimum_stock: number;
  maximum_stock: number;
  current_stock: number;
  reorder_point: number;
  preferred_supplier_id?: string;
  alternative_suppliers: string[];
  last_order_date?: string;
  last_order_quantity: number;
  average_consumption: number;
  lead_time_days: number;
  urgency_level: 'low' | 'normal' | 'high' | 'critical';
  auto_suggest_enabled: boolean;
  manual_override: boolean;
  override_reason?: string;
}

export interface ReorderSuggestion {
  id: string;
  order_list_id: string;
  product_id: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  reorder_point: number;
  suggested_quantity: number;
  urgency_level: string;
  stock_status:
    | 'out_of_stock'
    | 'below_minimum'
    | 'reorder_needed'
    | 'overstocked'
    | 'in_range';
  calculated_order_quantity: number;
  product_name: string;
  product_sku: string;
  product_unit: string;
  list_name: string;
  practice_id: string;
  location_id: string;
  preferred_unit_price: number;
  min_order_qty: number;
  preferred_supplier_name: string;
}

export interface OrderAdvice {
  total_items_to_order: number;
  total_estimated_cost: number;
  items_by_urgency: {
    critical: ReorderSuggestion[];
    high: ReorderSuggestion[];
    normal: ReorderSuggestion[];
    low: ReorderSuggestion[];
  };
  suppliers_involved: string[];
  estimated_delivery_dates: Record<string, string>;
}

export function useOrderListsMinMax() {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('order-lists-minmax');

  // Current practice ID (from auth events)
  const currentPracticeId = ref<string | null>(null);

  // State
  const reorderSuggestions = ref<ReorderSuggestion[]>([]);
  const loading = ref(false);
  const lastCalculationAt = ref<Date | null>(null);

  // Set up event listeners for auth changes
  const unsubscribeAuth = eventEmitter.on(
    StoreEvents.USER_LOGGED_IN,
    async (data: { clinicId: string }) => {
      currentPracticeId.value = data.clinicId;
      orderLogger.info(
        'Auth changed, auto-loading reorder suggestions for practice:',
        data.clinicId
      );

      // Auto-load suggestions when user logs in
      if (data.clinicId) {
        await refreshReorderSuggestions(data.clinicId);
      }
    }
  );

  const unsubscribeLogout = eventEmitter.on(StoreEvents.USER_LOGGED_OUT, () => {
    currentPracticeId.value = null;
    // Clear data on logout
    reorderSuggestions.value = [];
    orderLogger.info('User logged out, reorder data cleared');
  });

  // Clean up listeners
  onUnmounted(() => {
    unsubscribeAuth();
    unsubscribeLogout();
  });

  // Computed properties for order advice
  const orderAdvice = computed((): OrderAdvice => {
    const itemsToOrder = reorderSuggestions.value.filter(
      item =>
        item.calculated_order_quantity > 0 &&
        item.stock_status !== 'in_range' &&
        item.stock_status !== 'overstocked'
    );

    const itemsByUrgency = {
      critical: itemsToOrder.filter(item => item.urgency_level === 'critical'),
      high: itemsToOrder.filter(item => item.urgency_level === 'high'),
      normal: itemsToOrder.filter(item => item.urgency_level === 'normal'),
      low: itemsToOrder.filter(item => item.urgency_level === 'low'),
    };

    const suppliersInvolved = [
      ...new Set(
        itemsToOrder.map(item => item.preferred_supplier_name).filter(Boolean)
      ),
    ];

    const totalEstimatedCost = itemsToOrder.reduce(
      (sum, item) =>
        sum + item.calculated_order_quantity * (item.preferred_unit_price || 0),
      0
    );

    // Estimate delivery dates based on lead times (simplified)
    const estimatedDeliveryDates: Record<string, string> = {};
    suppliersInvolved.forEach(supplier => {
      const supplierItems = itemsToOrder.filter(
        item => item.preferred_supplier_name === supplier
      );
      const maxLeadTime = Math.max(...supplierItems.map(item => 7)); // Default 7 days
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + maxLeadTime);
      estimatedDeliveryDates[supplier] = deliveryDate
        .toISOString()
        .split('T')[0];
    });

    return {
      total_items_to_order: itemsToOrder.length,
      total_estimated_cost: totalEstimatedCost,
      items_by_urgency: itemsByUrgency,
      suppliers_involved: suppliersInvolved,
      estimated_delivery_dates: estimatedDeliveryDates,
    };
  });

  const criticalItemsCount = computed(
    () =>
      reorderSuggestions.value.filter(
        item =>
          item.urgency_level === 'critical' &&
          item.calculated_order_quantity > 0
      ).length
  );

  const itemsBelowMinimum = computed(
    () =>
      reorderSuggestions.value.filter(
        item =>
          item.stock_status === 'below_minimum' ||
          item.stock_status === 'out_of_stock'
      ).length
  );

  // Actions
  const refreshReorderSuggestions = async (practiceId: string) => {
    loading.value = true;
    try {
      orderLogger.info(
        'Fetching reorder suggestions for practice:',
        practiceId
      );

      const { data, error } = await supabase
        .from('reorder_suggestions')
        .select('*')
        .eq('practice_id', practiceId)
        .order('urgency_level', { ascending: false })
        .order('stock_status', { ascending: true });

      if (error) throw error;

      reorderSuggestions.value = data || [];
      lastCalculationAt.value = new Date();

      orderLogger.info(
        `✅ Loaded ${reorderSuggestions.value.length} reorder suggestions`
      );

      // Emit event that suggestions have been loaded
      await eventEmitter.emit(StoreEvents.ORDER_SUGGESTIONS_UPDATED, {
        practiceId,
        suggestionCount: reorderSuggestions.value.length,
        criticalCount: criticalItemsCount.value,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      orderLogger.error('Error fetching reorder suggestions:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateStockLevel = async (
    itemId: string,
    newStockLevel: number,
    reason?: string
  ) => {
    try {
      orderLogger.info(
        `Updating stock level for item ${itemId} to ${newStockLevel}`
      );

      // Update the item's current stock
      const { error } = await supabase
        .from('order_list_items')
        .update({
          current_stock: newStockLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      const item = reorderSuggestions.value.find(s => s.id === itemId);
      if (item) {
        item.current_stock = newStockLevel;

        // Recalculate stock status and order quantity
        if (newStockLevel <= 0) {
          item.stock_status = 'out_of_stock';
          item.calculated_order_quantity = item.maximum_stock;
        } else if (newStockLevel <= item.minimum_stock) {
          item.stock_status = 'below_minimum';
          item.calculated_order_quantity = item.maximum_stock - newStockLevel;
        } else if (
          newStockLevel <= (item.reorder_point || item.minimum_stock * 1.2)
        ) {
          item.stock_status = 'reorder_needed';
          item.calculated_order_quantity = Math.max(
            item.maximum_stock - newStockLevel,
            item.minimum_stock
          );
        } else if (newStockLevel >= item.maximum_stock) {
          item.stock_status = 'overstocked';
          item.calculated_order_quantity = 0;
        } else {
          item.stock_status = 'in_range';
          item.calculated_order_quantity = 0;
        }
      }

      orderLogger.info(`✅ Stock level updated successfully`);

      // Emit event for real-time updates
      await eventEmitter.emit(StoreEvents.STOCK_LEVEL_UPDATED, {
        itemId,
        newStockLevel,
        reason,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      orderLogger.error('Error updating stock level:', error);
      throw error;
    }
  };

  const createOrdersFromAdvice = async (selectedItems?: string[]) => {
    try {
      const itemsToOrder = selectedItems
        ? reorderSuggestions.value.filter(item =>
            selectedItems.includes(item.id)
          )
        : reorderSuggestions.value.filter(
            item => item.calculated_order_quantity > 0
          );

      if (itemsToOrder.length === 0) {
        throw new Error('No items selected for ordering');
      }

      // Group items by supplier
      const ordersBySupplier = new Map<string, ReorderSuggestion[]>();

      itemsToOrder.forEach(item => {
        const supplierId = item.preferred_supplier_name || 'unassigned';
        if (!ordersBySupplier.has(supplierId)) {
          ordersBySupplier.set(supplierId, []);
        }
        ordersBySupplier.get(supplierId)!.push(item);
      });

      const createdOrders = [];

      // Create separate order lists per supplier
      for (const [supplierName, items] of ordersBySupplier) {
        const orderData = {
          practice_id: currentPracticeId.value!,
          location_id: items[0].location_id,
          name: `Auto-order ${supplierName} - ${new Date().toLocaleDateString()}`,
          description: `Automatisch gegenereerde bestelling gebaseerd op min/max niveaus`,
          list_type: 'reorder_list',
          status: 'draft',
          auto_reorder_enabled: true,
          supplier_id: null, // Will be set based on preferred supplier
          total_items: items.length,
          total_value: items.reduce(
            (sum, item) =>
              sum +
              item.calculated_order_quantity * (item.preferred_unit_price || 0),
            0
          ),
        };

        const { data: newOrderList, error: orderError } = await supabase
          .from('order_lists')
          .insert(orderData)
          .select()
          .single();

        if (orderError) throw orderError;

        // Add items to the order list
        const orderItems = items.map(item => ({
          order_list_id: newOrderList.id,
          product_id: item.product_id,
          suggested_quantity: item.calculated_order_quantity,
          ordered_quantity: item.calculated_order_quantity,
          unit_price: item.preferred_unit_price || 0,
          total_price:
            item.calculated_order_quantity * (item.preferred_unit_price || 0),
          status: 'pending',
          notes: `Auto-suggested: ${item.stock_status}`,
        }));

        const { error: itemsError } = await supabase
          .from('order_list_items')
          .insert(orderItems);

        if (itemsError) throw itemsError;

        createdOrders.push({
          orderList: newOrderList,
          itemCount: items.length,
          supplier: supplierName,
        });

        orderLogger.info(
          `✅ Created order for ${supplierName} with ${items.length} items`
        );
      }

      // Emit event for order creation
      await eventEmitter.emit(StoreEvents.ORDERS_CREATED_FROM_ADVICE, {
        orderCount: createdOrders.length,
        totalItems: itemsToOrder.length,
        suppliers: Array.from(ordersBySupplier.keys()),
        timestamp: new Date().toISOString(),
      });

      return createdOrders;
    } catch (error) {
      orderLogger.error('Error creating orders from advice:', error);
      throw error;
    }
  };

  const updateMinMaxLevels = async (
    itemId: string,
    minStock: number,
    maxStock: number,
    reorderPoint?: number
  ) => {
    try {
      const updateData = {
        minimum_stock: minStock,
        maximum_stock: maxStock,
        reorder_point: reorderPoint || minStock * 1.2,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('order_list_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      const item = reorderSuggestions.value.find(s => s.id === itemId);
      if (item) {
        item.minimum_stock = minStock;
        item.maximum_stock = maxStock;
        item.reorder_point = reorderPoint || minStock * 1.2;
      }

      orderLogger.info(`✅ Updated min/max levels for item ${itemId}`);
    } catch (error) {
      orderLogger.error('Error updating min/max levels:', error);
      throw error;
    }
  };

  return {
    // State
    reorderSuggestions,
    loading,
    lastCalculationAt,
    currentPracticeId,

    // Computed
    orderAdvice,
    criticalItemsCount,
    itemsBelowMinimum,

    // Actions
    refreshReorderSuggestions,
    updateStockLevel,
    createOrdersFromAdvice,
    updateMinMaxLevels,
  };
}
