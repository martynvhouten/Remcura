import { ref, computed, onUnmounted } from 'vue';
import { supabase } from '@/boot/supabase';
import { magentoApi } from '@/services/magento';
import { productService } from '@/services/supabase';
import { productLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents, type UserLoggedInPayload, type UserLoggedOutPayload } from '@/utils/eventBus';
import { useApiCache } from '@/composables/useCache';
import type {
  Product,
  ProductWithStock,
  ProductCategory,
  ProductFilter,
} from '@/types/inventory';

// Temporary type definitions until they're properly defined in types/inventory.ts
type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
type ProductUpdate = Partial<ProductInsert>;
type StockLevel = {
  id: string;
  practice_id: string;
  product_id: string;
  location_id: string;
  current_quantity: number;
  minimum_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  location_name?: string;
  created_at: string;
  updated_at: string;
};

// RPC response interface for get_products_with_stock_levels
interface ProductWithStockRPC {
  product: Product;
  stock_levels: Array<{ location_id: string; current_quantity: number; minimum_quantity: number }>;
  total_stock: number;
}

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
      if (totalStock > ((product as any).minimum_stock || 0)) {
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
    const gpcSet = new Set(products.value.map(p => (p as any).gpc_code).filter(Boolean));
    return Array.from(gpcSet).sort();
  });

  const availableLifecycleStatuses = computed(() => {
    const statusSet = new Set(products.value.map(p => (p as any).lifecycle_status).filter(Boolean));
    return Array.from(statusSet).sort();
  });

  // Core actions
  const fetchProducts = async (practiceId: string, forceRefresh = false) => {
    if (loading.value) { return; }
    
    // ✅ PERFORMANCE OPTIMIZATION: Check cache first
    const cacheKey = `products:${practiceId}`;
    if (!forceRefresh) {
      const cachedProducts = cache.get(cacheKey);
      if (cachedProducts) {
        products.value = cachedProducts;
        productLogger.info('🎯 Using cached products for practice:', practiceId);
        return;
      }
    }
    
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
      
      // ✅ Cache the results for 5 minutes
      cache.set(cacheKey, mergedProducts, 5 * 60 * 1000);
      
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
        'get_products_with_stock',
        { practice_id_param: practiceId }
      );

      if (rpcData && rpcData.length > 0) {
        productLogger.info('✅ RPC function succeeded, got', rpcData.length, 'products');
        return rpcData.map((item: ProductWithStockRPC) => {
          const product = item.product;
          const stockLevels = item.stock_levels || [];
          const totalStock = item.total_stock || 0;
          
          // Calculate aggregate stock properties
          const availableStock = stockLevels.reduce((sum, level) => 
            sum + Math.max(0, (level.current_quantity || 0) - (level.reserved_quantity || 0)), 0
          );
          const reservedStock = stockLevels.reduce((sum, level) => 
            sum + (level.reserved_quantity || 0), 0
          );
          const overallStockStatus = totalStock === 0 ? 'out_of_stock' : 
            (totalStock < ((product as any).minimum_stock || 0) ? 'low_stock' : 'in_stock');

          // Calculate derived fields for UI display
          const lowestPrice = product.price || null;
          const gs1Status = (product.gtin || product.gpc_brick_code || product.country_of_origin) ? 'complete' : 'incomplete';
          const batchStatus = product.requires_batch_tracking ? 'batch_tracked' : 'manual_stock';

          return {
            ...product,
            stock_levels: stockLevels,
            total_stock: totalStock,
            available_stock: availableStock,
            reserved_stock: reservedStock,
            stock_status: overallStockStatus,
            lowest_price: lowestPrice,
            gs1_status: gs1Status,
            batch_status: batchStatus,
            unit_price: product.price || 0,
            minimum_stock: stockLevels.reduce((min, level) => 
              Math.min(min, level.minimum_quantity || 0), Infinity) || 0,
          } as ProductWithStock;
        });
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

      // ✅ PERFORMANCE OPTIMIZATION: Transform with optimized mapping
      const productsWithStock: ProductWithStock[] = (products as any[]).map((product: any) => {
        const stockLevels = product.stock_levels || [];
        const totalStock = stockLevels.reduce((sum: number, level: any) => 
          sum + (level.current_quantity || 0), 0
        );

        // Optimize stock level processing
        const processedStockLevels = stockLevels.map((stock: any) => ({
          ...stock,
          practice_id: practiceId,
          product_id: product.id,
          available_quantity: Math.max(0, 
            (stock.current_quantity || 0) - (stock.reserved_quantity || 0)
          ),
          stock_status: determineStockStatus(
            stock.current_quantity || 0,
            stock.minimum_quantity || 0
          )
        }));

        // Calculate aggregate stock properties
        const availableStock = processedStockLevels.reduce((sum, level) => 
          sum + (level.available_quantity || 0), 0
        );
        const reservedStock = processedStockLevels.reduce((sum, level) => 
          sum + (level.reserved_quantity || 0), 0
        );
        const overallStockStatus = totalStock === 0 ? 'out_of_stock' : 
          (totalStock < ((product as any).minimum_stock || 0) ? 'low_stock' : 'in_stock');

        // Calculate derived fields for UI display
        const lowestPrice = product.price || null;
        const gs1Status = (product.gtin || product.gpc_brick_code || product.country_of_origin) ? 'complete' : 'incomplete';
        const batchStatus = product.requires_batch_tracking ? 'batch_tracked' : 'manual_stock';

        return {
          ...product,
          stock_levels: processedStockLevels,
          total_stock: totalStock,
          available_stock: availableStock,
          reserved_stock: reservedStock,
          stock_status: overallStockStatus,
          lowest_price: lowestPrice,
          gs1_status: gs1Status,
          batch_status: batchStatus,
          unit_price: product.price || 0,
          minimum_stock: processedStockLevels.reduce((min, level) => 
            Math.min(min, level.minimum_quantity || 0), Infinity) || 0,
        } as ProductWithStock;
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
        id: product.id.toString(), // Convert number to string
        stock_levels: [],
        total_stock: (product as any).quantity || 0,
        available_stock: (product as any).quantity || 0,
        reserved_stock: 0,
        stock_status: ((product as any).quantity || 0) > 0 ? 'in_stock' as const : 'out_of_stock' as const,
        is_active: product.status === 1,
        requires_batch_tracking: false, // Default for Magento products
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ProductWithStock));
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
        new Set((data || []).map((item: any) => item.category))
      ).filter(Boolean);

      categories.value = uniqueCategories.map(cat => ({
        id: cat,
        name: cat,
        description: undefined,
        parent_id: undefined,
        sort_order: 0,
        is_active: true,
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
    return products.value.filter(p => (p as any).manual_stock_management);
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