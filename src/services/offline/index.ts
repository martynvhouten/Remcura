// Vue imports removed - not used in this file
import { useAuthStore } from 'src/stores/auth';
import { networkMonitor, type NetworkStatus } from './network-monitor';
import { actionQueue, type OfflineAction } from './action-queue';
import { dataSyncManager, type SyncProgressCallback } from './data-sync';
import { supabase } from 'src/boot/supabase';

export interface OfflineServiceConfig {
  autoSyncInterval?: number; // minutes
  maxRetries?: number;
  enablePeriodicSync?: boolean;
}

export class OfflineService {
  private config: OfflineServiceConfig;
  private periodicSyncTimer: NodeJS.Timeout | null = null;

  constructor(config: OfflineServiceConfig = {}) {
    this.config = {
      autoSyncInterval: 15, // Default 15 minutes
      maxRetries: 3,
      enablePeriodicSync: true,
      ...config,
    };

    this.initialize();
  }

  /**
   * Initialize the offline service
   */
  private initialize(): void {
    // Setup network status listener
    networkMonitor.addListener(this.handleNetworkChange.bind(this));

    // Register action executors
    this.registerActionExecutors();

    // Start periodic sync if enabled
    if (this.config.enablePeriodicSync) {
      this.startPeriodicSync();
    }
  }

  /**
   * Get network status
   */
  get isOnline(): boolean {
    return networkMonitor.isOnline;
  }

  /**
   * Get reactive network status
   */
  get networkStatus() {
    return networkMonitor.networkStatus;
  }

  /**
   * Get offline data
   */
  get offlineData() {
    return dataSyncManager.offlineData;
  }

  /**
   * Get pending actions count
   */
  get pendingActionsCount(): number {
    return actionQueue.count;
  }

  /**
   * Get failed actions
   */
  get failedActions() {
    return actionQueue.failedActions;
  }

  /**
   * Get sync status
   */
  get isSyncing(): boolean {
    return dataSyncManager.isSyncing;
  }

  /**
   * Get last sync time
   */
  get lastSync(): Date | null {
    return dataSyncManager.lastSync;
  }

  /**
   * Add an offline action
   */
  addAction(
    type: OfflineAction['type'],
    table: string,
    data: any,
    priority = 5
  ): string {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;
    const userId = authStore.user?.id;

    if (!practiceId || !userId) {
      throw new Error('Cannot add offline action - no practice or user');
    }

    const actionId = actionQueue.addAction(
      type,
      table,
      data,
      practiceId,
      userId,
      priority
    );

    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncActions();
    }

    return actionId;
  }

  /**
   * Download latest data for offline use
   */
  async downloadData(onProgress?: SyncProgressCallback): Promise<void> {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;

    if (!practiceId) {
      throw new Error('No practice selected for offline data download');
    }

    if (!this.isOnline) {
      throw new Error('Cannot download data - device is offline');
    }

    await dataSyncManager.downloadData(practiceId, onProgress);
  }

  /**
   * Sync pending actions to server
   */
  async syncActions(): Promise<boolean> {
    if (!this.isOnline || actionQueue.count === 0) {
      return false;
    }

    try {
      const results = await actionQueue.executeAll();
      const _successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      // Sync completed - debug logging removed

      return failureCount === 0;
    } catch (error) {
      console.error('Error during action sync:', error);
      return false;
    }
  }

  /**
   * Full sync - download data and sync actions
   */
  async fullSync(onProgress?: SyncProgressCallback): Promise<void> {
    if (!this.isOnline) {
      throw new Error('Cannot sync - device is offline');
    }

    // First sync actions
    await this.syncActions();

    // Then download latest data
    await this.downloadData(onProgress);
  }

  /**
   * Clear all offline data and actions
   */
  clearAll(): void {
    dataSyncManager.clearData();
    actionQueue.clear();
  }

  /**
   * Retry failed actions
   */
  retryFailedActions(): void {
    this.failedActions.forEach(action => {
      actionQueue.retryAction(action.id);
    });

    if (this.isOnline) {
      this.syncActions();
    }
  }

  /**
   * Get offline statistics
   */
  getStats() {
    return {
      network: {
        isOnline: this.isOnline,
        lastCheck: new Date(),
      },
      data: dataSyncManager.getStats(),
      actions: {
        pending: actionQueue.pendingActions.length,
        failed: actionQueue.failedActions.length,
        total: actionQueue.count,
      },
    };
  }

  /**
   * Handle network status changes
   */
  private handleNetworkChange(status: NetworkStatus): void {
    // Network status change handled

    if (status === 'online') {
      // When coming back online, sync actions and optionally refresh data
      this.syncActions();
    }
  }

  /**
   * Register action executors for different tables
   */
  private registerActionExecutors(): void {
    // Product list items executor
    actionQueue.registerExecutor('product_list_items', async action => {
      switch (action.type) {
        case 'create':
          await supabase.from('product_list_items').insert([action.data]);
          break;
        case 'update':
          await supabase
            .from('product_list_items')
            .update(action.data)
            .eq('id', action.data.id);
          break;
        case 'delete':
          await supabase
            .from('product_list_items')
            .delete()
            .eq('id', action.data.id);
          break;
      }
    });

    // Shopping cart items executor
    actionQueue.registerExecutor('shopping_cart_items', async action => {
      switch (action.type) {
        case 'create':
          await supabase.from('shopping_cart_items').insert([action.data]);
          break;
        case 'update':
          await supabase
            .from('shopping_cart_items')
            .update(action.data)
            .eq('id', action.data.id);
          break;
        case 'delete':
          await supabase
            .from('shopping_cart_items')
            .delete()
            .eq('id', action.data.id);
          break;
      }
    });

    // Shopping carts executor
    actionQueue.registerExecutor('shopping_carts', async action => {
      switch (action.type) {
        case 'create':
          await supabase.from('shopping_carts').insert([action.data]);
          break;
        case 'update':
          await supabase
            .from('shopping_carts')
            .update(action.data)
            .eq('id', action.data.id);
          break;
        case 'delete':
          await supabase
            .from('shopping_carts')
            .delete()
            .eq('id', action.data.id);
          break;
      }
    });
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    if (this.periodicSyncTimer) {
      clearInterval(this.periodicSyncTimer);
    }

    const intervalMs = (this.config.autoSyncInterval || 15) * 60 * 1000;

    this.periodicSyncTimer = setInterval(() => {
      if (this.isOnline && actionQueue.count > 0) {
        // Periodic sync triggered
        this.syncActions();
      }
    }, intervalMs);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync(): void {
    if (this.periodicSyncTimer) {
      clearInterval(this.periodicSyncTimer);
      this.periodicSyncTimer = null;
    }
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopPeriodicSync();
    networkMonitor.cleanup();
  }
}

// Export singleton instance
export const offlineService = new OfflineService();

// Export types and submodules for direct access if needed
export { networkMonitor } from './network-monitor';
export { actionQueue } from './action-queue';
export { dataSyncManager } from './data-sync';
export type { OfflineAction, SyncProgressCallback };
