import { ref, onUnmounted } from 'vue';
import { realtimeService } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';
import type { OrderListWithItems } from '@/types/stores';
import type { ReorderSuggestion } from './orderLists-minmax';

export function useOrderListsRealtime() {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('order-lists-realtime');

  // Real-time state
  const realtimeConnected = ref(false);
  const orderListsChannel = ref<any>(null);
  const stockLevelsChannel = ref<any>(null);
  const supplierOrdersChannel = ref<any>(null);
  const lastSyncAt = ref<Date | null>(null);

  // Configuration for external functions
  let currentPracticeId = ref<string | null>(null);
  let refreshOrderLists: ((practiceId: string) => Promise<void>) | null = null;
  let refreshReorderSuggestions:
    | ((practiceId: string) => Promise<void>)
    | null = null;

  // Real-time functions
  const startRealtimeSubscriptions = (practiceId: string) => {
    orderLogger.info(
      '🔄 Starting real-time subscriptions for practice:',
      practiceId
    );

    try {
      // Subscribe to order lists changes
      orderListsChannel.value = realtimeService.subscribe({
        schema: 'public',
        table: 'order_lists',
        filter: `practice_id=eq.${practiceId}`,
        event: '*',
        callback: handleOrderListChange,
      });

      // Subscribe to order list items changes
      const orderListItemsChannel = realtimeService.subscribe({
        schema: 'public',
        table: 'order_list_items',
        event: '*',
        callback: handleOrderListItemChange,
      });

      // Subscribe to stock levels changes (affects reorder suggestions)
      stockLevelsChannel.value = realtimeService.subscribe({
        schema: 'public',
        table: 'stock_levels',
        filter: `practice_id=eq.${practiceId}`,
        event: '*',
        callback: handleStockLevelChange,
      });

      // Subscribe to supplier orders (for order tracking)
      supplierOrdersChannel.value = realtimeService.subscribe({
        schema: 'public',
        table: 'supplier_orders',
        event: '*',
        callback: handleSupplierOrderChange,
      });

      realtimeConnected.value = true;
      orderLogger.info('✅ Real-time subscriptions started successfully');
    } catch (error) {
      orderLogger.error('❌ Failed to start real-time subscriptions:', error);
      realtimeConnected.value = false;
    }
  };

  const stopRealtimeSubscriptions = () => {
    orderLogger.info('🛑 Stopping real-time subscriptions');

    try {
      if (orderListsChannel.value) {
        realtimeService.unsubscribe(orderListsChannel.value);
        orderListsChannel.value = null;
      }

      if (stockLevelsChannel.value) {
        realtimeService.unsubscribe(stockLevelsChannel.value);
        stockLevelsChannel.value = null;
      }

      if (supplierOrdersChannel.value) {
        realtimeService.unsubscribe(supplierOrdersChannel.value);
        supplierOrdersChannel.value = null;
      }

      realtimeConnected.value = false;
      orderLogger.info('✅ Real-time subscriptions stopped');
    } catch (error) {
      orderLogger.error('❌ Error stopping real-time subscriptions:', error);
    }
  };

  // Event handlers
  const handleOrderListChange = async (payload: {
    eventType: string;
    new: OrderListWithItems;
    old: OrderListWithItems;
  }) => {
    orderLogger.info(
      '📡 Order list real-time update:',
      payload.eventType,
      payload.new?.name
    );

    const practiceId = currentPracticeId.value;
    if (!practiceId) return;

    try {
      switch (payload.eventType) {
        case 'INSERT':
          orderLogger.info('📝 New order list created:', payload.new.name);
          await eventEmitter.emit(StoreEvents.ORDER_LIST_CREATED, {
            orderList: payload.new,
            timestamp: new Date().toISOString(),
          });
          break;

        case 'UPDATE':
          orderLogger.info('📝 Order list updated:', payload.new.name);
          await eventEmitter.emit(StoreEvents.ORDER_LIST_UPDATED, {
            orderList: payload.new,
            oldOrderList: payload.old,
            timestamp: new Date().toISOString(),
          });
          break;

        case 'DELETE':
          orderLogger.info('🗑️ Order list deleted:', payload.old.name);
          await eventEmitter.emit(StoreEvents.ORDER_LIST_DELETED, {
            orderListId: payload.old.id,
            timestamp: new Date().toISOString(),
          });
          break;
      }

      // Refresh order lists to get latest data
      if (refreshOrderLists) {
        await refreshOrderLists(practiceId);
      }
      lastSyncAt.value = new Date();
    } catch (error) {
      orderLogger.error('❌ Error handling order list change:', error);
    }
  };

  const handleOrderListItemChange = async (payload: {
    eventType: string;
    new: any;
    old: any;
  }) => {
    orderLogger.info('📡 Order list item real-time update:', payload.eventType);

    const practiceId = currentPracticeId.value;
    if (!practiceId) return;

    try {
      // When order list items change, we need to:
      // 1. Refresh the affected order list
      // 2. Potentially update reorder suggestions

      if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
        // Check if min/max values changed
        const minMaxChanged =
          payload.new.minimum_stock !== payload.old.minimum_stock ||
          payload.new.maximum_stock !== payload.old.maximum_stock ||
          payload.new.current_stock !== payload.old.current_stock;

        if (minMaxChanged) {
          orderLogger.info('📊 Min/max values changed, refreshing suggestions');
          if (refreshReorderSuggestions) {
            await refreshReorderSuggestions(practiceId);
          }

          await eventEmitter.emit(StoreEvents.ORDER_SUGGESTIONS_UPDATED, {
            practiceId,
            itemId: payload.new.id,
            changeType: 'min_max_updated',
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Always refresh order lists for any item change
      if (refreshOrderLists) {
        await refreshOrderLists(practiceId);
      }
      lastSyncAt.value = new Date();
    } catch (error) {
      orderLogger.error('❌ Error handling order list item change:', error);
    }
  };

  const handleStockLevelChange = async (payload: {
    eventType: string;
    new: any;
    old: any;
  }) => {
    orderLogger.info('📡 Stock level real-time update:', payload.eventType);

    const practiceId = currentPracticeId.value;
    if (!practiceId) return;

    try {
      if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
        const quantityChanged =
          payload.new.current_quantity !== payload.old.current_quantity;

        if (quantityChanged) {
          orderLogger.info('📦 Stock quantity changed, updating suggestions');

          // Emit stock level updated event
          await eventEmitter.emit(StoreEvents.STOCK_LEVEL_UPDATED, {
            productId: payload.new.product_id,
            locationId: payload.new.location_id,
            oldQuantity: payload.old.current_quantity,
            newQuantity: payload.new.current_quantity,
            timestamp: new Date().toISOString(),
          });

          // Check if this triggers low stock alert
          const minQuantity = payload.new.minimum_quantity || 0;
          if (
            payload.new.current_quantity <= minQuantity &&
            payload.old.current_quantity > minQuantity
          ) {
            await eventEmitter.emit(StoreEvents.LOW_STOCK_ALERT, {
              productId: payload.new.product_id,
              locationId: payload.new.location_id,
              currentQuantity: payload.new.current_quantity,
              minimumQuantity: minQuantity,
              timestamp: new Date().toISOString(),
            });
          }

          // Refresh reorder suggestions
          if (refreshReorderSuggestions) {
            await refreshReorderSuggestions(practiceId);
          }

          await eventEmitter.emit(StoreEvents.ORDER_SUGGESTIONS_UPDATED, {
            practiceId,
            itemId: payload.new.product_id,
            changeType: 'stock_updated',
            timestamp: new Date().toISOString(),
          });
        }
      }

      lastSyncAt.value = new Date();
    } catch (error) {
      orderLogger.error('❌ Error handling stock level change:', error);
    }
  };

  const handleSupplierOrderChange = async (payload: {
    eventType: string;
    new: any;
    old: any;
  }) => {
    orderLogger.info('📡 Supplier order real-time update:', payload.eventType);

    try {
      if (payload.eventType === 'UPDATE' && payload.new && payload.old) {
        const statusChanged = payload.new.status !== payload.old.status;

        if (statusChanged) {
          orderLogger.info(
            `📬 Supplier order status changed: ${payload.old.status} → ${payload.new.status}`
          );

          await eventEmitter.emit(StoreEvents.ORDER_STATUS_CHANGED, {
            orderId: payload.new.id,
            supplierOrderId: payload.new.id,
            oldStatus: payload.old.status,
            newStatus: payload.new.status,
            timestamp: new Date().toISOString(),
          });

          // If order is delivered, we might want to update stock levels
          if (payload.new.status === 'delivered') {
            orderLogger.info(
              '📦 Order delivered, stock levels may need updating'
            );

            const practiceId = currentPracticeId.value;
            if (practiceId) {
              // Small delay to allow database triggers to process
              setTimeout(async () => {
                if (refreshReorderSuggestions) {
                  await refreshReorderSuggestions(practiceId);
                }
              }, 2000);
            }
          }
        }
      }

      lastSyncAt.value = new Date();
    } catch (error) {
      orderLogger.error('❌ Error handling supplier order change:', error);
    }
  };

  // Periodic sync function (backup for real-time)
  const periodicSync = ref<NodeJS.Timeout | null>(null);

  const startPeriodicSync = (practiceId: string, intervalMs = 60000) => {
    stopPeriodicSync();

    periodicSync.value = setInterval(async () => {
      if (!realtimeConnected.value) {
        orderLogger.info(
          '🔄 Periodic sync: real-time disconnected, syncing data'
        );
        try {
          const promises = [];
          if (refreshOrderLists) {
            promises.push(refreshOrderLists(practiceId));
          }
          if (refreshReorderSuggestions) {
            promises.push(refreshReorderSuggestions(practiceId));
          }
          await Promise.all(promises);
          lastSyncAt.value = new Date();
        } catch (error) {
          orderLogger.error('❌ Periodic sync failed:', error);
        }
      }
    }, intervalMs);

    orderLogger.info(`⏰ Started periodic sync every ${intervalMs}ms`);
  };

  const stopPeriodicSync = () => {
    if (periodicSync.value) {
      clearInterval(periodicSync.value);
      periodicSync.value = null;
      orderLogger.info('⏰ Stopped periodic sync');
    }
  };

  // Connection health monitoring
  const connectionHealth = ref<'healthy' | 'warning' | 'error'>('healthy');
  const lastConnectionCheck = ref<Date | null>(null);

  const checkConnectionHealth = () => {
    const now = new Date();
    lastConnectionCheck.value = now;

    if (!realtimeConnected.value) {
      connectionHealth.value = 'error';
      return;
    }

    if (lastSyncAt.value) {
      const timeSinceLastSync = now.getTime() - lastSyncAt.value.getTime();
      const maxSyncAge = 5 * 60 * 1000; // 5 minutes

      if (timeSinceLastSync > maxSyncAge) {
        connectionHealth.value = 'warning';
        orderLogger.warn(
          '⚠️ Real-time connection health warning: no sync in 5+ minutes'
        );
      } else {
        connectionHealth.value = 'healthy';
      }
    }
  };

  // Start health monitoring
  const healthCheckInterval = setInterval(checkConnectionHealth, 30000); // Every 30 seconds

  // Cleanup
  onUnmounted(() => {
    stopRealtimeSubscriptions();
    stopPeriodicSync();
    clearInterval(healthCheckInterval);
  });

  // Setup and teardown functions for external configuration
  const setupRealtime = (config: {
    practiceId: string;
    refreshOrderListsFn: (practiceId: string) => Promise<void>;
    refreshReorderSuggestionsFn: (practiceId: string) => Promise<void>;
    enablePeriodicSync?: boolean;
    syncIntervalMs?: number;
  }) => {
    orderLogger.info('🚀 Setting up real-time order lists system');

    // Configure external functions
    currentPracticeId.value = config.practiceId;
    refreshOrderLists = config.refreshOrderListsFn;
    refreshReorderSuggestions = config.refreshReorderSuggestionsFn;

    // Start real-time subscriptions
    startRealtimeSubscriptions(config.practiceId);

    // Start periodic sync if enabled
    if (config.enablePeriodicSync !== false) {
      startPeriodicSync(config.practiceId, config.syncIntervalMs);
    }

    orderLogger.info('✅ Real-time order lists system configured');
  };

  const teardownRealtime = () => {
    orderLogger.info('🛑 Tearing down real-time order lists system');

    stopRealtimeSubscriptions();
    stopPeriodicSync();

    // Clear configuration
    currentPracticeId.value = null;
    refreshOrderLists = null;
    refreshReorderSuggestions = null;

    orderLogger.info('✅ Real-time order lists system torn down');
  };

  return {
    // State
    realtimeConnected,
    lastSyncAt,
    connectionHealth,
    lastConnectionCheck,

    // Actions
    startRealtimeSubscriptions,
    stopRealtimeSubscriptions,
    startPeriodicSync,
    stopPeriodicSync,
    checkConnectionHealth,
    setupRealtime,
    teardownRealtime,
  };
}
