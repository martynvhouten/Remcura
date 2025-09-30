import type { Ref } from 'vue';
import { supabase } from '@/boot/supabase';
import { useProductsStore } from '../products';
import { createLogger } from '@/utils/logger';
import type {
  OrderListItemDTO,
  OrderListItemInsert,
  OrderListItemRow,
} from '@/types/inventory';
import { mapOrderListItemRowToDTO } from '@/types/inventory';
import type { Tables } from '@/types';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import type {
  OrderListWithItems,
  AddOrderListItemRequest,
} from '@/types/stores';

const log = createLogger('OrderListsItems');

export function useOrderListsItems(orderLists: Ref<OrderListWithItems[]>) {
  // Dependencies
  const productsStore = useProductsStore();

  const addOrderListItem = async (
    request: AddOrderListItemRequest
  ): Promise<void> => {
    try {
      const product = productsStore.getProductById(request.product_id);
      if (!product) {
        throw new Error('Product not found');
      }

      const supplierProduct = product.supplier_products?.find(
        sp => sp.id === request.supplier_product_id
      );

      if (!supplierProduct) {
        throw new Error('Supplier product not found');
      }

      const itemData: OrderListItemInsert = {
        order_list_id: request.order_list_id,
        product_id: request.product_id,
        supplier_product_id: request.supplier_product_id ?? null,
        suggested_quantity: request.requested_quantity,
        ordered_quantity: request.requested_quantity,
        unit_price:
          supplierProduct.list_price ?? supplierProduct.cost_price ?? 0,
        total_price:
          request.requested_quantity *
          (supplierProduct.list_price ?? supplierProduct.cost_price ?? 0),
        notes: request.notes ?? null,
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
      if (orderListIndex === -1) {
        return;
      }

      const targetList = orderLists.value[orderListIndex];
      if (!targetList) return;
      const newItemRow = data as OrderListItemRow & {
        product: Tables<'products'> | null;
        supplier_product: Tables<'supplier_products'> | null;
      };
      const newItem = mapOrderListItemRowToDTO(newItemRow);
      newItem.product = newItemRow.product ?? null;
      newItem.supplier_product = newItemRow.supplier_product ?? null;

      targetList.items.push(newItem);
      updateOrderListTotals(targetList.id);
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'addOrderListItem',
        metadata: { request },
      });
      log.error('Error adding order list item', {
        error: handledError.message,
        orderListId: request.order_list_id,
      });
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
          (item: OrderListItemDTO) => item.id === itemId
        );
        if (itemIndex !== -1) {
          orderList.items.splice(itemIndex, 1);
          updateOrderListTotals(orderList.id);
          break;
        }
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'removeOrderListItem',
        metadata: { itemId },
      });
      log.error('Error removing order list item', {
        error: handledError.message,
        itemId,
      });
      throw handledError;
    }
  };

  const updateOrderListItem = async (
    itemId: string,
    updates: { requested_quantity?: number; notes?: string }
  ): Promise<void> => {
    try {
      const updateData: Partial<OrderListItemRow> = {};
      if (updates.requested_quantity !== undefined) {
        updateData.suggested_quantity = updates.requested_quantity;
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
          (item: OrderListItemDTO) => item.id === itemId
        );
        if (item) {
          if (updates.requested_quantity !== undefined) {
            item.suggested_quantity = updates.requested_quantity;
            item.ordered_quantity = updates.requested_quantity;
            const unit = item.unit_price ?? 0;
            item.total_price = unit * updates.requested_quantity;
          }
          if (updates.notes !== undefined) item.notes = updates.notes;
          updateOrderListTotals(orderList.id);
          break;
        }
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'updateOrderListItem',
        metadata: { itemId, updates },
      });
      log.error('Error updating order list item', {
        error: handledError.message,
        itemId,
      });
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
      (sum: number, item: OrderListItemDTO) => sum + item.suggested_quantity,
      0
    );
    const totalValue = orderList.items.reduce(
      (sum: number, item: OrderListItemDTO) => sum + (item.total_price ?? 0),
      0
    );

    try {
      const { error } = await supabase
        .from('order_lists')
        .update({
          total_items: totalItems,
          total_cost: totalValue,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderListId);

      if (error) throw error;

      orderList.total_items = totalItems;
      orderList.total_cost = totalValue;
      orderList.updated_at = new Date().toISOString();
    } catch (err) {
      log.error('Error updating order list totals', {
        error: err instanceof Error ? err.message : String(err),
        orderListId,
      });
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
