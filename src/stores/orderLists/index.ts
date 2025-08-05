import { defineStore } from 'pinia';
import { useOrderListsCore } from './orderLists-core';
import { useOrderListsItems } from './orderLists-items';
import { useOrderListsIntegration } from './orderLists-integration';
import { useOrderListsMinMax } from './orderLists-minmax';
import { useOrderListsSupplierSplitting } from './orderLists-supplier-splitting';
import { useOrderListsRealtime } from './orderLists-realtime';

// Re-export types and interfaces
export type { OrderListWithItems, CreateOrderListRequest, UpdateOrderListRequest } from './orderLists-core';
export type { AddOrderListItemRequest } from './orderLists-items';

export const useOrderListsStore = defineStore('orderLists', () => {
  // Initialize core modules
  const core = useOrderListsCore();
  const items = useOrderListsItems(core.orderLists);
  const integration = useOrderListsIntegration(core.orderLists);
  
  // Initialize advanced modules
  const minmax = useOrderListsMinMax();
  const supplierSplitting = useOrderListsSupplierSplitting();
  const realtime = useOrderListsRealtime();

  // Return all public APIs from modules
  // This maintains the exact same interface as the original store
  return {
    // State from core
    orderLists: core.orderLists,
    loading: core.loading,
    saving: core.saving,

    // Getters from core
    getOrderListById: core.getOrderListById,
    getOrderListsBySupplier: core.getOrderListsBySupplier,
    getOrderListsByStatus: core.getOrderListsByStatus,
    orderListStats: core.orderListStats,

    // Actions from core
    fetchOrderLists: core.fetchOrderLists,
    createOrderList: core.createOrderList,
    updateOrderList: core.updateOrderList,
    deleteOrderList: core.deleteOrderList,
    changeOrderListStatus: core.changeOrderListStatus,

    // Actions from items
    addOrderListItem: items.addOrderListItem,
    removeOrderListItem: items.removeOrderListItem,
    updateOrderListItem: items.updateOrderListItem,

    // Actions from integration
    duplicateOrderList: integration.duplicateOrderList,
    addToCart: integration.addToCart,
    autoFillFromStockLevels: integration.autoFillFromStockLevels,

    // State and actions from minmax module
    orderSuggestions: minmax.reorderSuggestions,
    loadingOrderSuggestions: minmax.loading,
    generateOrderSuggestions: minmax.refreshReorderSuggestions,
    applyOrderSuggestions: minmax.createOrdersFromAdvice,
    clearOrderSuggestions: () => {
      minmax.reorderSuggestions.value = [];
    },

    // Actions from supplier splitting module
    splitOrdersBySupplier: supplierSplitting.splitOrdersBySupplier,
    sendOrdersToSuppliers: supplierSplitting.sendOrdersToSuppliers,
    trackOrderStatus: supplierSplitting.trackOrderStatus,

    // Real-time setup from realtime module
    setupRealtime: realtime.setupRealtime,
    teardownRealtime: realtime.teardownRealtime,
  };
});