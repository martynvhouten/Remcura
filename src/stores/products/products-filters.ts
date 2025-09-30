import { computed, type Ref } from 'vue';
import { productLogger } from '@/utils/logger';
import type { ProductWithStock, ProductFilter } from '@/types/inventory';

const getTotalStock = (product: ProductWithStock): number =>
  product.stockLevels?.reduce((sum, level) => sum + level.currentQuantity, 0) ??
  0;

export function useProductsFilters(
  products: Ref<ProductWithStock[]>,
  filters: Ref<ProductFilter>
) {
  const hasSupplierMatch = (
    product: ProductWithStock,
    supplierId: string
  ): boolean => {
    if (!supplierId || supplierId === 'all') {
      return true;
    }
    return product.supplier?.id === supplierId;
  };

  const filteredProducts = computed(() => {
    const minimumStock = (product: ProductWithStock): number =>
      product.minimumStock ?? 0;

    let result = [...products.value];

    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      result = result.filter(product => {
        const matchesText = [
          product.name,
          product.sku,
          product.description ?? '',
          product.category ?? '',
          product.supplier?.name ?? '',
        ]
          .filter(Boolean)
          .some(value => value.toLowerCase().includes(searchTerm));

        return matchesText;
      });
    }

    if (filters.value.category && filters.value.category !== 'all') {
      result = result.filter(
        product => (product.category ?? '') === filters.value.category
      );
    }

    if (filters.value.supplier && filters.value.supplier !== 'all') {
      result = result.filter(product =>
        hasSupplierMatch(product, filters.value.supplier as string)
      );
    }

    if (filters.value.stock_status && filters.value.stock_status !== 'all') {
      result = result.filter(product => {
        const totalStock = getTotalStock(product);
        const stockStatus =
          totalStock <= 0
            ? 'out_of_stock'
            : totalStock <= minimumStock(product)
              ? 'low_stock'
              : 'in_stock';
        return stockStatus === filters.value.stock_status;
      });
    }

    if (filters.value.sort_by) {
      const { sort_by: sortBy, sort_order: sortOrder = 'asc' } = filters.value;

      result.sort((a, b) => {
        const direction = sortOrder === 'desc' ? -1 : 1;

        switch (sortBy) {
          case 'name':
            return direction * a.name.localeCompare(b.name);
          case 'sku':
            return direction * a.sku.localeCompare(b.sku);
          case 'category':
            return (
              direction * (a.category ?? '').localeCompare(b.category ?? '')
            );
          case 'price':
            return direction * ((a.unitPrice ?? 0) - (b.unitPrice ?? 0));
          case 'stock':
            return direction * (getTotalStock(a) - getTotalStock(b));
          case 'last_updated': {
            const aDate = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
            const bDate = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
            return direction * (aDate - bDate);
          }
          default:
            return direction * a.name.localeCompare(b.name);
        }
      });
    }

    return result;
  });

  const availableSuppliers = computed(() => {
    const supplierMap = new Map<string, { id: string; name: string }>();

    products.value.forEach(product => {
      if (product.supplier?.id && product.supplier?.name) {
        supplierMap.set(product.supplier.id, {
          id: product.supplier.id,
          name: product.supplier.name ?? '',
        });
      }
    });

    return Array.from(supplierMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  });

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

  const sortProducts = (
    sortBy: NonNullable<ProductFilter['sort_by']>,
    sortOrder: 'asc' | 'desc' = 'asc'
  ) => {
    updateFilters({ sort_by: sortBy, sort_order: sortOrder });
  };

  const getProductsInStock = computed(() =>
    products.value.filter(
      product => getTotalStock(product) > (product.minimumStock ?? 0)
    )
  );

  const getProductsLowStock = computed(() =>
    products.value.filter(product => {
      const totalStock = getTotalStock(product);
      const minStock = product.minimumStock ?? 0;
      return totalStock > 0 && totalStock <= minStock;
    })
  );

  const getProductsOutOfStock = computed(() =>
    products.value.filter(product => getTotalStock(product) <= 0)
  );

  const getProductsByCategory = (category: string) =>
    computed(() =>
      products.value.filter(product => (product.category ?? '') === category)
    );

  const getProductsBySupplier = (supplierId: string) =>
    computed(() =>
      products.value.filter(product => hasSupplierMatch(product, supplierId))
    );

  return {
    filteredProducts,
    availableSuppliers,
    updateFilters,
    clearFilters,
    applyPresetFilter,
    searchProducts,
    filterByCategory,
    filterBySupplier,
    filterByStockStatus,
    sortProducts,
    getProductsInStock,
    getProductsLowStock,
    getProductsOutOfStock,
    getProductsByCategory,
    getProductsBySupplier,
  };
}
