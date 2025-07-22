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
} from 'src/types/inventory';

export const useInventoryStore = defineStore('inventory', () => {
  // State - focus only on inventory operations, not product data
  const stockMovements = ref<MovementWithRelations[]>([]);
  const orderSuggestions = ref<OrderSuggestion[]>([]);
  const stockLevels = ref<StockLevelWithDetails[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Auth store
  const authStore = useAuthStore();

  // Computed properties
  const criticalAlerts = computed<StockAlert[]>(() => {
    // TODO: Implement proper stock alerts based on available data
    // For now return empty array to prevent runtime errors
    return [];
  });

  // Actions - pure inventory operations only
  const updateStockLevel = async (request: StockUpdateRequest) => {
    try {
      // Create stock movement record
      const { data, error } = await supabase.from('stock_entries').insert({
        practice_id: request.practice_id,
        product_id: request.product_id,
        counted_quantity: request.quantity_change,
        entry_type: request.movement_type as string,
        notes: request.notes || null,
        created_by: authStore.user?.id || '',
      });

      if (error) throw error;

      // Refresh movements after update
      await fetchStockMovements(request.practice_id);

      return data;
    } catch (error) {
      console.error('Error updating stock level:', error);
      throw error;
    }
  };

  const fetchOrderSuggestions = async (practiceId: string) => {
    try {
      // Use RPC function to get order suggestions based on current stock levels
      const { data, error } = await supabase.rpc('get_order_advice', {
        practice_uuid: practiceId,
      });

      if (error) throw error;

      orderSuggestions.value = (data || []).map((item: any) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        location_id: item.location_id || '',
        location_name: item.location_name || 'Main Location',
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        suggested_quantity: item.suggested_quantity,
        preferred_supplier_id: item.preferred_supplier_id || null,
        supplier_name: item.supplier_name,
        urgency_level: item.urgency_level,
        days_until_stockout: item.days_until_stockout || 0,
      }));
    } catch (error) {
      console.error('Error fetching order suggestions:', error);
      throw error;
    }
  };

  const fetchStockMovements = async (practiceId: string, limit = 50) => {
    try {
      // Use stock_entries as movement records
      const { data, error } = await supabase
        .from('stock_entries')
        .select(
          `
          *,
          products:product_id (
            id,
            name,
            sku
          )
        `
        )
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
        product: entry.products
          ? {
              id: entry.products.id,
              name: entry.products.name,
              sku: entry.products.sku,
            }
          : undefined,
      })) as MovementWithRelations[];
    } catch (error) {
      console.error('Error fetching stock movements:', error);
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
      await supabase.from('stock_entries').insert({
        practice_id: practiceId,
        product_id: productId,
        counted_quantity: -quantity,
        entry_type: 'transfer_out',
        notes: notes || `Transfer to ${toLocationId}`,
        created_by: authStore.user?.id || '',
      });

      // Create transfer in entry
      await supabase.from('stock_entries').insert({
        practice_id: practiceId,
        product_id: productId,
        counted_quantity: quantity,
        entry_type: 'transfer_in',
        notes: notes || `Transfer from ${fromLocationId}`,
        created_by: authStore.user?.id || '',
      });

      // Refresh movements
      await fetchStockMovements(practiceId);
    } catch (error) {
      console.error('Error transferring stock:', error);
      throw error;
    }
  };

  const refreshData = async (practiceId: string) => {
    try {
      await Promise.all([
        fetchOrderSuggestions(practiceId),
        fetchStockMovements(practiceId),
      ]);
    } catch (error) {
      console.error('Error refreshing inventory data:', error);
      throw error;
    }
  };

  // New methods for stock transfer dialog
  const getProductStockAtLocation = (productId: string, locationId: string): number => {
    // This would typically query the database or local state
    // For demo purposes, return a placeholder value
    const stockLevel = stockLevels.value.find(sl => 
      sl.product_id === productId && sl.location_id === locationId
    );
    return stockLevel?.current_quantity || 0;
  };

  const getProductBatches = (productId: string, locationId: string) => {
    // This would query product_batches table
    // For demo purposes, return empty array
    return [];
  };

  const executeStockTransfer = async (transferData: any) => {
    const authStore = useAuthStore();
    const practiceId = authStore.currentPractice?.id;
    
    if (!practiceId) {
      throw new Error('No practice selected');
    }

    try {
      // Use the existing transferStock method
      await transferStock(
        practiceId,
        transferData.product_id,
        transferData.from_location_id,
        transferData.to_location_id,
        transferData.quantity,
        transferData.notes
      );
    } catch (error) {
      console.error('Error executing stock transfer:', error);
      throw error;
    }
  };

  return {
    // State
    stockMovements,
    orderSuggestions,
    stockLevels,
    loading,
    lastSyncAt,

    // Computed
    criticalAlerts,

    // Actions
    updateStockLevel,
    fetchOrderSuggestions,
    fetchStockMovements,
    transferStock,
    refreshData,
    getProductStockAtLocation,
    getProductBatches,
    executeStockTransfer,
  };
});
