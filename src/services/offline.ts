import { ref, reactive } from 'vue';
import { supabase } from '@/services/supabase';
import type {
  Bestellijst,
  BestellijstItem,
  Product,
  ShoppingCart,
  ShoppingCartItem,
} from '@/types/supabase';
import { useAuthStore } from '@/stores/auth';
import { analyticsService } from './analytics';

export interface OfflineAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
  retry_count: number;
  practice_id: string;
  user_id: string;
}

export interface OfflineData {
  bestellijsten: Bestellijst[];
  bestellijst_items: BestellijstItem[];
  products: Product[];
  shopping_carts: ShoppingCart[];
  shopping_cart_items: ShoppingCartItem[];
  last_sync: Date | null;
}

export class OfflineService {
  private isOnline = ref(navigator.onLine);
  private offlineActions = ref<OfflineAction[]>([]);
  private offlineData = reactive<OfflineData>({
    bestellijsten: [],
    bestellijst_items: [],
    products: [],
    shopping_carts: [],
    shopping_cart_items: [],
    last_sync: null,
  });
  private syncInProgress = ref(false);
  private maxRetries = 3;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.setupNetworkListeners();
    this.loadOfflineData();
    this.startPeriodicSync();
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline.value = true;
      this.syncWhenOnline();
    });

    window.addEventListener('offline', () => {
      this.isOnline.value = false;
    });
  }

  /**
   * Check if device is online
   */
  getOnlineStatus(): boolean {
    return this.isOnline.value;
  }

  /**
   * Sync data when coming back online
   */
  private async syncWhenOnline(): Promise<void> {
    if (this.isOnline.value && !this.syncInProgress.value) {
      await this.syncToServer();
      await this.downloadLatestData();
    }
  }

  /**
   * Download latest data for offline use
   */
  async downloadLatestData(): Promise<void> {
    if (!this.isOnline.value) {
      return;
    }

    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;

    if (!practiceId) {
      return;
    }

    try {
      // Download bestellijsten
      const { data: bestellijsten, error: bestellijstenError } = await supabase
        .from('product_lists')
        .select('*')
        .eq('practice_id', practiceId);

      if (bestellijstenError) throw bestellijstenError;

      // Download bestellijst items
      const { data: items, error: itemsError } = await supabase
        .from('product_list_items')
        .select(
          `
          *,
          product_lists!inner (practice_id)
        `
        )
        .eq('product_lists.practice_id', practiceId);

      if (itemsError) throw itemsError;

      // Download products (only those in use)
      const productIds = [
        ...new Set(items?.map(item => item.product_id) || []),
      ];
      let products: Product[] = [];

      if (productIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) throw productsError;
        products = productsData || [];
      }

      // Download shopping carts
      const { data: carts, error: cartsError } = await supabase
        .from('shopping_carts')
        .select('*')
        .eq('practice_id', practiceId);

      if (cartsError) throw cartsError;

      // Download shopping cart items
      const cartIds = carts?.map(cart => cart.id) || [];
      let cartItems: ShoppingCartItem[] = [];

      if (cartIds.length > 0) {
        const { data: cartItemsData, error: cartItemsError } = await supabase
          .from('shopping_cart_items')
          .select('*')
          .in('cart_id', cartIds);

        if (cartItemsError) throw cartItemsError;
        cartItems = cartItemsData || [];
      }

      // Update offline data
      this.offlineData.bestellijsten = bestellijsten || [];
      this.offlineData.bestellijst_items =
        items?.map(item => ({
          ...item,
          last_counted: item.last_counted,
        })) || [];
      this.offlineData.products = products;
      this.offlineData.shopping_carts = carts || [];
      this.offlineData.shopping_cart_items = cartItems;
      this.offlineData.last_sync = new Date();

      // Save to localStorage
      this.saveOfflineData();

      // Track analytics
      analyticsService.trackEvent('offline_data_downloaded', {
        bestellijsten_count: this.offlineData.bestellijsten.length,
        items_count: this.offlineData.bestellijst_items.length,
        products_count: this.offlineData.products.length,
      });
    } catch (error) {
      console.error('Failed to download offline data:', error);
      throw error;
    }
  }

  /**
   * Get offline data
   */
  getOfflineData(): OfflineData {
    return this.offlineData;
  }

  /**
   * Add action to offline queue
   */
  addOfflineAction(
    type: OfflineAction['type'],
    table: string,
    data: any
  ): void {
    const authStore = useAuthStore();
    const practiceId = authStore.selectedPractice?.id;
    const userId = authStore.user?.id;

    if (!practiceId || !userId) {
      console.error('Cannot add offline action - no practice or user');
      return;
    }

    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: new Date(),
      retry_count: 0,
      practice_id: practiceId,
      user_id: userId,
    };

    this.offlineActions.value.push(action);
    this.saveOfflineActions();

    // Try to sync immediately if online
    if (this.isOnline.value) {
      this.syncToServer();
    }
  }

  /**
   * Sync offline actions to server
   */
  async syncToServer(): Promise<void> {
    if (
      !this.isOnline.value ||
      this.syncInProgress.value ||
      this.offlineActions.value.length === 0
    ) {
      return;
    }

    this.syncInProgress.value = true;

    try {
      console.log(
        `Syncing ${this.offlineActions.value.length} offline actions...`
      );

      const actionsToSync = [...this.offlineActions.value];
      const syncedActions: string[] = [];
      const failedActions: OfflineAction[] = [];

      for (const action of actionsToSync) {
        try {
          await this.syncSingleAction(action);
          syncedActions.push(action.id);
        } catch (error) {
          console.error('Failed to sync action:', action, error);

          // Increment retry count
          action.retry_count++;

          if (action.retry_count >= this.maxRetries) {
            console.error('Max retries reached for action:', action);
            // Remove from queue after max retries
            syncedActions.push(action.id);
          } else {
            failedActions.push(action);
          }
        }
      }

      // Remove synced actions
      this.offlineActions.value = this.offlineActions.value.filter(
        action => !syncedActions.includes(action.id)
      );

      // Update failed actions with new retry counts
      failedActions.forEach(failedAction => {
        const index = this.offlineActions.value.findIndex(
          a => a.id === failedAction.id
        );
        if (index !== -1) {
          this.offlineActions.value[index] = failedAction;
        }
      });

      this.saveOfflineActions();

      console.log(
        `Sync completed. Synced: ${syncedActions.length}, Failed: ${failedActions.length}`
      );

      // Track analytics
      analyticsService.trackEvent('offline_sync_completed', {
        synced_count: syncedActions.length,
        failed_count: failedActions.length,
        remaining_count: this.offlineActions.value.length,
      });
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress.value = false;
    }
  }

  /**
   * Sync a single action to server
   */
  private async syncSingleAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'create':
        await this.syncCreateAction(action);
        break;
      case 'update':
        await this.syncUpdateAction(action);
        break;
      case 'delete':
        await this.syncDeleteAction(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Sync create action
   */
  private async syncCreateAction(action: OfflineAction): Promise<void> {
    const { error } = await supabase.from(action.table).insert(action.data);

    if (error) {
      throw new Error(`Failed to sync create action: ${error.message}`);
    }
  }

  /**
   * Sync update action
   */
  private async syncUpdateAction(action: OfflineAction): Promise<void> {
    const { id, ...updateData } = action.data;

    const { error } = await supabase
      .from(action.table)
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to sync update action: ${error.message}`);
    }
  }

  /**
   * Sync delete action
   */
  private async syncDeleteAction(action: OfflineAction): Promise<void> {
    const { error } = await supabase
      .from(action.table)
      .delete()
      .eq('id', action.data.id);

    if (error) {
      throw new Error(`Failed to sync delete action: ${error.message}`);
    }
  }

  /**
   * Update bestellijst item offline
   */
  updateBestellijstItemOffline(
    itemId: string,
    updates: Partial<BestellijstItem>
  ): void {
    // Update local data
    const index = this.offlineData.bestellijst_items.findIndex(
      item => item.id === itemId
    );
    if (index !== -1) {
      this.offlineData.bestellijst_items[index] = {
        ...this.offlineData.bestellijst_items[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      this.saveOfflineData();
    }

    // Add to sync queue
    this.addOfflineAction('update', 'product_list_items', {
      id: itemId,
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Add product to cart offline
   */
  addToCartOffline(cartId: string, productId: string, quantity: number): void {
    // Update local data
    const existingItem = this.offlineData.shopping_cart_items.find(
      item => item.cart_id === cartId && item.product_id === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.updated_at = new Date().toISOString();

      this.addOfflineAction('update', 'shopping_cart_items', {
        id: existingItem.id,
        quantity: existingItem.quantity,
        updated_at: existingItem.updated_at,
      });
    } else {
      const newItem: ShoppingCartItem = {
        id: crypto.randomUUID(),
        cart_id: cartId,
        product_id: productId,
        quantity,
        notes: null,
        suggested_by: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.offlineData.shopping_cart_items.push(newItem);
      this.addOfflineAction('create', 'shopping_cart_items', newItem);
    }

    this.saveOfflineData();
  }

  /**
   * Save offline data to localStorage
   */
  private saveOfflineData(): void {
    try {
      localStorage.setItem(
        'remcura_offline_data',
        JSON.stringify({
          ...this.offlineData,
          last_sync: this.offlineData.last_sync?.toISOString(),
        })
      );
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  /**
   * Load offline data from localStorage
   */
  private loadOfflineData(): void {
    try {
      const saved = localStorage.getItem('remcura_offline_data');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(this.offlineData, {
          ...data,
          last_sync: data.last_sync ? new Date(data.last_sync) : null,
        });
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  /**
   * Save offline actions to localStorage
   */
  private saveOfflineActions(): void {
    try {
      localStorage.setItem(
        'remcura_offline_actions',
        JSON.stringify(
          this.offlineActions.value.map(action => ({
            ...action,
            timestamp: action.timestamp.toISOString(),
          }))
        )
      );
    } catch (error) {
      console.error('Failed to save offline actions:', error);
    }
  }

  /**
   * Load offline actions from localStorage
   */
  private loadOfflineActions(): void {
    try {
      const saved = localStorage.getItem('remcura_offline_actions');
      if (saved) {
        const actions = JSON.parse(saved);
        this.offlineActions.value = actions.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load offline actions:', error);
    }
  }

  /**
   * Start periodic sync
   */
  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline.value && this.offlineActions.value.length > 0) {
        this.syncToServer();
      }
    }, 5 * 60 * 1000);
  }

  /**
   * Clear all offline data
   */
  clearOfflineData(): void {
    this.offlineData.bestellijsten = [];
    this.offlineData.bestellijst_items = [];
    this.offlineData.products = [];
    this.offlineData.shopping_carts = [];
    this.offlineData.shopping_cart_items = [];
    this.offlineData.last_sync = null;

    this.offlineActions.value = [];

    localStorage.removeItem('remcura_offline_data');
    localStorage.removeItem('remcura_offline_actions');
  }

  /**
   * Get pending sync count
   */
  getPendingSyncCount(): number {
    return this.offlineActions.value.length;
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline.value,
      syncInProgress: this.syncInProgress.value,
      pendingActions: this.offlineActions.value.length,
      lastSync: this.offlineData.last_sync,
    };
  }

  /**
   * Force sync now
   */
  async forceSyncNow(): Promise<void> {
    if (this.isOnline.value) {
      await this.syncToServer();
      await this.downloadLatestData();
    } else {
      throw new Error('Cannot sync while offline');
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

export const offlineService = new OfflineService();
