import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useSuppliersStore } from '@/stores/suppliers';
import { useProductsCore } from './products-core';
import { useProductsCart } from './products-cart';
import { useProductsFilters } from './products-filters';
import { useProductsInventory } from './products-inventory';

export const useProductsStore = defineStore('products', () => {
  // Initialize core modules
  const core = useProductsCore();
  const cart = useProductsCart();
  const filters = useProductsFilters(core.products, core.filters);
  const inventory = useProductsInventory(core.products);

  // Store references (for backward compatibility)
  const suppliersStore = useSuppliersStore();

  // Return all public APIs from modules
  // This maintains the exact same interface as the original store
  return {
    // State from core
    products: core.products,
    categories: core.categories,
    loading: core.loading,
    lastSyncAt: core.lastSyncAt,
    filters: core.filters,

    // State from cart
    cart: cart.cart,
    orderLists: cart.orderLists,

    // Core getters
    productStats: core.productStats,
    availableCategories: core.availableCategories,
    availableCountries: core.availableCountries,
    availableGpcCodes: core.availableGpcCodes,
    availableLifecycleStatuses: core.availableLifecycleStatuses,
    batchTrackedProducts: core.batchTrackedProducts,
    manualStockProducts: core.manualStockProducts,

    // Cart getters
    cartItemsCount: cart.cartItemsCount,
    cartTotal: cart.cartTotal,

    // Filter getters
    filteredProducts: filters.filteredProducts,
    availableSuppliers: filters.availableSuppliers,
    getProductsInStock: filters.getProductsInStock,
    getProductsLowStock: filters.getProductsLowStock,
    getProductsOutOfStock: filters.getProductsOutOfStock,

    // Inventory getters (consolidated from inventory store)
    totalStockValue: inventory.totalStockValue,
    lowStockProducts: inventory.lowStockProducts,
    outOfStockProducts: inventory.outOfStockProducts,
    stockStatusSummary: inventory.stockStatusSummary,
    criticalStockAlerts: inventory.criticalStockAlerts,
    productsNeedingReorder: inventory.productsNeedingReorder,
    inventoryMetrics: inventory.inventoryMetrics,
    topCategoriesByValue: inventory.topCategoriesByValue,
    topProductsByValue: inventory.topProductsByValue,
    productsApproachingExpiry: inventory.productsApproachingExpiry,

    // Core actions
    fetchProducts: core.fetchProducts,
    fetchCategories: core.fetchCategories,
    refreshData: core.refreshData,
    createProduct: core.createProduct,
    updateProduct: core.updateProduct,
    deleteProduct: core.deleteProduct,
    getProductById: core.getProductById,
    getProductBySku: core.getProductBySku,
    requiresBatchTracking: core.requiresBatchTracking,

    // Cart actions
    addToCart: cart.addToCart,
    removeFromCart: cart.removeFromCart,
    updateCartItemQuantity: cart.updateCartItemQuantity,
    clearCart: cart.clearCart,

    // Order list actions
    addToOrderList: cart.addToOrderList,
    removeFromOrderList: cart.removeFromOrderList,
    clearOrderLists: cart.clearOrderLists,

    // Filter actions
    updateFilters: filters.updateFilters,
    clearFilters: filters.clearFilters,
    applyPresetFilter: filters.applyPresetFilter,
    searchProducts: filters.searchProducts,
    filterByCategory: filters.filterByCategory,
    filterBySupplier: filters.filterBySupplier,
    filterByStockStatus: filters.filterByStockStatus,
    sortProducts: filters.sortProducts,
    getProductsByCategory: filters.getProductsByCategory,
    getProductsBySupplier: filters.getProductsBySupplier,

    // Store references (for backward compatibility)
    suppliersStore,
  };
});

// Re-export types and interfaces for backward compatibility
export type {
  ProductWithStock,
  ProductCategory,
  ProductFilter,
  CartItem,
  OrderListCart,
} from '@/types/inventory';
