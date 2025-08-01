import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { magentoApi } from 'src/services/magento';
import { useAuthStore } from './auth';
import { useSuppliersStore } from './suppliers';
import { productService } from 'src/services/supabase';
import type {
  Product,
  ProductWithStock,
  ProductCategory,
  ProductFilter,
  CartItem,
  OrderListCart,
} from 'src/types/inventory';

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<ProductWithStock[]>([]);
  const categories = ref<ProductCategory[]>([]);
  const cart = ref<CartItem[]>([]);
  const orderLists = ref<OrderListCart[]>([]);
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

  // Store references
  const suppliersStore = useSuppliersStore();

  // Getters
  const filteredProducts = computed(() => {
    let result = [...products.value];

    // Apply search filter
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      result = result.filter(
        product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm)) ||
          (product.category &&
            product.category.toLowerCase().includes(searchTerm)) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
          (product.gtin && product.gtin.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (filters.value.category && filters.value.category !== 'all') {
      result = result.filter(
        product => product.category === filters.value.category
      );
    }

    // Apply supplier filter
    if (filters.value.supplier && filters.value.supplier !== 'all') {
      if (filters.value.supplier === 'remka') {
        result = result.filter(
          product =>
            !product.supplier_products ||
            product.supplier_products.length === 0 ||
            product.supplier_products.some(sp => sp.supplier_id === 'remka')
        );
      } else if (filters.value.supplier === 'external') {
        result = result.filter(
          product =>
            product.supplier_products &&
            product.supplier_products.length > 0 &&
            product.supplier_products.some(sp => sp.supplier_id !== 'remka')
        );
      } else {
        result = result.filter(
          product =>
            product.supplier_products &&
            product.supplier_products.some(
              sp => sp.supplier_id === filters.value.supplier
            )
        );
      }
    }

    // Apply stock status filter
    if (filters.value.stock_status && filters.value.stock_status !== 'all') {
      result = result.filter(
        product => product.stock_status === filters.value.stock_status
      );
    }

    // Apply GS1 filters
    if (filters.value.gtin) {
      const gtinTerm = filters.value.gtin.toLowerCase();
      result = result.filter(
        product => product.gtin && product.gtin.toLowerCase().includes(gtinTerm)
      );
    }

    if (filters.value.country_of_origin) {
      result = result.filter(
        product => product.country_of_origin === filters.value.country_of_origin
      );
    }

    if (filters.value.gpc_brick_code) {
      const gpcTerm = filters.value.gpc_brick_code.toLowerCase();
      result = result.filter(
        product => product.gpc_brick_code && product.gpc_brick_code.toLowerCase().includes(gpcTerm)
      );
    }

    if (filters.value.lifecycle_status) {
      result = result.filter(
        product => product.product_lifecycle_status === filters.value.lifecycle_status
      );
    }

    if (filters.value.orderable_only) {
      result = result.filter(
        product => product.orderable_unit_indicator === true
      );
    }

    // Apply sorting
    if (filters.value.sort_by) {
      result.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (filters.value.sort_by) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = a.lowest_price || Number.MAX_VALUE;
            bValue = b.lowest_price || Number.MAX_VALUE;
            break;
          case 'stock':
            aValue = a.total_stock;
            bValue = b.total_stock;
            break;
          case 'category':
            aValue = a.category || '';
            bValue = b.category || '';
            break;
          default:
            return 0;
        }

        if (filters.value.sort_order === 'desc') {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        } else {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        }
      });
    }

    return result;
  });

  const cartItemsCount = computed(() => {
    return cart.value.reduce((total, item) => total + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => {
      const price = item.unit_price || item.product.price || 0;
      return total + price * item.quantity;
    }, 0);
  });

  const availableCategories = computed(() => {
    const productCategories = new Set(
      products.value.map(p => p.category).filter(Boolean) as string[]
    );
    return Array.from(productCategories).sort();
  });

  const availableCountries = computed(() => {
    const countries = new Set(
      products.value.map(p => p.country_of_origin).filter(Boolean) as string[]
    );
    return Array.from(countries).sort();
  });

  const availableGpcCodes = computed(() => {
    const gpcCodes = new Set(
      products.value.map(p => p.gpc_brick_code).filter(Boolean) as string[]
    );
    return Array.from(gpcCodes).sort();
  });

  const availableLifecycleStatuses = computed(() => {
    const statuses = new Set(
      products.value.map(p => p.product_lifecycle_status).filter(Boolean) as string[]
    );
    return Array.from(statuses).sort();
  });

  const availableSuppliers = computed(() => {
    const suppliers = new Set<string>();

    products.value.forEach(product => {
      if (product.supplier_products && product.supplier_products.length > 0) {
        product.supplier_products.forEach(sp => {
          suppliers.add(sp.supplier_id);
        });
      } else {
        suppliers.add('remka'); // Default to Remka for products without supplier
      }
    });

    return Array.from(suppliers);
  });

  const productStats = computed(() => {
    return {
      total: products.value.length,
      inStock: products.value.filter(p => p.stock_status === 'in_stock').length,
      lowStock: products.value.filter(p => p.stock_status === 'low_stock')
        .length,
      outOfStock: products.value.filter(p => p.stock_status === 'out_of_stock')
        .length,
      categories: availableCategories.value.length,
      suppliers: availableSuppliers.value.length,
    };
  });

  // Inventory-related getters (consolidated from inventory store)
  const totalStockValue = computed(() => {
    return products.value.reduce((total, product) => {
      return total + (product.total_stock || 0) * (product.price || 0);
    }, 0);
  });

  const lowStockProducts = computed(() => {
    return products.value.filter(p => p.stock_status === 'low_stock');
  });

  const outOfStockProducts = computed(() => {
    return products.value.filter(p => p.stock_status === 'out_of_stock');
  });

  const stockStatusSummary = computed(() => {
    return {
      in_stock: products.value.filter(p => p.stock_status === 'in_stock').length,
      low_stock: products.value.filter(p => p.stock_status === 'low_stock').length,
      out_of_stock: products.value.filter(p => p.stock_status === 'out_of_stock').length,
      total: products.value.length,
    };
  });

  const criticalStockAlerts = computed(() => {
    const alerts = [];
    
    // Out of stock alerts
    outOfStockProducts.value.forEach(product => {
      alerts.push({
        type: 'out_of_stock',
        urgency: 'critical',
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        current_quantity: product.total_stock || 0,
        message: `${product.name} is out of stock`,
        suggested_action: 'Reorder immediately',
      });
    });

    // Low stock alerts
    lowStockProducts.value.forEach(product => {
      alerts.push({
        type: 'low_stock',
        urgency: 'high',
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        current_quantity: product.total_stock || 0,
        message: `${product.name} is running low`,
        suggested_action: 'Consider reordering',
      });
    });

    return alerts;
  });

  // Actions
  const fetchProducts = async (practiceId: string) => {
    loading.value = true;
    try {
      // Fetch from Supabase first
      const supabaseProducts = await fetchProductsFromSupabase(practiceId);

      // Try to sync with Magento if configured
      let magentoProducts: ProductWithStock[] = [];
      if (magentoApi.isConfigured()) {
        try {
          magentoProducts = await fetchProductsFromMagento();
        } catch (error) {
          console.warn('⚠️ Magento sync failed, using Supabase data only:', error);
        }
      }

      // Merge products from both sources
      products.value = mergeProducts(supabaseProducts, magentoProducts);

      lastSyncAt.value = new Date();
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsFromSupabase = async (
    practiceId: string
  ): Promise<ProductWithStock[]> => {
    try {
      // First try the RPC function
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        'get_products_with_stock',
        { p_practice_id: practiceId }
      );

      if (!rpcError && rpcData) {
        return rpcData.map(
          (item: any) =>
            ({
              id: item.product_id,
              sku: item.product_sku || '',
              name: item.product_name || 'Onbekend product',
              description: item.product_description,
              category: item.product_category,
              brand: item.product_brand,
              unit: item.product_unit || 'stuk',
              image_url: item.product_image_url,
              price: parseFloat(item.product_price || '0'),
              currency: item.product_currency || 'EUR',
              active: item.product_is_active !== false,
              requires_batch_tracking: item.requires_batch_tracking || false,
              barcode: item.barcode,
              total_stock: parseInt(item.total_stock || '0'),
              available_stock: parseInt(item.available_stock || '0'),
              reserved_stock: parseInt(item.reserved_stock || '0'),
              minimum_stock: parseInt(item.minimum_stock || '0'),
              stock_status: item.total_stock > 0 ? 'in_stock' : 'out_of_stock',
              lowest_price: parseFloat(item.lowest_supplier_price || '0'),
              cheapest_supplier: item.cheapest_supplier,
              supplier_products: item.supplier_products || [],
              stock_levels: item.stock_levels || [],
              created_at: item.product_created_at,
              updated_at: item.product_updated_at,
            } as ProductWithStock)
        );
      } else {
        console.log('⚠️ RPC function failed or returned no data:', rpcError);
      }
    } catch (error) {
      console.warn('⚠️ RPC function failed, using fallback query:', error);
    }

    // Fallback: Direct query approach
    console.log('🔍 Using fallback direct query...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        stock_levels!inner(
          id,
          current_quantity,
          available_quantity,
          reserved_quantity,
          minimum_quantity,
          location_id,
          practice_locations!inner(name)
        )
      `)
      .eq('stock_levels.practice_id', practiceId)
      .eq('active', true)
      .order('name');

    if (productsError) {
      console.error('❌ Fallback query also failed:', productsError);
      throw productsError;
    }

    if (!products) {
      console.log('⚠️ Fallback query returned no products');
      return [];
    }

    console.log('✅ Fallback query succeeded, got', products.length, 'products');

    // Transform the data to match our expected format
    const productMap = new Map<string, any>();
    
    products.forEach((product: any) => {
      if (!productMap.has(product.id)) {
        productMap.set(product.id, {
          id: product.id,
          sku: product.sku || '',
          name: product.name || 'Onbekend product',
          description: product.description,
          category: product.category,
          brand: product.brand,
          unit: product.unit || 'stuk',
          image_url: product.image_url,
          price: parseFloat(product.price || '0'),
          currency: 'EUR',
          active: product.active !== false,
          requires_batch_tracking: product.requires_batch_tracking || false,
          barcode: product.barcode,
          total_stock: 0,
          available_stock: 0,
          reserved_stock: 0,
          minimum_stock: 0,
          stock_status: 'out_of_stock' as const,
          lowest_price: parseFloat(product.price || '0'),
          cheapest_supplier: null,
          supplier_products: [],
          stock_levels: [],
          created_at: product.created_at,
          updated_at: product.updated_at,
        });
      }

      const productData = productMap.get(product.id);
      
      // Aggregate stock from all locations
      if (product.stock_levels && Array.isArray(product.stock_levels)) {
        product.stock_levels.forEach((stock: any) => {
          productData.total_stock += parseInt(stock.current_quantity || '0');
          productData.available_stock += parseInt(stock.available_quantity || '0');
          productData.reserved_stock += parseInt(stock.reserved_quantity || '0');
          if (productData.minimum_stock === 0) {
            productData.minimum_stock = parseInt(stock.minimum_quantity || '0');
          }
          productData.stock_levels.push({
            id: stock.id,
            location_id: stock.location_id,
            current_quantity: parseInt(stock.current_quantity || '0'),
            available_quantity: parseInt(stock.available_quantity || '0'),
            reserved_quantity: parseInt(stock.reserved_quantity || '0'),
            minimum_quantity: parseInt(stock.minimum_quantity || '0'),
          });
        });
      } else if (product.stock_levels) {
        // Single stock level object
        const stock = product.stock_levels;
        productData.total_stock += parseInt(stock.current_quantity || '0');
        productData.available_stock += parseInt(stock.available_quantity || '0');
        productData.reserved_stock += parseInt(stock.reserved_quantity || '0');
        productData.minimum_stock = parseInt(stock.minimum_quantity || '0');
        productData.stock_levels.push({
          id: stock.id,
          location_id: stock.location_id,
          current_quantity: parseInt(stock.current_quantity || '0'),
          available_quantity: parseInt(stock.available_quantity || '0'),
          reserved_quantity: parseInt(stock.reserved_quantity || '0'),
          minimum_quantity: parseInt(stock.minimum_quantity || '0'),
        });
      }

      // Update stock status
      if (productData.total_stock > 0) {
        if (productData.total_stock <= productData.minimum_stock) {
          productData.stock_status = 'low_stock';
        } else {
          productData.stock_status = 'in_stock';
        }
      }
    });

    return Array.from(productMap.values()) as ProductWithStock[];
  };

  const fetchProductsFromMagento = async (): Promise<ProductWithStock[]> => {
    const magentoProducts = await magentoApi.getProducts();

    return magentoProducts.map(
      mp =>
        ({
          id: `magento_${mp.id}`,
          sku: mp.sku,
          name: mp.name,
          description: '',
          category: '',
          brand: '',
          unit: '',
          image_url: '',
          barcode: '',
          price: mp.price,
          currency: 'EUR',
          is_active: mp.status === 1,
          requires_batch_tracking: false, // Magento products default to no batch tracking
          total_stock: 0, // Magento doesn't provide stock in product list
          available_stock: 0,
          reserved_stock: 0,
          stock_status: 'out_of_stock' as const,
          lowest_price: mp.price,
          supplier_products: [],
          stock_levels: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as ProductWithStock)
    );
  };

  const mergeProducts = (
    supabaseProducts: ProductWithStock[],
    magentoProducts: ProductWithStock[]
  ): ProductWithStock[] => {
    const merged = [...supabaseProducts];

    // Add Magento products that don't exist in Supabase
    magentoProducts.forEach(magentoProduct => {
      const existingProduct = merged.find(p => p.sku === magentoProduct.sku);
      if (!existingProduct) {
        merged.push(magentoProduct);
      }
    });

    return merged;
  };

  const determineStockStatus = (
    currentStock: number,
    minimumStock: number | null
  ): 'in_stock' | 'low_stock' | 'out_of_stock' => {
    if (currentStock <= 0) return 'out_of_stock';
    if (minimumStock && currentStock <= minimumStock) return 'low_stock';
    return 'in_stock';
  };

  const fetchCategories = async () => {
    try {
      // Try to fetch from product_categories table first
      // Since this table might not exist, we'll use a fallback approach
      categories.value = [];

      // Fallback to categories from products
      const productCategories = Array.from(
        new Set(products.value.map(p => p.category).filter(Boolean) as string[])
      ).map((name, index) => ({
        id: `cat_${index}`,
        name,
        description: '',
        parent_id: '',
        sort_order: index,
        is_active: true,
      }));
      categories.value = productCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      categories.value = [];
    }
  };

  // Cart management
  const addToCart = (
    product: Product,
    quantity: number = 1,
    supplierId?: string
  ) => {
    const existingItem = cart.value.find(
      item => item.product_id === product.id && item.supplier_id === supplierId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const supplierProduct = product.supplier_products?.find(
        sp => sp.supplier_id === supplierId
      );
      const item: CartItem = {
        product_id: product.id,
        product,
        quantity,
      };

      // Add optional properties only if they have values
      const unitPrice = supplierProduct?.unit_price || product.price;
      if (unitPrice !== undefined) {
        item.unit_price = unitPrice;
      }

      if (supplierId !== undefined) {
        item.supplier_id = supplierId;
      }

      cart.value.push(item);
    }
  };

  const removeFromCart = (productId: string, supplierId?: string) => {
    const index = cart.value.findIndex(
      item => item.product_id === productId && item.supplier_id === supplierId
    );
    if (index > -1) {
      cart.value.splice(index, 1);
    }
  };

  const updateCartItemQuantity = (
    productId: string,
    quantity: number,
    supplierId?: string
  ) => {
    const item = cart.value.find(
      item => item.product_id === productId && item.supplier_id === supplierId
    );
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId, supplierId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  const clearCart = () => {
    cart.value = [];
  };

  // Order list management
  const addToOrderList = (
    product: Product,
    quantity: number = 1,
    supplierId?: string,
    orderListId?: string
  ) => {
    let targetOrderList: OrderListCart;

    if (orderListId) {
      const existing = orderLists.value.find(ol => ol.id === orderListId);
      if (!existing) throw new Error('Order list not found');
      targetOrderList = existing;
    } else {
      // Create new order list
      const supplier = suppliersStore.suppliers.find(s => s.id === supplierId);
      targetOrderList = {
        name: `Bestellijst ${new Date().toLocaleDateString('nl-NL')}`,
        items: [],
        total_items: 0,
        notes: '',
      };

      // Add supplier_id only if defined
      if (supplierId !== undefined) {
        targetOrderList.supplier_id = supplierId;
      }
      orderLists.value.push(targetOrderList);
    }

    const existingItem = targetOrderList.items.find(
      item => item.product_id === product.id && item.supplier_id === supplierId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const supplierProduct = product.supplier_products?.find(
        sp => sp.supplier_id === supplierId
      );
      const item: CartItem = {
        product_id: product.id,
        product,
        quantity,
      };

      // Add optional properties only if they have values
      const unitPrice = supplierProduct?.unit_price || product.price;
      if (unitPrice !== undefined) {
        item.unit_price = unitPrice;
      }

      if (supplierId !== undefined) {
        item.supplier_id = supplierId;
      }

      targetOrderList.items.push(item);
    }

    targetOrderList.total_items = targetOrderList.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    targetOrderList.estimated_total = targetOrderList.items.reduce(
      (sum, item) => {
        const price = item.unit_price || 0;
        return sum + price * item.quantity;
      },
      0
    );
  };

  // Filter management
  const updateFilters = (newFilters: Partial<ProductFilter>) => {
    filters.value = { ...filters.value, ...newFilters };
  };

  const clearFilters = () => {
    filters.value = {
      search: '',
      category: '',
      supplier: '',
      stock_status: 'all',
      sort_by: 'name',
      sort_order: 'asc',
      // Clear GS1 filters
      gtin: '',
      country_of_origin: '',
      gpc_brick_code: '',
      lifecycle_status: '',
      orderable_only: false,
    };
  };

  // Utility functions
  const getProductById = (id: string): ProductWithStock | undefined => {
    return products.value.find(p => p.id === id);
  };

  const getProductBySku = (sku: string): ProductWithStock | undefined => {
    return products.value.find(p => p.sku === sku);
  };

  // Helper function to check if a product requires batch tracking
  const requiresBatchTracking = (productId: string): boolean => {
    const product = getProductById(productId);
    return product?.requires_batch_tracking || false;
  };

  // Get products that require batch tracking
  const batchTrackedProducts = computed(() => {
    return products.value.filter(p => p.requires_batch_tracking);
  });

  // Get products that use manual stock management
  const manualStockProducts = computed(() => {
    return products.value.filter(p => !p.requires_batch_tracking);
  });

  const refreshData = async (practiceId: string) => {
    try {
      await fetchProducts(practiceId);
      await fetchCategories();
      lastSyncAt.value = new Date();
    } catch (error) {
      console.error('Error refreshing product data:', error);
      throw error;
    }
  };

  // Product CRUD operations
  const createProduct = async (productData: any) => {
    try {
      const result = await productService.create(productData);
      if (result) {
        // Add the new product to the local state
        products.value.push(result as any);
      }
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, updates: any) => {
    try {
      const result = await productService.update(productId, updates);
      if (result) {
        // Update the product in local state
        const index = products.value.findIndex(p => p.id === productId);
        if (index !== -1) {
          products.value[index] = { ...products.value[index], ...result };
        }
      }
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await productService.delete(productId);
      // Remove the product from local state
      const index = products.value.findIndex(p => p.id === productId);
      if (index !== -1) {
        products.value.splice(index, 1);
      }
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  return {
    // State
    products,
    categories,
    cart,
    orderLists,
    loading,
    lastSyncAt,
    filters,

    // Getters
    filteredProducts,
    cartItemsCount,
    cartTotal,
    availableCategories,
    availableCountries,
    availableGpcCodes,
    availableLifecycleStatuses,
    availableSuppliers,
    productStats,
    batchTrackedProducts,
    manualStockProducts,
    totalStockValue,
    lowStockProducts,
    outOfStockProducts,
    stockStatusSummary,
    criticalStockAlerts,

    // Actions
    fetchProducts,
    fetchCategories,
    refreshData,
    createProduct,
    updateProduct,
    deleteProduct,

    // Cart management
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,

    // Order list management
    addToOrderList,

    // Filter management
    updateFilters,
    clearFilters,

    // Utility functions
    getProductById,
    getProductBySku,
    requiresBatchTracking,
  };
});
