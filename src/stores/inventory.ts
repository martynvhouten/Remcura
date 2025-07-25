import { defineStore } from 'pinia';
import { ref, computed, onUnmounted } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from './auth';
import { realtimeService } from 'src/services/realtime';
import type { 
  StockMovement, 
  OrderSuggestion, 
  StockLevel,
  StockAlert,
  StockUpdateRequest
} from 'src/types/inventory';

// Movement with product data included
interface MovementWithRelations extends StockMovement {
  product?: {
    id: string;
    name: string;
    sku: string;
  };
}

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const stockMovements = ref<MovementWithRelations[]>([]);
  const orderSuggestions = ref<OrderSuggestion[]>([]);
  const stockLevels = ref<StockLevel[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Real-time state
  const realtimeConnected = ref(false);
  const inventoryChannel = ref<any>(null);
  const movementsChannel = ref<any>(null);

  // Auth store
  const authStore = useAuthStore();

  // Computed properties
  const criticalAlerts = computed<StockAlert[]>(() => {
    const alerts: StockAlert[] = [];
    
    stockLevels.value.forEach(stockLevel => {
      // Low stock alerts
      if (stockLevel.current_quantity <= (stockLevel.minimum_quantity || 10)) {
        alerts.push({
          id: `low_stock_${stockLevel.id}`,
          type: 'low_stock',
          severity: stockLevel.current_quantity === 0 ? 'critical' : 'warning',
          product_id: stockLevel.product_id,
          location_id: stockLevel.location_id,
          current_quantity: stockLevel.current_quantity,
          minimum_quantity: stockLevel.minimum_quantity || 10,
          title: stockLevel.current_quantity === 0 ? 'Out of Stock' : 'Low Stock',
          message: `Current stock: ${stockLevel.current_quantity}, Minimum: ${stockLevel.minimum_quantity || 10}`,
          created_at: new Date().toISOString()
        });
      }

      // Negative stock alerts (if allowed)
      if (stockLevel.current_quantity < 0) {
        alerts.push({
          id: `negative_stock_${stockLevel.id}`,
          type: 'negative_stock',
          severity: 'critical',
          product_id: stockLevel.product_id,
          location_id: stockLevel.location_id,
          current_quantity: stockLevel.current_quantity,
          title: 'Negative Stock',
          message: `Stock level is below zero: ${stockLevel.current_quantity}`,
          created_at: new Date().toISOString()
        });
      }
    });

    return alerts.sort((a, b) => {
      // Sort by severity: critical first, then warning
      if (a.severity === 'critical' && b.severity !== 'critical') return -1;
      if (b.severity === 'critical' && a.severity !== 'critical') return 1;
      return 0;
    });
  });

  // Actions - pure inventory operations only
  const updateStockLevel = async (request: StockUpdateRequest) => {
    try {
      // Validate required fields
      if (!request.practice_id || !request.location_id || !request.product_id) {
        throw new Error('Missing required fields: practice_id, location_id, or product_id');
      }

      if (request.quantity_change === 0) {
        throw new Error('Quantity change cannot be zero');
      }

      // Get current stock level with retry logic for race conditions
      let currentStock = 0;
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
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
          break; // Success, exit retry loop

        } catch (error: any) {
          retryCount++;
          if (retryCount >= maxRetries) {
            console.error('Failed to get current stock after retries:', error);
            throw new Error(`Unable to get current stock level: ${error.message}`);
          }
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        }
      }

      const newQuantity = currentStock + request.quantity_change;

      // Validate that new quantity is not negative if not allowed
      if (newQuantity < 0) {
        throw new Error(`Insufficient stock. Current: ${currentStock}, Attempted change: ${request.quantity_change}`);
      }

      // Create stock movement record first (this serves as our audit trail)
      const movementData: any = {
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
        batch_id: null, // Required for database triggers
      };

      // Add created_by only if we have a valid user
      const userId = authStore.user?.id;
      if (userId && userId !== '550e8400-e29b-41d4-a716-446655440001') {
        // Only add created_by for real users, not demo user
        movementData.created_by = userId;
      }

      const { data: insertedMovement, error: movementError } = await supabase
        .from('stock_movements')
        .insert(movementData)
        .select()
        .single();

      if (movementError) {
        console.error('Error creating stock movement:', movementError);
        
        // Provide more specific error messages
        if (movementError.code === '23503') {
          const detail = movementError.details || movementError.message;
          if (detail.includes('practice_id')) {
            throw new Error('Practice not found. Please refresh and try again.');
          } else if (detail.includes('location_id')) {
            throw new Error('Location not found. Please refresh and try again.');
          } else if (detail.includes('product_id')) {
            throw new Error('Product not found. Please refresh and try again.');
          } else if (detail.includes('created_by')) {
            throw new Error('User authentication failed. Please log in again.');
          } else {
            throw new Error('Invalid reference: practice, location, or product not found');
          }
        } else if (movementError.code === '23505') {
          throw new Error('Duplicate movement detected. Please try again.');
        } else if (movementError.code === '23514') {
          throw new Error('Invalid data: check constraints failed');
        } else {
          throw new Error(`Failed to record stock movement: ${movementError.message}`);
        }
      }

      // Stock level is automatically updated by database triggers
      // No need for manual upsert anymore
      
      // Refresh data to reflect changes
      await fetchStockMovements(request.practice_id);

      return insertedMovement;
    } catch (error: any) {
      console.error('Error updating stock level:', {
        error,
        request,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details
      });
      
      // Rethrow with more user-friendly message
      if (error.message.includes('Invalid reference')) {
        throw new Error('Product, location, or practice not found. Please refresh and try again.');
      } else if (error.message.includes('Insufficient stock')) {
        throw error; // This error message is already user-friendly
      } else if (error.code === '23505' || error.message.includes('Duplicate')) {
        throw new Error('Another update is in progress. Please wait and try again.');
      } else {
        throw new Error(`Failed to update stock: ${error.message}`);
      }
    }
  };

  const fetchStockLevels = async (practiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_levels')
        .select(`
          *,
          product:products!inner(id, name, sku),
          location:practice_locations!inner(id, name, code)
        `)
        .eq('practice_id', practiceId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      stockLevels.value = data || [];
    } catch (error) {
      console.error('Error fetching stock levels:', error);
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
        fetchStockLevels(practiceId),
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
    const stockLevel = stockLevels.value.find(sl => 
      sl.product_id === productId && sl.location_id === locationId
    );
    return stockLevel?.current_quantity || 0;
  };

  const getProductBatches = (productId: string, locationId: string) => {
    // This would query product_batches table
    // For now, return empty array as this functionality is handled by the batch store
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

  // Real-time functions
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

    // Real-time state
    realtimeConnected,

    // Computed
    criticalAlerts,

    // Actions
    updateStockLevel,
    fetchStockLevels,
    fetchOrderSuggestions,
    fetchStockMovements,
    transferStock,
    refreshData,
    getProductStockAtLocation,
    getProductBatches,
    executeStockTransfer,

    // Real-time actions
    startRealtimeSubscription,
    stopRealtimeSubscription,
    initializeRealtime,
  };
});
