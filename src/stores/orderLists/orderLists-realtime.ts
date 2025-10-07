import { ref, onUnmounted } from 'vue';
import { realtimeService } from '@/boot/supabase';
import { createLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';
import type { OrderListWithItems } from '@/types/stores';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import type { Tables } from '@/types';
import type { RealtimeChannel } from '@supabase/supabase-js';

const orderLoggerWithContext = createLogger('OrderListsRealtime');
const infoLog = (message: string, data?: Record<string, unknown>): void =>
  data
    ? orderLoggerWithContext.structured(message, data)
    : orderLoggerWithContext.info(message);
const errorLog = (message: string, data?: Record<string, unknown>): void =>
  data
    ? orderLoggerWithContext.structured(message, data)
    : orderLoggerWithContext.error(message);

export function useOrderListsRealtime() {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('order-lists-realtime');

  // Real-time state
  const realtimeConnected = ref(false);
  const orderListsChannel = ref<RealtimeChannel | null>(null);
  const orderListItemsChannel = ref<RealtimeChannel | null>(null);
  const stockLevelsChannel = ref<RealtimeChannel | null>(null);
  const supplierOrdersChannel = ref<RealtimeChannel | null>(null);
  const lastSyncAt = ref<Date | null>(null);

  // Configuration for external functions
  const currentPracticeId = ref<string | null>(null);
  let refreshOrderLists: ((practiceId: string) => Promise<void>) | null = null;
  let refreshReorderSuggestions:
    | ((practiceId: string) => Promise<void>)
    | null = null;

  // Removed unused type declarations

  type OrderListPayload = RealtimePostgresChangesPayload<Tables<'order_lists'>>;
  type OrderListItemPayload = RealtimePostgresChangesPayload<
    Tables<'order_list_items'>
  >;
  type StockLevelPayload = RealtimePostgresChangesPayload<
    Tables<'stock_levels'>
  >;
  type SupplierOrderPayload = RealtimePostgresChangesPayload<
    Tables<'supplier_orders'>
  >;

  // Real-time functions
  const startRealtimeSubscriptions = (practiceId: string) => {
    infoLog('Realtime: starting subscriptions', { practiceId });

    try {
      // Subscribe to order lists changes
      orderListsChannel.value = realtimeService.subscribeToOrderLists(
        practiceId,
        handleOrderListChange
      );

      orderListItemsChannel.value = realtimeService.subscribeToOrderListItems(
        handleOrderListItemChange
      );

      stockLevelsChannel.value = realtimeService.subscribeToStockLevels(
        practiceId,
        handleStockLevelChange
      );

      supplierOrdersChannel.value = realtimeService.subscribeToSupplierOrders(
        handleSupplierOrderChange
      );

      realtimeConnected.value = true;
      infoLog('Realtime: subscriptions started');
    } catch (error) {
      errorLog('❌ Failed to start real-time subscriptions', {
        error: error instanceof Error ? error.message : String(error),
      });
      realtimeConnected.value = false;
    }
  };

  const stopRealtimeSubscriptions = async () => {
    infoLog('Realtime: stopping subscriptions');

    try {
      if (orderListsChannel.value) {
        await realtimeService.unsubscribe(orderListsChannel.value as any);
        orderListsChannel.value = null;
      }

      for (const channelRef of [
        orderListItemsChannel,
        stockLevelsChannel,
        supplierOrdersChannel,
      ]) {
        if (channelRef.value) {
          await realtimeService.unsubscribe(channelRef.value as any);
          channelRef.value = null;
        }
      }

      realtimeConnected.value = false;
      infoLog('Realtime: subscriptions stopped');
    } catch (error) {
      errorLog('Error stopping real-time subscriptions', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Event handlers
  const handleOrderListChange = async (payload: OrderListPayload) => {
    const { eventType } = payload;
    const newRow = payload.new as Tables<'order_lists'> | null;
    const oldRow = payload.old as Tables<'order_lists'> | null;

    infoLog('Realtime: order list update', {
      eventType,
      name: newRow?.name,
    });

    const practiceId = currentPracticeId.value;
    if (!practiceId) return;

    try {
      switch (eventType) {
        case 'INSERT':
          if (newRow) {
            infoLog('Realtime: order list created', {
              name: newRow.name,
            });
            await eventEmitter.emit(StoreEvents.ORDER_CREATED, {
              orderList: { id: newRow.id } as OrderListWithItems,
              timestamp: new Date().toISOString(),
            });
          }
          break;

        case 'UPDATE':
          if (newRow) {
            infoLog('Realtime: order list updated', {
              name: newRow.name,
            });
            await eventEmitter.emit(StoreEvents.ORDER_UPDATED, {
              orderList: { id: newRow.id } as OrderListWithItems,
              oldOrderList: oldRow
                ? ({ id: oldRow.id } as OrderListWithItems)
                : null,
              timestamp: new Date().toISOString(),
            });
          }
          break;

        case 'DELETE':
          if (oldRow) {
            infoLog('Realtime: order list deleted', {
              name: oldRow.name,
            });
            await eventEmitter.emit(StoreEvents.ORDER_DELETED, {
              orderListId: oldRow.id,
              timestamp: new Date().toISOString(),
            });
          }
          break;
      }

      // Refresh order lists to get latest data
      if (refreshOrderLists) {
        await refreshOrderLists(practiceId);
      }
      await eventEmitter.emit(StoreEvents.DATA_REFRESH_COMPLETED, {
        scope: 'order_lists',
        practiceId,
        timestamp: new Date().toISOString(),
      });
      lastSyncAt.value = new Date();
    } catch (error) {
      errorLog('Error handling order list change', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleOrderListItemChange = async (payload: OrderListItemPayload) => {
    const { eventType } = payload;
    const newRow = payload.new as Tables<'order_list_items'> | null;
    const oldRow = payload.old as Tables<'order_list_items'> | null;

    infoLog('Realtime: order list item update', {
      eventType,
    });

    const practiceId = currentPracticeId.value;
    if (!practiceId) return;

    try {
      // When order list items change, we need to:
      // 1. Refresh the affected order list
      // 2. Potentially update reorder suggestions

      if (eventType === 'UPDATE' && newRow && oldRow) {
        // Check if min/max values changed
        const minMaxChanged =
          newRow.minimum_stock !== oldRow.minimum_stock ||
          newRow.maximum_stock !== oldRow.maximum_stock ||
          newRow.current_stock !== oldRow.current_stock;

        if (minMaxChanged) {
          infoLog('Realtime: inventory thresholds updated', {
            itemId: newRow.id,
          });
          if (refreshReorderSuggestions) {
            await refreshReorderSuggestions(practiceId);
          }

          await eventEmitter.emit(StoreEvents.DATA_REFRESH_REQUESTED, {
            scope: 'reorder_suggestions',
            practiceId,
            itemId: newRow.id,
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
      errorLog('Error handling order list item change', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleStockLevelChange = async (payload: StockLevelPayload) => {
    const { eventType } = payload;
    const newRow = payload.new as Tables<'stock_levels'> | null;
    const oldRow = payload.old as Tables<'stock_levels'> | null;

    infoLog('Realtime: stock level update', {
      eventType,
    });

    const practiceId = currentPracticeId.value;
    if (!practiceId) return;

    try {
      if (eventType === 'UPDATE' && newRow && oldRow) {
        const quantityChanged =
          newRow.current_quantity !== oldRow.current_quantity;

        if (quantityChanged) {
          infoLog('Realtime: stock quantity changed', {
            productId: newRow.product_id,
            locationId: newRow.location_id,
          });

          // Emit stock level updated event
          await eventEmitter.emit(StoreEvents.DATA_REFRESH_REQUESTED, {
            scope: 'stock_levels',
            productId: newRow.product_id,
            locationId: newRow.location_id,
            changeType: 'quantity_change',
            timestamp: new Date().toISOString(),
          });

          // Check if this triggers low stock alert
          const minQuantity = newRow.minimum_quantity ?? 0;
          if (
            (newRow.current_quantity ?? 0) <= minQuantity &&
            (oldRow.current_quantity ?? 0) > minQuantity
          ) {
            await eventEmitter.emit(StoreEvents.DATA_REFRESH_REQUESTED, {
              scope: 'low_stock_alert',
              productId: newRow.product_id,
              locationId: newRow.location_id,
              currentQuantity: newRow.current_quantity ?? 0,
              minimumQuantity: minQuantity,
              timestamp: new Date().toISOString(),
            });
          }

          // Refresh reorder suggestions
          if (refreshReorderSuggestions) {
            await refreshReorderSuggestions(practiceId);
          }

          await eventEmitter.emit(StoreEvents.DATA_REFRESH_COMPLETED, {
            scope: 'order_suggestions',
            practiceId,
            itemId: newRow.product_id,
            changeType: 'stock_updated',
            timestamp: new Date().toISOString(),
          });
        }
      }

      lastSyncAt.value = new Date();
    } catch (error) {
      errorLog('Error handling stock level change', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const handleSupplierOrderChange = async (payload: SupplierOrderPayload) => {
    const { eventType } = payload;
    const newRow = payload.new as Tables<'supplier_orders'> | null;
    const oldRow = payload.old as Tables<'supplier_orders'> | null;

    infoLog('Realtime: supplier order update', {
      eventType,
    });

    try {
      if (eventType === 'UPDATE' && newRow && oldRow) {
        const statusChanged = newRow.status !== oldRow.status;

        if (statusChanged) {
          infoLog('Realtime: supplier order status changed', {
            orderId: newRow.id,
            from: oldRow.status,
            to: newRow.status,
          });

          await eventEmitter.emit(StoreEvents.DATA_REFRESH_REQUESTED, {
            scope: 'supplier_orders',
            orderId: newRow.id,
            oldStatus: oldRow.status,
            newStatus: newRow.status,
            timestamp: new Date().toISOString(),
          });

          if (newRow.status === 'delivered') {
            infoLog('Realtime: supplier order delivered', {
              orderId: newRow.id,
            });

            const practiceId = currentPracticeId.value;
            if (practiceId) {
              setTimeout(async () => {
                try {
                  if (refreshReorderSuggestions) {
                    await refreshReorderSuggestions(practiceId);
                  }
                  if (refreshOrderLists) {
                    await refreshOrderLists(practiceId);
                  }
                } catch (refreshError) {
                  errorLog('Error during post-delivery refresh', {
                    error:
                      refreshError instanceof Error
                        ? refreshError.message
                        : String(refreshError),
                  });
                }
              }, 1000);
            }
          }
        }
      }

      lastSyncAt.value = new Date();
    } catch (error) {
      errorLog('Error handling supplier order change', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  // Periodic sync function (backup for real-time)
  const periodicSync = ref<ReturnType<typeof setInterval> | null>(null);

  const startPeriodicSync = (practiceId: string, intervalMs = 60000) => {
    stopPeriodicSync();

    periodicSync.value = setInterval(async () => {
      if (!realtimeConnected.value) {
        infoLog('🔄 Periodic sync: real-time disconnected, syncing data');
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
          errorLog('Periodic sync failed', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }, intervalMs);

    infoLog(`⏰ Started periodic sync every ${intervalMs}ms`);
  };

  const stopPeriodicSync = () => {
    if (periodicSync.value) {
      clearInterval(periodicSync.value);
      periodicSync.value = null;
      infoLog('⏰ Stopped periodic sync');
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
        infoLog(
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
    void stopRealtimeSubscriptions();
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
    infoLog('🚀 Setting up real-time order lists system');

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

    infoLog('✅ Real-time order lists system configured');
  };

  const teardownRealtime = () => {
    infoLog('🛑 Tearing down real-time order lists system');

    stopRealtimeSubscriptions();
    stopPeriodicSync();

    // Clear configuration
    currentPracticeId.value = null;
    refreshOrderLists = null;
    refreshReorderSuggestions = null;

    infoLog('✅ Real-time order lists system torn down');
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
