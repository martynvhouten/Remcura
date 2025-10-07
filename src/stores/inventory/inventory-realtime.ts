import { ref, onUnmounted, type Ref } from 'vue';
import { realtimeService } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';
import type { StockLevelRow } from '@/types/inventory';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useInventoryRealtime(
  currentPracticeId: Ref<string | null>,
  lastSyncAt: Ref<Date | null>,
  fetchStockMovements?: (practiceId: string) => Promise<void>
) {
  // Real-time state
  const realtimeConnected = ref(false);
  const inventoryChannel = ref<RealtimeChannel | null>(null);

  // Real-time functions
  const handleStockLevelUpdate = async (payload: {
    eventType: string;
    new: StockLevelRow;
    old: StockLevelRow;
  }) => {
    const practiceId = currentPracticeId.value;
    if (!practiceId) {
      return;
    }

    inventoryLogger.info('🔄 Stock level changed, refreshing data...');

    if (payload.eventType === 'INSERT' && fetchStockMovements) {
      const currentId = currentPracticeId.value;
      if (currentId) {
        inventoryLogger.info('📈 New stock movement, refreshing...');
        await fetchStockMovements(currentId);
      }
    }
  };

  // Removed unused handleStockMovementUpdate function

  const startRealtimeSubscription = (practiceId: string) => {
    if (inventoryChannel.value) {
      void realtimeService.unsubscribe(inventoryChannel.value as any);
    }

    inventoryLogger.info(
      '🔄 Starting real-time inventory subscription for practice:',
      practiceId
    );

    inventoryChannel.value = realtimeService.subscribeToStockLevels(
      practiceId,
      payload => {
        if (!payload.new) {
          return;
        }

        handleStockLevelUpdate({
          eventType: payload.eventType,
          new: payload.new as StockLevelRow,
          old: (payload.old ?? {}) as StockLevelRow,
        });

        lastSyncAt.value = new Date();
      }
    );

    realtimeConnected.value = true;
  };

  const stopRealtimeSubscription = async () => {
    if (inventoryChannel.value) {
      await realtimeService.unsubscribe(inventoryChannel.value as any);
      inventoryChannel.value = null;
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
    void stopRealtimeSubscription();
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
