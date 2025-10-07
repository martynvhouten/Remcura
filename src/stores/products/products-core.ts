import { ref, computed, onUnmounted } from 'vue';
import { supabase } from '@/boot/supabase';
import { createLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';
import type { UserLoggedInPayload } from '@/types/events';
import { useApiCache } from '@/composables/useCache';
import type {
  ProductRow,
  ProductWithStock,
  ProductCategory,
  ProductFilter,
  StockLevelRow,
  SupplierProductRow,
} from '@/types/inventory';
// Removed unused type imports: Database, AnalyticsSummary

// RPC response interface for get_products_with_stock_levels

export function useProductsCore() {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('products-core');

  // ✅ PERFORMANCE OPTIMIZATION: API Cache for faster data loading
  const cache = useApiCache();

  // Current practice ID (from auth events)
  const currentPracticeId = ref<string | null>(null);

  // State
  const products = ref<ProductWithStock[]>([]);
  const categories = ref<ProductCategory[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);
  const filters = ref<ProductFilter>({
    search: '',
    category: '',
    supplier: '',
    stock_status: 'all',
    sort_by: 'name',
    sort_order: 'asc',
  });

  const productLog = createLogger('Products');
  const infoLog = (message: string, data?: Record<string, unknown>): void =>
    data ? productLog.structured(message, data) : productLog.info(message);
  const errorLog = (message: string, data?: Record<string, unknown>): void =>
    data ? productLog.structured(message, data) : productLog.error(message);

  // Set up event listeners for auth changes
  const unsubscribeAuth = eventEmitter.on<UserLoggedInPayload>(
    StoreEvents.USER_LOGGED_IN,
    async data => {
      currentPracticeId.value = data.clinicId ?? null;
      infoLog('Auth changed, auto-loading products', {
        clinicId: data.clinicId,
      });

      if (data.clinicId) {
        await fetchProducts(data.clinicId);
      }
    }
  );

  const unsubscribeLogout = eventEmitter.on(StoreEvents.USER_LOGGED_OUT, () => {
    currentPracticeId.value = null;
    products.value = [];
    categories.value = [];
    errorLog('User logged out, product data cleared');
  });

  // Clean up listeners
  onUnmounted(() => {
    unsubscribeAuth();
    unsubscribeLogout();
  });

  // Core getters
  const productStats = computed(() => {
    const stats = {
      total: products.value.length,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    };

    products.value.forEach(product => {
      const totalStock =
        product.stockLevels?.reduce(
          (sum, level) => sum + level.currentQuantity,
          0
        ) ?? 0;
      const minimumStock = 0;

      if (totalStock > minimumStock) {
        stats.inStock += 1;
      } else if (totalStock > 0) {
        stats.lowStock += 1;
      } else {
        stats.outOfStock += 1;
      }
    });

    return stats;
  });

  const availableCategories = computed(() => {
    const categorySet = new Set(
      products.value.map(p => p.category).filter(Boolean)
    );
    return Array.from(categorySet).sort();
  });

  const availableCountries = computed(() => {
    const countrySet = new Set(
      products.value.map(p => p.countryOfOrigin).filter(Boolean)
    );
    return Array.from(countrySet).sort();
  });

  const availableGpcCodes = computed(() => {
    const gpcSet = new Set(
      products.value
        .map(p => p.gpcBrickCode)
        .filter((code): code is string => Boolean(code))
    );
    return Array.from(gpcSet).sort();
  });

  const availableLifecycleStatuses = computed(() => {
    const statusSet = new Set(
      products.value
        .map(p => p.lifecycleStatus)
        .filter((status): status is string => Boolean(status))
    );
    return Array.from(statusSet).sort();
  });

  // Core actions
  const fetchProducts = async (practiceId: string, forceRefresh = false) => {
    if (loading.value) {
      return;
    }

    const cacheKey = `products:${practiceId}`;
    if (!forceRefresh) {
      const cachedProducts = cache.get(cacheKey) as ProductWithStock[] | null;
      if (cachedProducts && cachedProducts.length > 0) {
        products.value = cachedProducts;
        infoLog('Using cached products', {
          practiceId,
          count: cachedProducts.length,
        });
        return;
      }
    }

    loading.value = true;

    try {
      infoLog('Fetching products from Supabase');

      const supabaseProducts = await fetchProductsFromSupabase(practiceId);
      products.value = supabaseProducts as unknown as ProductWithStock[];
      lastSyncAt.value = new Date();

      cache.set(cacheKey, supabaseProducts, 5 * 60 * 1000);
      infoLog('Products loaded successfully', {
        total: supabaseProducts.length,
        practiceId,
      });
    } catch (error) {
      errorLog('Failed to fetch products', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsFromSupabase = async (
    practiceId: string
  ): Promise<(ProductRow & { stock_levels: StockLevelRow[] | null })[]> => {
    try {
      const { data: productRows, error: productsError } = await supabase
        .from('products')
        .select(
          `
          *,
          stock_levels(id, practice_id, product_id, location_id, current_quantity, reserved_quantity, minimum_quantity, maximum_quantity, reorder_point, preferred_supplier_id, last_counted_at, last_movement_at, last_ordered_at),
          supplier_products(id, supplier_id, supplier_name, supplier_sku, cost_price, currency, lead_time_days, is_preferred)
        `
        )
        .eq('practice_id', practiceId);

      if (productsError) {
        errorLog('Fallback product query failed', {
          error: productsError.message,
        });
        throw productsError;
      }

      const rows = (productRows ?? []) as Array<
        ProductRow & {
          stock_levels: StockLevelRow[] | null;
          supplier_products: any[] | null;
        }
      >;

      infoLog('Fallback product query succeeded', {
        count: rows.length,
      });

      return rows;
    } catch (error) {
      errorLog('Error fetching products from Supabase', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  // Removed unused determineStockStatus function

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set(
          (data ?? [])
            .map(item => item.category)
            .filter((cat): cat is string => Boolean(cat))
        )
      );

      categories.value = uniqueCategories.map(
        cat =>
          ({
            id: cat,
            name: cat,
            description: '',
            parent_id: undefined,
            sort_order: 0,
            is_active: true,
          }) satisfies ProductCategory
      );
    } catch (error) {
      errorLog('Error fetching categories', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  const refreshData = async (practiceId: string) => {
    try {
      await Promise.all([fetchProducts(practiceId), fetchCategories()]);
    } catch (error) {
      errorLog('Error refreshing product data', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  // CRUD operations
  const createProduct = async (productData: ProductRow) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorLog('Error creating product', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: ProductRow) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      errorLog('Error updating product', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    } catch (error) {
      errorLog('Error deleting product', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  // Utility functions
  const getProductById = (id: string): ProductWithStock | undefined => {
    return products.value.find(p => p.id === id);
  };

  const getProductBySku = (sku: string): ProductWithStock | undefined => {
    return products.value.find(p => p.sku === sku);
  };

  const requiresBatchTracking = (productId: string): boolean => {
    const product = getProductById(productId);
    return product?.requiresBatchTracking || false;
  };

  const batchTrackedProducts = computed(() => {
    return products.value.filter(p => p.requiresBatchTracking);
  });

  const manualStockProducts = computed(() =>
    products.value.filter(
      product => product.legacy?.batchStatus === 'manual_stock'
    )
  );

  return {
    // State
    products,
    categories,
    loading,
    lastSyncAt,
    filters,

    // Getters
    productStats,
    availableCategories,
    availableCountries,
    availableGpcCodes,
    availableLifecycleStatuses,
    batchTrackedProducts,
    manualStockProducts,

    // Actions
    fetchProducts,
    fetchCategories,
    refreshData,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getProductBySku,
    requiresBatchTracking,
  };
}
