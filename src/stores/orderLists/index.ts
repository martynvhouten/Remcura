import { defineStore } from 'pinia';
import { useOrderListsCore } from './orderLists-core';
import { useOrderListsItems } from './orderLists-items';
import { useOrderListsIntegration } from './orderLists-integration';
import { useOrderListsMinMax } from './orderLists-minmax';
import { useOrderListsSupplierSplitting } from './orderLists-supplier-splitting';
import { useOrderListsRealtime } from './orderLists-realtime';

export type {
  OrderListWithItems,
  CreateOrderListRequest,
  UpdateOrderListRequest,
  AddOrderListItemRequest,
} from '@/types/stores';

export const useOrderListsStore = defineStore('orderLists', () => {
  const core = useOrderListsCore();
  const items = useOrderListsItems(core.orderLists);
  const integration = useOrderListsIntegration(core.orderLists);

  const minmax = useOrderListsMinMax();
  const supplierSplitting = useOrderListsSupplierSplitting();
  const realtime = useOrderListsRealtime();

  return {
    orderLists: core.orderLists,
    loading: core.loading,
    saving: core.saving,

    getOrderListById: core.getOrderListById,
    getOrderListsBySupplier: core.getOrderListsBySupplier,
    getOrderListsByStatus: core.getOrderListsByStatus,
    orderListStats: core.orderListStats,

    fetchOrderLists: core.fetchOrderLists,
    createOrderList: core.createOrderList,
    updateOrderList: core.updateOrderList,
    deleteOrderList: core.deleteOrderList,
    changeOrderListStatus: core.changeOrderListStatus,

    addOrderListItem: items.addOrderListItem,
    removeOrderListItem: items.removeOrderListItem,
    updateOrderListItem: items.updateOrderListItem,

    duplicateOrderList: integration.duplicateOrderList,
    addToCart: integration.addToCart,
    autoFillFromStockLevels: integration.autoFillFromStockLevels,

    orderSuggestions: minmax.reorderSuggestions,
    loadingOrderSuggestions: minmax.loading,
    generateOrderSuggestions: minmax.refreshReorderSuggestions,
    applyOrderSuggestions: minmax.createOrdersFromAdvice,
    clearOrderSuggestions: () => {
      minmax.reorderSuggestions.value = [];
    },

    splitOrderBySuppliers: supplierSplitting.splitOrderBySuppliers,
    sendOrdersToSuppliers: supplierSplitting.sendOrdersToSuppliers,

    setupRealtime: realtime.setupRealtime,
    teardownRealtime: realtime.teardownRealtime,
  };
});
