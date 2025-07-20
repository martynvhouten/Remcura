import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from './auth';
import type {
  StockLevelWithDetails,
  MovementWithRelations,
  StockUpdateRequest,
  OrderSuggestion,
} from 'src/types/inventory';

export const useInventoryStore = defineStore('inventory', () => {
  // State - focus only on inventory operations, not product data
  const stockMovements = ref<MovementWithRelations[]>([]);
  const orderSuggestions = ref<OrderSuggestion[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Auth store
  const authStore = useAuthStore();

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
        id: `suggestion_${item.product_id}`,
        practice_id: practiceId,
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        maximum_stock: item.maximum_stock,
        suggested_quantity: item.suggested_quantity,
        urgency_level: item.urgency_level,
        reason: item.current_stock <= 0 ? 'out_of_stock' : 'low_stock',
        created_at: new Date().toISOString(),
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

  return {
    // State
    stockMovements,
    orderSuggestions,
    loading,
    lastSyncAt,

    // Actions
    updateStockLevel,
    fetchOrderSuggestions,
    fetchStockMovements,
    transferStock,
    refreshData,
  };
});
