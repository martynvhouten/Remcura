import { ref, computed, onUnmounted } from 'vue';
import { supabase } from '@/boot/supabase';
import { orderLogger, createLogger } from '@/utils/logger';
import type { UrgencyLevel, OrderListInsert, OrderListItemInsert } from '@/types/inventory';

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
  urgency_level: UrgencyLevel;
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
  location_name?: string | null;
  preferred_unit_price: number;
  min_order_qty: number;
  preferred_supplier_name: string;
  preferred_supplier_id?: string;
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

const normalizeUrgency = (value: string | null): UrgencyLevel => {
  switch (value) {
    case 'critical':
    case 'high':
    case 'medium':
    case 'low':
      return value;
    default:
      return 'low';
  }
};

export function useOrderListsMinMax() {
  // Event emitter for store communication
  // const eventEmitter = createEventEmitter('order-lists-minmax'); // This line is removed as per the edit hint.

  // Current practice ID (from auth events)
  const currentPracticeId = ref<string | null>(null);

  // State
  const reorderSuggestions = ref<ReorderSuggestion[]>([]);
  const loading = ref(false);
  const lastCalculationAt = ref<Date | null>(null);

  const log = createLogger('OrderListsMinMax');

  // Set up event listeners for auth changes
  // The eventEmitter.on calls are removed as per the edit hint.
  // The original code had eventEmitter.on(StoreEventsOrderLists.USER_LOGGED_IN, ...)
  // and eventEmitter.on(StoreEventsOrderLists.USER_LOGGED_OUT, ...).
  // Since eventEmitter is removed, these listeners are also removed.

  // Clean up listeners
  onUnmounted(() => {
    // The unsubscribeAuth and unsubscribeLogout functions are removed as per the edit hint.
    // The original code had them, but they relied on eventEmitter.
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
      normal: itemsToOrder.filter(item => item.urgency_level === 'medium'),
      low: itemsToOrder.filter(item => item.urgency_level === 'low'),
    };

    const suppliersInvolved = [
      ...new Set(
        itemsToOrder.map(item => item.preferred_supplier_name).filter(Boolean)
      ),
    ];

    const totalEstimatedCost = itemsToOrder.reduce(
      (sum, item) =>
        sum + item.calculated_order_quantity * (item.preferred_unit_price ?? 0),
      0
    );

    // Estimate delivery dates based on lead times (simplified)
    const estimatedDeliveryDates: Record<string, string> = {};
    suppliersInvolved.forEach(supplier => {
      const supplierItems = itemsToOrder.filter(
        item => item.preferred_supplier_name === supplier
      );
      const maxLeadTime = Math.max(
        ...supplierItems.map(item => (item as any).lead_time_days ?? 7)
      );
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + maxLeadTime);
      estimatedDeliveryDates[supplier] = (
        deliveryDate.toISOString().split('T')[0] ??
        new Date().toISOString().split('T')[0]
      ) as string;
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
      log.info('Fetching reorder suggestions for practice', { practiceId });

      const { data, error } = await supabase
        .from('reorder_suggestions')
        .select('*')
        .eq('practice_id', practiceId)
        .order('urgency_level', { ascending: false })
        .order('stock_status', { ascending: true });

      if (error) throw error;

      reorderSuggestions.value = (data || []).map(suggestion => ({
        ...suggestion,
        urgency_level: normalizeUrgency(suggestion.urgency_level),
      })) as ReorderSuggestion[];
      lastCalculationAt.value = new Date();

      // TODO: emit event when order suggestion updates are centralized

      log.info(
        `✅ Loaded ${reorderSuggestions.value.length} reorder suggestions`
      );
    } catch (error) {
      log.error('Error fetching reorder suggestions', {
        error: error instanceof Error ? error.message : String(error),
      });
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
      log.info(`Updating stock level for item ${itemId} to ${newStockLevel}`);

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

      log.info(`✅ Stock level updated successfully`);

      // TODO: emit order list stock level update once new event map is defined
    } catch (error) {
      log.error('Error updating stock level', {
        error: error instanceof Error ? error.message : String(error),
      });
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
        const currentItems = ordersBySupplier.get(supplierId);
        if (currentItems) {
          currentItems.push(item);
        } else {
          ordersBySupplier.set(supplierId, [item]);
        }
      });

      const createdOrders: Array<{
        orderList: { id: string };
        itemCount: number;
        supplier: string;
      }> = [];

      // Create separate order lists per supplier
      for (const [supplierName, items] of ordersBySupplier) {
        const practiceId = currentPracticeId.value;
        if (!practiceId) {
          throw new Error('Geen praktijk geselecteerd');
        }

        const orderData: OrderListInsert = {
          practice_id: practiceId,
          location_id: 'default',
          name: `Auto-order ${supplierName} - ${new Date().toLocaleDateString()}`,
          description: `Automatisch gegenereerde bestelling gebaseerd op min/max niveaus`,
          status: 'draft',
          supplier_id: null,
          total_items: items.length,
          created_by: null,
        };

        const { data: newOrderList, error: orderError } = await supabase
          .from('order_lists')
          .insert(orderData)
          .select()
          .single();

        if (orderError) throw orderError;

        const orderItems: OrderListItemInsert[] = items.map(item => ({
          order_list_id: newOrderList.id,
          product_id: item.product_id,
          supplier_product_id: item.preferred_supplier_id ?? null,
          suggested_quantity: item.calculated_order_quantity,
          ordered_quantity: item.calculated_order_quantity,
          unit_price: item.preferred_unit_price ?? 0,
          total_price:
            item.calculated_order_quantity * (item.preferred_unit_price ?? 0),
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

        log.info(
          `✅ Created order for ${supplierName} with ${items.length} items`
        );
      }

      return createdOrders;
    } catch (error) {
      log.error('Error creating orders from advice', {
        error: error instanceof Error ? error.message : String(error),
      });
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

      log.info(`✅ Updated min/max levels for item ${itemId}`);
    } catch (error) {
      log.error('Error updating min/max levels', {
        error: error instanceof Error ? error.message : String(error),
      });
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
