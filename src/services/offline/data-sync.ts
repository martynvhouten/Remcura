import { reactive } from 'vue';
import { supabase } from 'src/boot/supabase';
import { handleSupabaseError } from 'src/utils/service-error-handler';
import { analyticsService } from '../analytics';
import type {
  Bestellijst,
  BestellijstItem,
  Product,
  ShoppingCart,
  ShoppingCartItem,
} from 'src/types/supabase';

export interface OfflineData {
  bestellijsten: Bestellijst[];
  bestellijst_items: BestellijstItem[];
  products: Product[];
  shopping_carts: ShoppingCart[];
  shopping_cart_items: ShoppingCartItem[];
  last_sync: Date | null;
}

export interface SyncProgress {
  phase:
    | 'bestellijsten'
    | 'items'
    | 'products'
    | 'carts'
    | 'cart_items'
    | 'complete';
  current: number;
  total: number;
  message: string;
}

export type SyncProgressCallback = (progress: SyncProgress) => void;

export class DataSyncManager {
  private data = reactive<OfflineData>({
    bestellijsten: [],
    bestellijst_items: [],
    products: [],
    shopping_carts: [],
    shopping_cart_items: [],
    last_sync: null,
  });

  private readonly storageKey = 'offline_data';
  private syncInProgress = false;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get current offline data
   */
  get offlineData(): OfflineData {
    // Break type inference to avoid deep instantiation with reactive proxy
    return this.data as any as OfflineData;
  }

  /**
   * Check if sync is in progress
   */
  get isSyncing(): boolean {
    return this.syncInProgress;
  }

  /**
   * Get last sync time
   */
  get lastSync(): Date | null {
    return this.data.last_sync;
  }

  /**
   * Download latest data for offline use
   */
  async downloadData(
    practiceId: string,
    onProgress?: SyncProgressCallback
  ): Promise<void> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;

