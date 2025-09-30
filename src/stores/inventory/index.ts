import { defineStore } from 'pinia';
import { useInventoryCore } from './inventory-core';
import { useInventoryMovements } from './inventory-movements';
import { useInventoryAlerts } from './inventory-alerts';
import { useInventoryRealtime } from './inventory-realtime';

export const useInventoryStore = defineStore('inventory', () => {
  // Initialize core modules
  const core = useInventoryCore();
  const movements = useInventoryMovements(
    core.currentPracticeId,
    core.currentUserId
  );
  const alerts = useInventoryAlerts(core.stockLevels);
  const realtime = useInventoryRealtime(
    core.currentPracticeId,
    core.lastSyncAt,
    movements.fetchStockMovements
  );

  // Combined refresh data function
  const refreshData = async (practiceId: string) => {
    await Promise.all([
      core.fetchStockLevels(practiceId),
      alerts.fetchOrderSuggestions(practiceId),
      movements.fetchStockMovements(practiceId),
    ]);
  };

  // Return all public APIs from modules
  // This maintains the exact same interface as the original store
  return {
    // State from core
    stockLevels: core.stockLevels,
    loading: core.loading,
    lastSyncAt: core.lastSyncAt,

    // State from movements
    stockMovements: movements.stockMovements,
    stockMovementsTotal: movements.stockMovementsTotal,

    // State from alerts
    orderSuggestions: alerts.orderSuggestions,

    // State from realtime
    realtimeConnected: realtime.realtimeConnected,

    // Computed from alerts
    criticalAlerts: alerts.criticalAlerts,

    // Actions from movements
    updateStockLevel: movements.updateStockLevel,
    fetchStockMovements: movements.fetchStockMovements,
    transferStock: movements.transferStock,
    executeStockTransfer: movements.executeStockTransfer,

    // Actions from core
    fetchStockLevels: core.fetchStockLevels,

    // Actions from alerts
    fetchOrderSuggestions: alerts.fetchOrderSuggestions,
    getProductStockAtLocation: alerts.getProductStockAtLocation,

    // Actions from realtime
    startRealtimeSubscription: realtime.startRealtimeSubscription,
    stopRealtimeSubscription: realtime.stopRealtimeSubscription,
    initializeRealtime: realtime.initializeRealtime,

    // Combined actions
    refreshData,
  };
});
