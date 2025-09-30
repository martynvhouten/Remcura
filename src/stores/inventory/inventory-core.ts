import { ref, onUnmounted } from 'vue';
import { supabase } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';
import type { StockLevelView } from '@/types/inventory';
import { mapStockLevelRowToView } from '@/types/inventory';

export function useInventoryCore() {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('inventory-store');

  // Current practice ID (from auth events)
  const currentPracticeId = ref<string | null>(null);
  const currentUserId = ref<string | null>(null);

  // Core state
  const stockLevels = ref<StockLevelView[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Set up event listeners for auth changes
  const unsubscribeAuth = eventEmitter.on(
    StoreEvents.USER_LOGGED_IN,
    (data: { clinicId: string; user: { id: string } }) => {
      currentPracticeId.value = data.clinicId;
      currentUserId.value = data.user?.id;
      inventoryLogger.info('Auth changed, practice ID updated:', data.clinicId);
    }
  );

  const unsubscribeLogout = eventEmitter.on(StoreEvents.USER_LOGGED_OUT, () => {
    currentPracticeId.value = null;
    currentUserId.value = null;
    // Clear inventory data on logout
    stockLevels.value = [];
    inventoryLogger.info('User logged out, inventory data cleared');
  });

  // Clean up listeners on unmount
  onUnmounted(() => {
    unsubscribeAuth();
    unsubscribeLogout();
  });

  const fetchStockLevels = async (practiceId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('practice_id', practiceId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      stockLevels.value = (data ?? []).map(row => mapStockLevelRowToView(row));
    } catch (error) {
      inventoryLogger.error('Error fetching stock levels:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const refreshData = async (practiceId: string) => {
    try {
      await fetchStockLevels(practiceId);
    } catch (error) {
      inventoryLogger.error('Error refreshing core inventory data:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  return {
    // State
    currentPracticeId,
    currentUserId,
    stockLevels,
    loading,
    lastSyncAt,

    // Event emitter (shared across modules)
    eventEmitter,

    // Actions
    fetchStockLevels,
    refreshData,
  };
}
