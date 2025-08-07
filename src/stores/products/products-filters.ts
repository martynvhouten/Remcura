import { computed, type Ref } from 'vue';
import { productLogger } from '@/utils/logger';
import type { ProductWithStock, ProductFilter } from '@/types/inventory';

export function useProductsFilters(
  products: Ref<ProductWithStock[]>,
  filters: Ref<ProductFilter>
) {
  // Main filtered products computed
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
          (product.manufacturer &&
            product.manufacturer.toLowerCase().includes(searchTerm)) ||
          (product.supplier_name &&
            product.supplier_name.toLowerCase().includes(searchTerm))
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
      result = result.filter(
        product => product.supplier_id === filters.value.supplier
      );
    }

    // Apply stock status filter
    if (filters.value.stock_status && filters.value.stock_status !== 'all') {
      result = result.filter(product => {
        const totalStock =
          product.stock_levels?.reduce(
            (sum, level) => sum + level.current_quantity,
            0
          ) || 0;
        const stockStatus =
          totalStock <= 0
            ? 'out_of_stock'
            : totalStock <= product.minimum_stock
            ? 'low_stock'
            : 'in_stock';
        return stockStatus === filters.value.stock_status;
      });
    }

    // Apply sorting
    if (filters.value.sort_by) {
      result.sort((a, b) => {
        let aValue: string | number | boolean,
          bValue: string | number | boolean;

        switch (filters.value.sort_by) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'sku':
            aValue = a.sku;
            bValue = b.sku;
            break;
          case 'category':
            aValue = a.category || '';
            bValue = b.category || '';
            break;
          case 'price':
            aValue = a.unit_price || 0;
            bValue = b.unit_price || 0;
            break;
          case 'stock':
            aValue =
              a.stock_levels?.reduce(
                (sum, level) => sum + level.current_quantity,
                0
              ) || 0;
            bValue =
              b.stock_levels?.reduce(
                (sum, level) => sum + level.current_quantity,
                0
              ) || 0;
            break;
          case 'last_updated':
            aValue = new Date(a.updated_at || a.created_at || 0);
            bValue = new Date(b.updated_at || b.created_at || 0);
            break;
          default:
            aValue = a.name;
            bValue = b.name;
        }

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue);
          return filters.value.sort_order === 'desc' ? -comparison : comparison;
        }

        // Handle numeric/date comparison
        if (aValue < bValue) {
          return filters.value.sort_order === 'desc' ? 1 : -1;
        }
        if (aValue > bValue) {
          return filters.value.sort_order === 'desc' ? -1 : 1;
        }
        return 0;
      });
    }

    return result;
  });

  // Supplier-related computed properties
  const availableSuppliers = computed(() => {
    const supplierMap = new Map();

    products.value.forEach(product => {
      if (product.supplier_id && product.supplier_name) {
        supplierMap.set(product.supplier_id, {
          id: product.supplier_id,
          name: product.supplier_name,
        });
      }
    });

    return Array.from(supplierMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

  // Filter management actions
  const updateFilters = (newFilters: Partial<ProductFilter>) => {
    Object.assign(filters.value, newFilters);
    productLogger.info('Updated product filters', newFilters);
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
    productLogger.info('Cleared all product filters');
  };

  const applyPresetFilter = (preset: string) => {
    switch (preset) {
      case 'low_stock':
        updateFilters({
          stock_status: 'low_stock',
          sort_by: 'stock',
          sort_order: 'asc',
        });
        break;
      case 'out_of_stock':
        updateFilters({
          stock_status: 'out_of_stock',
          sort_by: 'name',
          sort_order: 'asc',
        });
        break;
      case 'recently_updated':
        updateFilters({
          sort_by: 'last_updated',
          sort_order: 'desc',
        });
        break;
      case 'high_value':
        updateFilters({
          sort_by: 'price',
          sort_order: 'desc',
        });
        break;
      default:
        clearFilters();
    }
    productLogger.info(`Applied preset filter: ${preset}`);
  };

  const searchProducts = (searchTerm: string) => {
    updateFilters({ search: searchTerm });
  };

  const filterByCategory = (category: string) => {
    updateFilters({ category });
  };

  const filterBySupplier = (supplierId: string) => {
    updateFilters({ supplier: supplierId });
  };

  const filterByStockStatus = (stockStatus: string) => {
    updateFilters({ stock_status: stockStatus });
  };

  const sortProducts = (sortBy: string, sortOrder: 'asc' | 'desc' = 'asc') => {
    updateFilters({ sort_by: sortBy, sort_order: sortOrder });
  };

  // Quick filter helpers
  const getProductsInStock = computed(() => {
    return products.value.filter(product => {
      const totalStock =
        product.stock_levels?.reduce(
          (sum, level) => sum + level.current_quantity,
          0
        ) || 0;
      return totalStock > product.minimum_stock;
    });
  });

  const getProductsLowStock = computed(() => {
    return products.value.filter(product => {
      const totalStock =
        product.stock_levels?.reduce(
          (sum, level) => sum + level.current_quantity,
          0
        ) || 0;
      return totalStock > 0 && totalStock <= product.minimum_stock;
    });
  });

  const getProductsOutOfStock = computed(() => {
    return products.value.filter(product => {
      const totalStock =
        product.stock_levels?.reduce(
          (sum, level) => sum + level.current_quantity,
          0
        ) || 0;
      return totalStock <= 0;
    });
  });

  const getProductsByCategory = (category: string) => {
    return computed(() =>
      products.value.filter(product => product.category === category)
    );
  };

  const getProductsBySupplier = (supplierId: string) => {
    return computed(() =>
      products.value.filter(product => product.supplier_id === supplierId)
    );
  };

  return {
    // Main filtered results
    filteredProducts,

    // Computed filters
    availableSuppliers,
    getProductsInStock,
    getProductsLowStock,
    getProductsOutOfStock,

    // Filter actions
    updateFilters,
    clearFilters,
    applyPresetFilter,
    searchProducts,
    filterByCategory,
    filterBySupplier,
    filterByStockStatus,
    sortProducts,

    // Category/supplier specific filters
    getProductsByCategory,
    getProductsBySupplier,
  };
}
