import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { supabase } from 'src/boot/supabase';
import { realtimeService } from 'src/services/supabase';
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

  // 🔄 NEW: Real-time state
  const realtimeConnected = ref(false);
  const inventoryChannel = ref<any>(null);
  const movementsChannel = ref<any>(null);

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
      // Get current stock level
      let currentStock = 0;
      const { data: stockLevel, error: stockError } = await supabase
        .from('stock_levels')
        .select('current_quantity')
        .eq('practice_id', request.practice_id)
        .eq('location_id', request.location_id)
        .eq('product_id', request.product_id)
        .maybeSingle();

      if (stockError && stockError.code !== 'PGRST116') {
        // PGRST116 = "no rows returned" - this is OK for new products
        throw stockError;
      }

      currentStock = (stockLevel as any)?.current_quantity || 0;
      const newQuantity = currentStock + request.quantity_change;

      // Create stock movement record
      const { data, error } = await supabase.from('stock_movements').insert({
        practice_id: request.practice_id,
        location_id: request.location_id,
        product_id: request.product_id,
        movement_type: request.movement_type,
        quantity_change: request.quantity_change,
        quantity_before: currentStock,
        quantity_after: newQuantity,
        reference_type: 'manual_adjustment',
        reason: request.reason_code,
        notes: request.notes || null,
        created_by: authStore.user?.id || '',
      });

      if (error) throw error;

      // Update or create stock level record
      const { error: upsertError } = await supabase
        .from('stock_levels')
        .upsert({
          practice_id: request.practice_id,
          location_id: request.location_id,
          product_id: request.product_id,
          current_quantity: newQuantity,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'practice_id,location_id,product_id'
        });

      if (upsertError) {
        console.warn('Warning: Could not update stock level:', upsertError);
        // Don't throw - movement was successful
      }

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
      // Use stock_movements table
      const { data, error } = await supabase
        .from('stock_movements')
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

      // Transform stock movements to internal format
      stockMovements.value = (data || []).map((movement: any) => ({
        id: movement.id,
        practice_id: movement.practice_id,
        location_id: movement.location_id,
        product_id: movement.product_id,
        movement_type: movement.movement_type,
        quantity_change: movement.quantity_change,
        quantity_after: movement.quantity_after,
        performed_by: movement.created_by || '',
        notes: movement.notes,
        created_at: movement.created_at,
        product: movement.products
          ? {
              id: movement.products.id,
              name: movement.products.name,
              sku: movement.products.sku,
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
      // Get current stock at source location
      const fromStockQuery = await supabase
        .from('stock_levels')
        .select('current_quantity')
        .eq('practice_id', practiceId)
        .eq('location_id', fromLocationId)
        .eq('product_id', productId)
        .maybeSingle();

      // Get current stock at destination location
      const toStockQuery = await supabase
        .from('stock_levels')
        .select('current_quantity')
        .eq('practice_id', practiceId)
        .eq('location_id', toLocationId)
        .eq('product_id', productId)
        .maybeSingle();

      const fromCurrentStock = (fromStockQuery.data as any)?.current_quantity || 0;
      const toCurrentStock = (toStockQuery.data as any)?.current_quantity || 0;
      
      // Create transfer out movement
      await supabase.from('stock_movements').insert({
        practice_id: practiceId,
        location_id: fromLocationId,
        product_id: productId,
        movement_type: 'transfer',
        quantity_change: -quantity,
        quantity_before: fromCurrentStock,
        quantity_after: fromCurrentStock - quantity,
        reference_type: 'transfer',
        notes: notes || `Transfer to ${toLocationId}`,
        created_by: authStore.user?.id || '',
      });

      // Create transfer in movement
      await supabase.from('stock_movements').insert({
        practice_id: practiceId,
        location_id: toLocationId,
        product_id: productId,
        movement_type: 'transfer',
        quantity_change: quantity,
        quantity_before: toCurrentStock,
        quantity_after: toCurrentStock + quantity,
        reference_type: 'transfer',
        notes: notes || `Transfer from ${fromLocationId}`,
        created_by: authStore.user?.id || '',
      });

      // Update stock levels for both locations
      await supabase.from('stock_levels').upsert([
        {
          practice_id: practiceId,
          location_id: fromLocationId,
          product_id: productId,
          current_quantity: fromCurrentStock - quantity,
          updated_at: new Date().toISOString(),
        },
        {
          practice_id: practiceId,
          location_id: toLocationId,
          product_id: productId,
          current_quantity: toCurrentStock + quantity,
          updated_at: new Date().toISOString(),
        }
      ], {
        onConflict: 'practice_id,location_id,product_id'
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
    const practiceId = authStore.userProfile?.clinic_id;
    
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

  // 🔄 NEW: Real-time functions
  const handleRealtimeUpdate = (payload: any) => {
    console.log('📡 Real-time inventory update:', payload);
    
    switch (payload.table) {
      case 'stock_levels':
        handleStockLevelUpdate(payload);
        break;
      case 'stock_entries':
        handleStockMovementUpdate(payload);
        break;
    }

    lastSyncAt.value = new Date();
  };

  const handleStockLevelUpdate = async (payload: any) => {
    const practiceId = authStore.userProfile?.clinic_id;
    if (!practiceId) return;

    // For any stock level change, refresh the data
    // In a more sophisticated implementation, we could update just the changed record
    console.log('🔄 Stock level changed, refreshing data...');
    
    // Show a subtle notification that data was updated
    if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
      const product = payload.new;
      console.log(`📊 Stock updated for product ${product.product_id}`);
    }
  };

  const handleStockMovementUpdate = async (payload: any) => {
    const practiceId = authStore.userProfile?.clinic_id;
    if (!practiceId) return;

    // Refresh movements when a new movement is added
    if (payload.eventType === 'INSERT') {
      console.log('📈 New stock movement, refreshing...');
      await fetchStockMovements(practiceId);
    }
  };

  const startRealtimeSubscription = (practiceId: string) => {
    if (inventoryChannel.value) {
      realtimeService.unsubscribeFromChannel(inventoryChannel.value);
    }
    if (movementsChannel.value) {
      realtimeService.unsubscribeFromChannel(movementsChannel.value);
    }

    console.log('🔄 Starting real-time inventory subscription for practice:', practiceId);

    // Subscribe to inventory changes
    inventoryChannel.value = realtimeService.subscribeToInventory(
      practiceId,
      handleRealtimeUpdate
    );

    // Subscribe to stock movements
    movementsChannel.value = realtimeService.subscribeToStockMovements(
      practiceId, 
      handleRealtimeUpdate
    );

    realtimeConnected.value = true;
  };

  const stopRealtimeSubscription = () => {
    if (inventoryChannel.value) {
      realtimeService.unsubscribeFromChannel(inventoryChannel.value);
      inventoryChannel.value = null;
    }
    if (movementsChannel.value) {
      realtimeService.unsubscribeFromChannel(movementsChannel.value);
      movementsChannel.value = null;
    }

    realtimeConnected.value = false;
    console.log('❌ Stopped real-time inventory subscription');
  };

  // Auto-start real-time when practice is available
  const initializeRealtime = () => {
    const practiceId = authStore.userProfile?.clinic_id;
    if (practiceId && !realtimeConnected.value) {
      startRealtimeSubscription(practiceId);
    }
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stopRealtimeSubscription();
  });

  return {
    // State
    stockMovements,
    orderSuggestions,
    stockLevels,
    loading,
    lastSyncAt,

    // 🔄 NEW: Real-time state
    realtimeConnected,

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

    // 🔄 NEW: Real-time actions
    startRealtimeSubscription,
    stopRealtimeSubscription,
    initializeRealtime,
  };
});
