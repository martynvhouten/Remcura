import { ref, computed, onUnmounted } from 'vue';
import { supabase } from '@/boot/supabase';
import { magentoApi } from '@/services/magento';
import { productService } from '@/services/supabase';
import { productLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents, type UserLoggedInPayload, type UserLoggedOutPayload } from '@/utils/eventBus';
import type {
  Product,
  ProductWithStock,
  ProductCategory,
  ProductFilter,
} from '@/types/inventory';

// RPC response interface for get_products_with_stock_levels
interface ProductWithStockRPC {
  product: Product;
  stock_levels: Array<{ location_id: string; current_quantity: number; minimum_quantity: number }>;
  total_stock: number;
}

export function useProductsCore() {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('products-core');
  
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

  // Set up event listeners for auth changes
  const unsubscribeAuth = eventEmitter.on(StoreEvents.USER_LOGGED_IN, async (data: UserLoggedInPayload) => {
    currentPracticeId.value = data.clinicId;
    productLogger.info('Auth changed, auto-loading products for practice:', data.clinicId);
    
    // Auto-load products when user logs in
    if (data.clinicId) {
      await fetchProducts(data.clinicId);
    }
  });

  const unsubscribeLogout = eventEmitter.on(StoreEvents.USER_LOGGED_OUT, () => {
    currentPracticeId.value = null;
    // Clear product data on logout
    products.value = [];
    categories.value = [];
    productLogger.info('User logged out, product data cleared');
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
      const totalStock = product.stock_levels?.reduce((sum, level) => sum + level.current_quantity, 0) || 0;
      if (totalStock > product.minimum_stock) {
        stats.inStock++;
      } else if (totalStock > 0) {
        stats.lowStock++;
      } else {
        stats.outOfStock++;
      }
    });

    return stats;
  });

  const availableCategories = computed(() => {
    const categorySet = new Set(products.value.map(p => p.category).filter(Boolean));
    return Array.from(categorySet).sort();
  });

  const availableCountries = computed(() => {
    const countrySet = new Set(products.value.map(p => p.country_of_origin).filter(Boolean));
    return Array.from(countrySet).sort();
  });

  const availableGpcCodes = computed(() => {
    const gpcSet = new Set(products.value.map(p => p.gpc_code).filter(Boolean));
    return Array.from(gpcSet).sort();
  });

  const availableLifecycleStatuses = computed(() => {
    const statusSet = new Set(products.value.map(p => p.lifecycle_status).filter(Boolean));
    return Array.from(statusSet).sort();
  });

  // Core actions
  const fetchProducts = async (practiceId: string) => {
    if (loading.value) { return; }
    loading.value = true;
    
    try {
      productLogger.info('Fetching products from all sources');

      // Try to fetch from both Magento and Supabase
      let magentoProducts: ProductWithStock[] = [];
      let supabaseProducts: ProductWithStock[] = [];

      try {
        magentoProducts = await fetchProductsFromMagento();
        productLogger.info(`Fetched ${magentoProducts.length} products from Magento`);
      } catch (error) {
        productLogger.warn('⚠️ Magento sync failed, using Supabase data only:', error);
      }

      try {
        supabaseProducts = await fetchProductsFromSupabase(practiceId, !!magentoProducts.length);
        productLogger.info(`Fetched ${supabaseProducts.length} products from Supabase`);
      } catch (error) {
        productLogger.error('❌ Error fetching products:', error);
        throw error;
      }

      // Merge products from both sources
      const mergedProducts = mergeProducts(magentoProducts, supabaseProducts);
      products.value = mergedProducts;
      lastSyncAt.value = new Date();
      
      productLogger.info(`✅ Successfully loaded ${mergedProducts.length} products`);
      
      // Emit event that products have been loaded
      await eventEmitter.emit(StoreEvents.PRODUCTS_LOADED, {
        practiceId,
        productCount: mergedProducts.length,
        timestamp: new Date().toISOString(),
      });
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsFromSupabase = async (
    practiceId: string,
    hasMagentoData: boolean = false
  ): Promise<ProductWithStock[]> => {
    try {
      // Try RPC function first for better performance
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_products_with_stock_levels',
        { practice_id_param: practiceId }
      );

      if (rpcData && rpcData.length > 0) {
        productLogger.info('✅ RPC function succeeded, got', rpcData.length, 'products');
        return rpcData.map((item: ProductWithStockRPC) =>
          ({
            ...item.product,
            stock_levels: item.stock_levels || [],
            total_stock: item.total_stock || 0,
          } as ProductWithStock)
        );
      } else {
        productLogger.info('⚠️ RPC function failed or returned no data:', rpcError);
        
        // Fallback to direct query
        productLogger.warn('⚠️ RPC function failed, using fallback query:', rpcError);
      }

      productLogger.info('🔍 Using fallback direct query...');

      // Fallback: Direct query with joins
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          stock_levels:stock_levels(*)
        `);

      if (productsError) {
        productLogger.error('❌ Fallback query also failed:', productsError);
        throw productsError;
      }

      if (!products || products.length === 0) {
        productLogger.info('⚠️ Fallback query returned no products');
        return [];
      }

      productLogger.info('✅ Fallback query succeeded, got', products.length, 'products');

      // Transform and add computed fields
      const productsWithStock: ProductWithStock[] = [];
      products.forEach((product: Product) => {
        const stockLevels = product.stock_levels || [];
        const totalStock = stockLevels.reduce((sum: number, level: StockLevel) => 
          sum + (level.current_quantity || 0), 0
        );

        const productWithStock: ProductWithStock = {
          ...product,
          stock_levels: stockLevels,
          total_stock: totalStock,
        };

        // Add stock levels for each location if practice has multiple locations
        product.stock_levels.forEach((stock: StockLevel) => {
          stock.practice_id = practiceId;
          stock.product_id = product.id;
          stock.available_quantity = Math.max(0, 
            (stock.current_quantity || 0) - (stock.reserved_quantity || 0)
          );
          stock.stock_status = determineStockStatus(
            stock.current_quantity || 0,
            stock.minimum_stock || 0
          );
        });

        productsWithStock.push(productWithStock);
      });

      return productsWithStock;
    } catch (error) {
      productLogger.error('Error in fetchProductsFromSupabase:', error);
      throw error;
    }
  };

  const fetchProductsFromMagento = async (): Promise<ProductWithStock[]> => {
    try {
      const magentoProducts = await magentoApi.getProducts();
      return magentoProducts.map(product => ({
        ...product,
        stock_levels: [],
        total_stock: product.quantity || 0,
      }));
    } catch (error) {
      productLogger.warn('Magento API unavailable, using Supabase data only');
      return [];
    }
  };

  const mergeProducts = (
    magentoProducts: ProductWithStock[],
    supabaseProducts: ProductWithStock[]
  ): ProductWithStock[] => {
    if (magentoProducts.length === 0) {
      return supabaseProducts;
    }

    const merged = [...supabaseProducts];
    const supabaseSkus = new Set(supabaseProducts.map(p => p.sku));

    // Add Magento products that don't exist in Supabase
    magentoProducts.forEach(magentoProduct => {
      if (!supabaseSkus.has(magentoProduct.sku)) {
        merged.push(magentoProduct);
      }
    });

    return merged;
  };

  const determineStockStatus = (
    currentStock: number,
    minimumStock: number
  ): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (currentStock <= 0) { return 'out_of_stock'; }
    if (currentStock <= minimumStock) { return 'low_stock'; }
    return 'in_stock';
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set((data || []).map(item => item.category))
      ).filter(Boolean);

      categories.value = uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        description: null,
      }));
    } catch (error) {
      productLogger.error('Error fetching categories:', error);
    }
  };

  const refreshData = async (practiceId: string) => {
    try {
      await Promise.all([
        fetchProducts(practiceId),
        fetchCategories(),
      ]);
    } catch (error) {
      productLogger.error('Error refreshing product data:', error);
      throw error;
    }
  };

  // CRUD operations
  const createProduct = async (productData: ProductInsert) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      productLogger.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: ProductUpdate) => {
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
      productLogger.error('Error updating product:', error);
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
      productLogger.error('Error deleting product:', error);
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
    return product?.requires_batch_tracking || false;
  };

  const batchTrackedProducts = computed(() => {
    return products.value.filter(p => p.requires_batch_tracking);
  });

  const manualStockProducts = computed(() => {
    return products.value.filter(p => p.manual_stock_management);
  });

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