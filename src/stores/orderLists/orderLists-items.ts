import { supabase } from '@/boot/supabase';
import { useProductsStore } from '../products';
import { orderLogger } from '@/utils/logger';
import type { OrderListItem } from '@/types/inventory';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import type { OrderListWithItems } from './orderLists-core';
import type { AddOrderListItemRequest } from '@/types/stores';

export function useOrderListsItems(orderLists: Ref<OrderListWithItems[]>) {
  // Dependencies
  const productsStore = useProductsStore();

  const addOrderListItem = async (
    request: AddOrderListItemRequest
  ): Promise<void> => {
    try {
      const product = productsStore.getProductById(request.product_id);
      if (!product) throw new Error($t('orderlists.productnotfound'));

      const supplierProduct = product.supplier_products?.find(
        sp => sp.id === request.supplier_product_id
      );
      if (!supplierProduct) {
        throw new Error($t('orderlists.supplierproductnotfound'));
      }

      const itemData = {
        order_list_id: request.order_list_id,
        product_id: request.product_id,
        supplier_product_id: request.supplier_product_id,
        suggested_quantity: request.requested_quantity,
        ordered_quantity: request.requested_quantity,
        unit_price: supplierProduct.unit_price,
        notes: request.notes,
      };

      const { data, error } = await supabase
        .from('order_list_items')
        .insert(itemData)
        .select(
          `
          *,
          product:products(*),
          supplier_product:supplier_products(*)
        `
        )
        .single();

      if (error) throw error;

      // Update local state
      const orderListIndex = orderLists.value.findIndex(
        (list: OrderListWithItems) => list.id === request.order_list_id
      );
      if (orderListIndex !== -1) {
        orderLists.value[orderListIndex].items.push(data);
        updateOrderListTotals(request.order_list_id);
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'addOrderListItem',
      });
      orderLogger.error('Error adding order list item:', handledError);
      throw handledError;
    }
  };

  const removeOrderListItem = async (itemId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('order_list_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      for (const orderList of orderLists.value) {
        const itemIndex = orderList.items.findIndex(
          (item: OrderListItem) => item.id === itemId
        );
        if (itemIndex !== -1) {
          orderList.items.splice(itemIndex, 1);
          updateOrderListTotals(orderList.id);
          break;
        }
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'removeOrderListItem',
      });
      orderLogger.error('Error removing order list item:', handledError);
      throw handledError;
    }
  };

  const updateOrderListItem = async (
    itemId: string,
    updates: { requested_quantity?: number; notes?: string }
  ): Promise<void> => {
    try {
      const updateData: Partial<OrderListItem> = {};
      if (updates.requested_quantity !== undefined) {
        updateData.ordered_quantity = updates.requested_quantity;
      }
      if (updates.notes !== undefined) {
        updateData.notes = updates.notes;
      }

      const { error } = await supabase
        .from('order_list_items')
        .update(updateData)
        .eq('id', itemId);

      if (error) throw error;

      // Update local state
      for (const orderList of orderLists.value) {
        const item = orderList.items.find(
          (item: OrderListItem) => item.id === itemId
        );
        if (item) {
          if (updates.requested_quantity !== undefined) {
            item.requested_quantity = updates.requested_quantity;
            item.total_price = item.unit_price * updates.requested_quantity;
          }
          if (updates.notes !== undefined) item.notes = updates.notes;
          updateOrderListTotals(orderList.id);
          break;
        }
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'updateOrderListItem',
      });
      orderLogger.error('Error updating order list item:', handledError);
      throw handledError;
    }
  };

  const updateOrderListTotals = async (orderListId: string): Promise<void> => {
    const orderList = orderLists.value.find(
      (list: OrderListWithItems) => list.id === orderListId
    );
    if (!orderList) {
      return;
    }

    const totalItems = orderList.items.reduce(
      (sum: number, item: OrderListItem) => sum + item.requested_quantity,
      0
    );
    const totalValue = orderList.items.reduce(
      (sum: number, item: OrderListItem) => sum + item.total_price,
      0
    );

    try {
      const { error } = await supabase
        .from('order_lists')
        .update({
          total_items: totalItems,
          total_value: totalValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderListId);

      if (error) throw error;

      // Update local state
      orderList.total_items = totalItems;
      orderList.total_amount = totalValue;
      orderList.updated_at = new Date().toISOString();
    } catch (err) {
      orderLogger.error('Error updating order list totals:', err);
    }
  };

  return {
    // Actions
    addOrderListItem,
    removeOrderListItem,
    updateOrderListItem,
    updateOrderListTotals,
  };
}
