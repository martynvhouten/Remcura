import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from './auth';
import type {
  StockLevelWithDetails,
  MovementWithRelations,
  StockUpdateRequest,
  OrderSuggestion,
  StockAlert,
  InventoryKPI,
  UnifiedStockView,
} from 'src/types/inventory';

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const stockLevels = ref<StockLevelWithDetails[]>([]);
  const unifiedStock = ref<UnifiedStockView[]>([]);
  const stockMovements = ref<MovementWithRelations[]>([]);
  const orderSuggestions = ref<OrderSuggestion[]>([]);
  const stockAlerts = ref<StockAlert[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Auth store
  const authStore = useAuthStore();

  // Getters
  const totalStockValue = computed(() => {
    return unifiedStock.value.reduce((total, item) => {
      return total + item.current_quantity * (item.product_price || 0);
    }, 0);
  });

  const lowStockItems = computed(() => {
    return stockLevels.value.filter(
      (stock) =>
        stock.current_quantity <= stock.minimum_stock && stock.minimum_stock > 0
    );
  });

  const outOfStockItems = computed(() => {
    return stockLevels.value.filter((stock) => stock.current_quantity <= 0);
  });

  const criticalAlerts = computed(() => {
    return stockAlerts.value.filter(
      (alert) => alert.urgency === 'critical' || alert.urgency === 'high'
    );
  });

  const stockByLocation = computed(() => {
    return stockLevels.value.reduce((acc, stock) => {
      const locationId = stock.location_id;
      if (!acc[locationId]) {
        acc[locationId] = {
          location: stock.location,
          stocks: [],
        };
      }
      acc[locationId].stocks.push(stock);
      return acc;
    }, {} as Record<string, { location: any; stocks: StockLevelWithDetails[] }>);
  });

  // New getters based on unified stock view
  const batchTrackedItems = computed(() => {
    return unifiedStock.value.filter(item => item.requires_batch_tracking);
  });

  const manualStockItems = computed(() => {
    return unifiedStock.value.filter(item => !item.requires_batch_tracking);
  });

  const stockStatusSummary = computed(() => {
    return {
      in_stock: unifiedStock.value.filter(item => item.stock_status === 'in_stock').length,
      low_stock: unifiedStock.value.filter(item => item.stock_status === 'low_stock').length,
      out_of_stock: unifiedStock.value.filter(item => item.stock_status === 'out_of_stock').length,
    };
  });

  // Actions
  const fetchStockLevels = async (practiceId: string) => {
    loading.value = true;
    try {
      // Query only existing columns from the products table
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          sku,
          category,
          brand,
          unit,
          price
        `)
        .eq('active', true);

      if (error) throw error;

      // Create simplified unified stock data
      unifiedStock.value = (data || []).map(product => ({
        practice_id: practiceId,
        location_id: '', // Would need actual location data
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        product_category: product.category,
        product_brand: product.brand,
        product_unit: product.unit,
        product_price: product.price,
        requires_batch_tracking: false, // Default to false since this column doesn't exist yet
        location_name: 'Main Location',
        location_code: 'MAIN',
        location_type: 'storage',
        current_quantity: 0,
        reserved_quantity: 0,
        available_quantity: 0,
        stock_status: 'out_of_stock' as const,
        minimum_quantity: 0,
        maximum_quantity: null,
        reorder_point: null,
        preferred_supplier_id: null,
        last_counted_at: null,
        last_movement_at: new Date().toISOString(),
        stock_source: 'manual' as const, // Default to manual since we don't have batch tracking yet
        calculated_at: new Date().toISOString(),
      }));

      // Create legacy format for compatibility
      stockLevels.value = [];

      lastSyncAt.value = new Date();
    } catch (error) {
      console.error('Error fetching stock levels:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  // Helper function to check if manual stock adjustments are allowed
  const canManuallyAdjustStock = (productId: string): boolean => {
    const stockItem = unifiedStock.value.find(item => item.product_id === productId);
    return !stockItem?.requires_batch_tracking;
  };

  const updateStockLevel = async (request: StockUpdateRequest) => {
    // Prevent manual stock adjustments for batch-tracked products
    if (!canManuallyAdjustStock(request.product_id)) {
      throw new Error('Manual stock adjustments are not allowed for batch-tracked products. Please use batch management instead.');
    }

    try {
      // For now, we'll create a stock entry since stock_movements table doesn't exist
              const { data, error } = await supabase
          .from('stock_entries')
          .insert({
            practice_id: request.practice_id,
            product_id: request.product_id,
            counted_quantity: request.quantity_change,
            entry_type: request.movement_type as string,
            notes: request.notes || null,
            created_by: authStore.user?.id || '',
          });

      if (error) throw error;

      // Refresh stock levels after update
      await fetchStockLevels(request.practice_id);

      return data;
    } catch (error) {
      console.error('Error updating stock level:', error);
      throw error;
    }
  };

  const fetchOrderSuggestions = async (_practiceId: string) => {
    try {
      // Generate order suggestions based on low stock items from unified view
      const suggestions = unifiedStock.value
        .filter(item => item.stock_status === 'low_stock' || item.stock_status === 'out_of_stock')
        .map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          location_id: item.location_id,
          location_name: item.location_name,
          current_stock: item.current_quantity,
          minimum_stock: item.minimum_quantity,
          suggested_quantity: Math.max(item.minimum_quantity - item.current_quantity, 1),
          preferred_supplier_id: item.preferred_supplier_id || null,
          supplier_name: 'Default Supplier',
          urgency_level: item.stock_status === 'out_of_stock' ? 'critical' as const : 'high' as const,
          days_until_stockout: item.current_quantity > 0 ? 7 : 0,
        }));

      orderSuggestions.value = suggestions;
    } catch (error) {
      console.error('Error fetching order suggestions:', error);
      throw error;
    }
  };

  const fetchStockMovements = async (practiceId: string, limit = 50) => {
    try {
      // Since stock_movements table doesn't exist, we'll use stock_entries as fallback
      const { data, error } = await supabase
        .from('stock_entries')
        .select(`
          *,
          products:product_id (
            id,
            name,
            sku
          )
        `)
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      // Transform stock entries to movement format
      stockMovements.value = (data || []).map(entry => ({
        id: entry.id,
        practice_id: entry.practice_id,
        location_id: '', // Not available in stock_entries
        product_id: entry.product_id,
        movement_type: entry.entry_type || 'adjustment',
        quantity_change: entry.counted_quantity,
        quantity_after: entry.counted_quantity,
        performed_by: entry.created_by || '',
        notes: entry.notes,
        created_at: entry.created_at,
        product: entry.products ? {
          id: entry.products.id,
          name: entry.products.name,
          sku: entry.products.sku,
        } : undefined,
      })) as MovementWithRelations[];

    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  };

  const generateStockAlerts = () => {
    const alerts: StockAlert[] = [];
    
    unifiedStock.value.forEach(item => {
      if (item.stock_status === 'out_of_stock') {
        alerts.push({
          type: 'out_of_stock',
          urgency: 'critical',
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          location_id: item.location_id,
          location_name: item.location_name,
          current_quantity: item.current_quantity,
          threshold_quantity: item.minimum_quantity,
          message: `${item.product_name} is out of stock`,
          suggested_action: 'Reorder immediately',
          created_at: new Date().toISOString(),
        });
      } else if (item.stock_status === 'low_stock') {
        alerts.push({
          type: 'low_stock',
          urgency: 'high',
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          location_id: item.location_id,
          location_name: item.location_name,
          current_quantity: item.current_quantity,
          threshold_quantity: item.minimum_quantity,
          message: `${item.product_name} is running low`,
          suggested_action: 'Consider reordering',
          created_at: new Date().toISOString(),
        });
      }
    });

    stockAlerts.value = alerts;
  };

  const getInventoryKPIs = async (
    _practiceId: string
  ): Promise<InventoryKPI> => {
    try {
      const totalProducts = unifiedStock.value.length;
      const lowStockCount = unifiedStock.value.filter(item => item.stock_status === 'low_stock').length;
      const outOfStockCount = unifiedStock.value.filter(item => item.stock_status === 'out_of_stock').length;
      
      return {
        total_sku_count: totalProducts,
        total_stock_value: totalStockValue.value,
        low_stock_items: lowStockCount,
        out_of_stock_items: outOfStockCount,
        stock_turnover_rate: 0, // Would need historical data
        average_days_to_stockout: 30, // Placeholder
        top_moving_products: [],
        stock_accuracy_percentage: 95, // Placeholder
        last_full_count_date: null,
      };
    } catch (error) {
      console.error('Error calculating inventory KPIs:', error);
      throw error;
    }
  };

  const transferStock = async (
    practiceId: string,
    productId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string
  ) => {
    try {
      // Create transfer out entry
      await supabase
        .from('stock_entries')
        .insert({
          practice_id: practiceId,
          product_id: productId,
          counted_quantity: -quantity,
          entry_type: 'transfer_out',
          notes: notes || `Transfer to ${toLocationId}`,
          created_by: authStore.user?.id || '',
        });

      // Create transfer in entry
      await supabase
        .from('stock_entries')
        .insert({
          practice_id: practiceId,
          product_id: productId,
          counted_quantity: quantity,
          entry_type: 'transfer_in',
          notes: notes || `Transfer from ${fromLocationId}`,
          created_by: authStore.user?.id || '',
        });

      // Refresh stock levels
      await fetchStockLevels(practiceId);
    } catch (error) {
      console.error('Error transferring stock:', error);
      throw error;
    }
  };

  const refreshData = async (practiceId: string) => {
    try {
      await Promise.all([
        fetchStockLevels(practiceId),
        fetchOrderSuggestions(practiceId),
        fetchStockMovements(practiceId),
      ]);
      
      generateStockAlerts();
    } catch (error) {
      console.error('Error refreshing inventory data:', error);
      throw error;
    }
  };

  return {
    // State
    stockLevels,
    unifiedStock,
    stockMovements,
    orderSuggestions,
    stockAlerts,
    loading,
    lastSyncAt,

    // Getters
    totalStockValue,
    lowStockItems,
    outOfStockItems,
    criticalAlerts,
    stockByLocation,
    batchTrackedItems,
    manualStockItems,
    stockStatusSummary,

    // Actions
    fetchStockLevels,
    canManuallyAdjustStock,
    updateStockLevel,
    fetchOrderSuggestions,
    fetchStockMovements,
    generateStockAlerts,
    getInventoryKPIs,
    transferStock,
    refreshData,
  };
});