    try {
      // Downloading latest data for offline use

      // Phase 1: Download bestellijsten
      onProgress?.({
        phase: 'bestellijsten',
        current: 0,
        total: 5,
        message: 'Downloading order lists...',
      });

      const bestellijsten = await this.downloadBestellijsten(practiceId);

      // Phase 2: Download bestellijst items
      onProgress?.({
        phase: 'items',
        current: 1,
        total: 5,
        message: 'Downloading order list items...',
      });

      const items = await this.downloadBestellijstItems(practiceId);

      // Phase 3: Download products
      onProgress?.({
        phase: 'products',
        current: 2,
        total: 5,
        message: 'Downloading products...',
      });

      const products = await this.downloadProducts(items);

      // Phase 4: Download shopping carts
      onProgress?.({
        phase: 'carts',
        current: 3,
        total: 5,
        message: 'Downloading shopping carts...',
      });

      const carts = await this.downloadShoppingCarts(practiceId);

      // Phase 5: Download shopping cart items
      onProgress?.({
        phase: 'cart_items',
        current: 4,
        total: 5,
        message: 'Downloading cart items...',
      });

      const cartItems = await this.downloadCartItems(carts);

      // Update data (cast data to break type inference for reactive proxy)
      const dataAny = this.data as any;
      dataAny.bestellijsten = bestellijsten;
      dataAny.bestellijst_items = items;
      dataAny.products = products;
      dataAny.shopping_carts = carts;
      dataAny.shopping_cart_items = cartItems;
      dataAny.last_sync = new Date();

      // Save to storage
      this.saveToStorage();

      onProgress?.({
        phase: 'complete',
        current: 5,
        total: 5,
        message: 'Sync complete',
      });

      // Offline data downloaded successfully

      // Track analytics
      analyticsService.trackEvent('offline_data_downloaded', {
        bestellijsten_count: bestellijsten.length,
        items_count: items.length,
        products_count: products.length,
        carts_count: carts.length,
        cart_items_count: cartItems.length,
      });
    } catch (error) {
      console.error('Failed to download offline data:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Download bestellijsten
   */
  private async downloadBestellijsten(
    practiceId: string
  ): Promise<Bestellijst[]> {
    const { data, error } = await supabase
      .from('product_lists')
      .select('*')
      .eq('practice_id', practiceId);

    if (error) {
      handleSupabaseError(error, {
        service: 'DataSyncManager',
        operation: 'downloadBestellijsten',
        practiceId,
      });
    }

    // boundary: external data from Supabase
    return (data as unknown as Bestellijst[]) || [];
  }

  /**
   * Download bestellijst items
   */
  private async downloadBestellijstItems(
    practiceId: string
  ): Promise<BestellijstItem[]> {
    const { data, error } = await supabase
      .from('product_list_items')
      .select(
        `
        *,
        product_lists!inner (practice_id)
      `
      )
      .eq('product_lists.practice_id', practiceId);

    if (error) {
      handleSupabaseError(error, {
        service: 'DataSyncManager',
        operation: 'downloadBestellijstItems',
        practiceId,
      });
    }

    // boundary: external data from Supabase with relations
    return (data || []).map(item => ({
      ...item,
      last_counted: item.last_counted,
    })) as unknown as BestellijstItem[];
  }

  /**
   * Download products (only those in use)
   */
  private async downloadProducts(items: BestellijstItem[]): Promise<Product[]> {
    const productIds = [...new Set(items.map(item => item.product_id))];

    if (productIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (error) {
      handleSupabaseError(error, {
        service: 'DataSyncManager',
        operation: 'downloadProducts',
        metadata: { productCount: productIds.length },
      });
    }

    return data || [];
  }

  /**
   * Download shopping carts
   */
  private async downloadShoppingCarts(
    practiceId: string
  ): Promise<ShoppingCart[]> {
    const { data, error } = await supabase
      .from('shopping_carts')
      .select('*')
      .eq('practice_id', practiceId);

    if (error) {
      handleSupabaseError(error, {
        service: 'DataSyncManager',
        operation: 'downloadShoppingCarts',
        practiceId,
      });
    }

    return data || [];
  }

  /**
   * Download shopping cart items
   */
  private async downloadCartItems(
    carts: ShoppingCart[]
  ): Promise<ShoppingCartItem[]> {
    const cartIds = carts.map(cart => cart.id);

    if (cartIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('shopping_cart_items')
      .select('*')
      .in('cart_id', cartIds);

    if (error) {
      handleSupabaseError(error, {
        service: 'DataSyncManager',
        operation: 'downloadCartItems',
        metadata: { cartCount: cartIds.length },
      });
    }

    return data || [];
  }

  /**
   * Clear all offline data
   */
  clearData(): void {
    this.data.bestellijsten = [];
    this.data.bestellijst_items = [];
    this.data.products = [];
    this.data.shopping_carts = [];
    this.data.shopping_cart_items = [];
    this.data.last_sync = null;

    this.saveToStorage();
  }

  /**
   * Get data statistics
   */
  getStats() {
    return {
      bestellijsten: this.data.bestellijsten.length,
      items: this.data.bestellijst_items.length,
      products: this.data.products.length,
      carts: this.data.shopping_carts.length,
      cartItems: this.data.shopping_cart_items.length,
      lastSync: this.data.last_sync,
      totalSize: this.calculateStorageSize(),
    };
  }

  /**
   * Calculate approximate storage size in bytes
   */
  private calculateStorageSize(): number {
    try {
      const serialized = JSON.stringify(this.data);
      return new Blob([serialized]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Save data to localStorage
   */
  private saveToStorage(): void {
    try {
      const serializedData = {
        ...this.data,
        last_sync: this.data.last_sync?.toISOString() || null,
      };
      localStorage.setItem(this.storageKey, JSON.stringify(serializedData));
    } catch (error) {
      console.error('Failed to save offline data to storage:', error);
    }
  }

  /**
   * Load data from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored);

        this.data.bestellijsten = parsedData.bestellijsten || [];
        this.data.bestellijst_items = parsedData.bestellijst_items || [];
        this.data.products = parsedData.products || [];
        this.data.shopping_carts = parsedData.shopping_carts || [];
        this.data.shopping_cart_items = parsedData.shopping_cart_items || [];
        this.data.last_sync = parsedData.last_sync
          ? new Date(parsedData.last_sync)
          : null;
      }
    } catch (error) {
      console.error('Failed to load offline data from storage:', error);
      this.clearData();
    }
  }
}

// Export singleton instance
export const dataSyncManager = new DataSyncManager();
