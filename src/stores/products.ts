import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { magentoApi } from 'src/services/magento';
import { useAuthStore } from './auth';
import { useSuppliersStore } from './suppliers';
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
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.sku.toLowerCase().includes(searchTerm) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm)) ||
          (product.category &&
            product.category.toLowerCase().includes(searchTerm)) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm))
      );
    }

    // Apply category filter
    if (filters.value.category && filters.value.category !== 'all') {
      result = result.filter(
        (product) => product.category === filters.value.category
      );
    }

    // Apply supplier filter
    if (filters.value.supplier && filters.value.supplier !== 'all') {
      if (filters.value.supplier === 'remka') {
        result = result.filter(
          (product) =>
            !product.supplier_products ||
            product.supplier_products.length === 0 ||
            product.supplier_products.some((sp) => sp.supplier_id === 'remka')
        );
      } else if (filters.value.supplier === 'external') {
        result = result.filter(
          (product) =>
            product.supplier_products &&
            product.supplier_products.length > 0 &&
            product.supplier_products.some((sp) => sp.supplier_id !== 'remka')
        );
      } else {
        result = result.filter(
          (product) =>
            product.supplier_products &&
            product.supplier_products.some(
              (sp) => sp.supplier_id === filters.value.supplier
            )
        );
      }
    }

    // Apply stock status filter
    if (filters.value.stock_status && filters.value.stock_status !== 'all') {
      result = result.filter(
        (product) => product.stock_status === filters.value.stock_status
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
      products.value.map((p) => p.category).filter(Boolean) as string[]
    );
    return Array.from(productCategories).sort();
  });

  const availableSuppliers = computed(() => {
    const suppliers = new Set<string>();

    products.value.forEach((product) => {
      if (product.supplier_products && product.supplier_products.length > 0) {
        product.supplier_products.forEach((sp) => {
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
      inStock: products.value.filter((p) => p.stock_status === 'in_stock')
        .length,
      lowStock: products.value.filter((p) => p.stock_status === 'low_stock')
        .length,
      outOfStock: products.value.filter(
        (p) => p.stock_status === 'out_of_stock'
      ).length,
      categories: availableCategories.value.length,
      suppliers: availableSuppliers.value.length,
    };
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
          console.warn('Magento sync failed, using Supabase data only:', error);
        }
      }

      // Merge products from both sources
      products.value = mergeProducts(supabaseProducts, magentoProducts);

      lastSyncAt.value = new Date();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductsFromSupabase = async (
    practiceId: string
  ): Promise<ProductWithStock[]> => {
    const { data, error } = await supabase.rpc(
      'get_products_with_stock' as any,
      { p_practice_id: practiceId }
    );

    if (error) throw error;
    if (!data) return [];

    return data.map(
      (item: any) =>
        ({
          id: item.product_id,
          sku: item.product_sku || '',
          name: item.product_name || 'Onbekend product',
          description: item.product_description,
          category: item.product_category,
          brand: item.product_brand,
          unit: item.product_unit,
          image_url: item.product_image_url,
          barcode: item.product_barcode,
          price: item.product_price,
          currency: item.product_currency || 'EUR',
          is_active: item.product_is_active !== false,
          requires_batch_tracking: item.requires_batch_tracking || false,
          total_stock: item.total_stock || 0,
          available_stock: item.available_stock || 0,
          reserved_stock: item.reserved_stock || 0,
          stock_status: determineStockStatus(
            item.total_stock,
            item.minimum_stock
          ),
          lowest_price: item.lowest_supplier_price,
          cheapest_supplier: item.cheapest_supplier
            ? {
                id: item.cheapest_supplier.id,
                name: item.cheapest_supplier.name,
              }
            : undefined,
          supplier_products: item.supplier_products || [],
          stock_levels: item.stock_levels || [],
          created_at: item.product_created_at,
          updated_at: item.product_updated_at,
        } as ProductWithStock)
    );
  };

  const fetchProductsFromMagento = async (): Promise<ProductWithStock[]> => {
    const magentoProducts = await magentoApi.getProducts();

    return magentoProducts.map(
      (mp) =>
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
    magentoProducts.forEach((magentoProduct) => {
      const existingProduct = merged.find((p) => p.sku === magentoProduct.sku);
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
        new Set(
          products.value.map((p) => p.category).filter(Boolean) as string[]
        )
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
      (item) =>
        item.product_id === product.id && item.supplier_id === supplierId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const supplierProduct = product.supplier_products?.find(
        (sp) => sp.supplier_id === supplierId
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
      (item) => item.product_id === productId && item.supplier_id === supplierId
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
      (item) => item.product_id === productId && item.supplier_id === supplierId
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
      const existing = orderLists.value.find((ol) => ol.id === orderListId);
      if (!existing) throw new Error('Order list not found');
      targetOrderList = existing;
    } else {
      // Create new order list
      const supplier = suppliersStore.suppliers.find(
        (s) => s.id === supplierId
      );
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
      (item) =>
        item.product_id === product.id && item.supplier_id === supplierId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      const supplierProduct = product.supplier_products?.find(
        (sp) => sp.supplier_id === supplierId
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
    };
  };

  // Utility functions
  const getProductById = (id: string): ProductWithStock | undefined => {
    return products.value.find((p) => p.id === id);
  };

  const getProductBySku = (sku: string): ProductWithStock | undefined => {
    return products.value.find((p) => p.sku === sku);
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
    await Promise.all([fetchProducts(practiceId), fetchCategories()]);
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
    availableSuppliers,
    productStats,
    batchTrackedProducts,
    manualStockProducts,

    // Actions
    fetchProducts,
    fetchCategories,
    refreshData,

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
