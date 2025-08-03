import { ref, onUnmounted } from 'vue';
import { realtimeService } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';

export function useInventoryRealtime(
  currentPracticeId: Ref<string | null>,
  lastSyncAt: Ref<Date | null>,
  fetchStockMovements: (practiceId: string) => Promise<void>
) {
  // Real-time state
  const realtimeConnected = ref(false);
  const inventoryChannel = ref<any>(null);
  const movementsChannel = ref<any>(null);

  // Real-time functions
  const handleRealtimeUpdate = (payload: { eventType: string; new: Record<string, any>; old: Record<string, any> }) => {
    inventoryLogger.info('📡 Real-time inventory update:', payload);
    
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

  const handleStockLevelUpdate = async (payload: { eventType: string; new: StockLevel; old: StockLevel }) => {
    const practiceId = currentPracticeId.value;
    if (!practiceId) { return; }

    // For any stock level change, refresh the data
    // In a more sophisticated implementation, we could update just the changed record
    inventoryLogger.info('🔄 Stock level changed, refreshing data...');
    
    // Show a subtle notification that data was updated
    if (payload.eventType === 'UPDATE' && payload.old && payload.new) {
      const product = payload.new;
      inventoryLogger.info(`📊 Stock updated for product ${product.product_id}`);
    }
  };

  const handleStockMovementUpdate = async (payload: { eventType: string; new: StockMovement; old: StockMovement }) => {
    const practiceId = currentPracticeId.value;
    if (!practiceId) { return; }

    // Refresh movements when a new movement is added
    if (payload.eventType === 'INSERT') {
      inventoryLogger.info('📈 New stock movement, refreshing...');
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

    inventoryLogger.info('🔄 Starting real-time inventory subscription for practice:', practiceId);

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
    inventoryLogger.info('❌ Stopped real-time inventory subscription');
  };

  // Auto-start real-time when practice is available
  const initializeRealtime = () => {
    const practiceId = currentPracticeId.value;
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
    realtimeConnected,

    // Actions
    startRealtimeSubscription,
    stopRealtimeSubscription,
    initializeRealtime,
  };
}