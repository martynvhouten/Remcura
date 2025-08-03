import { ref } from 'vue';
import { supabase } from '@/boot/supabase';
import { useAuthStore } from '../auth';
import { useProductsStore } from '../products';
import { orderLogger } from '@/utils/logger';
import type { OrderListStatus } from '@/types/inventory';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import type { OrderListWithItems } from './orderLists-core';

export function useOrderListsIntegration(orderLists: Ref<OrderListWithItems[]>) {
  // State
  const saving = ref(false);

  // Dependencies
  const authStore = useAuthStore();
  const productsStore = useProductsStore();

  const duplicateOrderList = async (
    originalId: string,
    newName: string
  ): Promise<OrderListWithItems> => {
    saving.value = true;
    try {
      const original = orderLists.value.find((list: OrderListWithItems) => list.id === originalId);
      if (!original) throw new Error($t('orderlists.originalorderlistnot'));

      // Create new order list
      const { data: newOrderList, error: orderListError } = await supabase
        .from('order_lists')
        .insert({
          practice_id: original.practice_id,
          supplier_id: original.supplier_id,
          name: newName,
          description: original.description,
          status: 'draft' as OrderListStatus,
          total_items: 0,
          total_value: 0,
          created_by: authStore.user?.id
        })
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .single();

      if (orderListError) throw orderListError;

      // Duplicate items if any exist
      if (original.items.length > 0) {
        const itemsToCreate = original.items.map(item => ({
          order_list_id: newOrderList.id,
          product_id: item.product_id,
          supplier_product_id: item.supplier_product_id,
          suggested_quantity: item.requested_quantity,
          ordered_quantity: item.requested_quantity,
          unit_price: item.unit_price,
          notes: item.notes
        }));

        const { error: itemsError } = await supabase
          .from('order_list_items')
          .insert(itemsToCreate);

        if (itemsError) throw itemsError;
      }

      const newOrderListWithItems: OrderListWithItems = {
        ...newOrderList,
        items: original.items.map(item => ({ ...item, order_list_id: newOrderList.id })),
        supplier: newOrderList.supplier
      };

      orderLists.value.unshift(newOrderListWithItems);
      return newOrderListWithItems;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'duplicateOrderList'
      });
      orderLogger.error('Error duplicating order list:', handledError);
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  const addToCart = async (orderListId: string): Promise<void> => {
    try {
      const orderList = orderLists.value.find((list: OrderListWithItems) => list.id === orderListId);
      if (!orderList) throw new Error($t('orderlists.orderlistnotfound'));

      // Clear existing cart
      productsStore.clearCart();

      // Add all items to cart
      for (const item of orderList.items) {
        const product = productsStore.getProductById(item.product_id);
        if (product) {
          const supplierProduct = product.supplier_products?.find(
            sp => sp.id === item.supplier_product_id
          );
          productsStore.addToCart(
            product,
            item.requested_quantity,
            supplierProduct?.supplier_id
          );
        }
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'addToCart'
      });
      orderLogger.error('Error adding order list to cart:', handledError);
      throw handledError;
    }
  };

  const autoFillFromStockLevels = async (
    orderListId: string
  ): Promise<void> => {
    saving.value = true;
    try {
      // This would implement logic to automatically suggest products based on stock levels
      // For now, this is a placeholder for future implementation
      orderLogger.info('Auto-fill from stock levels not yet implemented');
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'autoFillFromStockLevels'
      });
      orderLogger.error('Error auto-filling order list:', handledError);
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  return {
    // State
    saving,

    // Actions
    duplicateOrderList,
    addToCart,
    autoFillFromStockLevels,
  };
}