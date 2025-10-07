import { ref, type Ref } from 'vue';
import { supabase } from '@/boot/supabase';
import { useAuthStore } from '../auth';
import { useProductsStore } from '../products';
import { createLogger } from '@/utils/logger';
import type {
  OrderListDTO,
  OrderListItemDTO,
  OrderListInsert,
  OrderListItemInsert,
  OrderListRow,
} from '@/types/inventory';
import { mapOrderListRowToDTO } from '@/types/inventory';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import type { OrderListWithItems } from '@/types/stores';

const log = createLogger('OrderListsIntegration');

export function useOrderListsIntegration(
  orderLists: Ref<OrderListWithItems[]>
) {
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
      const original = orderLists.value.find(
        (list: OrderListWithItems) => list.id === originalId
      );
      if (!original) throw new Error('Original order list not found');

      const insertPayload: OrderListInsert = {
        practice_id: original.practice_id,
        location_id: original.location_id,
        supplier_id: original.supplier_id,
        name: newName,
        description: original.description ?? null,
        status: 'draft',
        total_items: 0,
        total_value: 0,
        min_order_value: null,
        created_by: authStore.user?.id ?? null,
      };

      const { data: newOrderList, error: orderListError } = await supabase
        .from('order_lists')
        .insert(insertPayload)
        .select(
          `
          *,
          supplier:suppliers(*)
        `
        )
        .single();

      if (orderListError) throw orderListError;

      // Duplicate items if any exist
      if (original.items.length > 0) {
        const itemsToCreate: OrderListItemInsert[] = original.items.map(
          item => ({
            order_list_id: (newOrderList as OrderListRow).id,
            product_id: item.product_id,
            supplier_product_id: item.supplier_product_id ?? null,
            suggested_quantity:
              item.suggested_quantity ?? item.ordered_quantity ?? 0,
            ordered_quantity:
              item.ordered_quantity ?? item.suggested_quantity ?? 0,
            unit_price: item.unit_price ?? null,
            total_price:
              (item.ordered_quantity ?? item.suggested_quantity ?? 0) *
              (item.unit_price ?? 0),
            notes: item.notes ?? null,
          })
        );

        const { error: itemsError } = await supabase
          .from('order_list_items')
          .insert(itemsToCreate);

        if (itemsError) throw itemsError;
      }

      const dto: OrderListDTO = {
        ...mapOrderListRowToDTO(newOrderList as OrderListRow),
        total_items: original.items.length,
        total_cost: (newOrderList as OrderListRow).total_value ?? 0,
        supplier:
          (newOrderList as { supplier?: OrderListDTO['supplier'] }).supplier ??
          null,
      };

      const newOrderListWithItems: OrderListWithItems = {
        ...dto,
        items: original.items.map(item => ({
          ...item,
          order_list_id: dto.id,
        })) as OrderListItemDTO[],
      };

      orderLists.value.unshift(newOrderListWithItems);
      log.info('Order list duplicated', {
        newOrderListId: newOrderList.id,
      });
      return newOrderListWithItems;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'duplicateOrderList',
        metadata: { originalId, newName },
      });
      log.error('Error duplicating order list', {
        error: handledError.message,
        originalId,
      });
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  const addToCart = async (orderListId: string): Promise<void> => {
    try {
      const orderList = orderLists.value.find(
        (list: OrderListWithItems) => list.id === orderListId
      );
      if (!orderList) throw new Error('Order list not found');

      // Clear existing cart
      productsStore.clearCart();

      // Add all items to cart
      for (const item of orderList.items) {
        const product = productsStore.getProductById(item.product_id);
        if (product) {
          const supplierProduct = (product as any).supplierProducts?.find(
            (sp: any) => sp.id === item.supplier_product_id
          );
          productsStore.addToCart(
            product,
            item.suggested_quantity ?? item.ordered_quantity ?? 0,
            supplierProduct?.supplier_id
          );
        }
      }
      log.info('Adding order list to cart', {
        orderListId,
      });
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'addToCart',
        metadata: { orderListId },
      });
      log.error('Error adding order list to cart', {
        error: handledError.message,
        orderListId,
      });
      throw handledError;
    }
  };

  const autoFillFromStockLevels = async (): Promise<void> => {
    saving.value = true;
    try {
      log.info('Auto-fill from stock levels not yet implemented');
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'autoFillFromStockLevels',
        metadata: {},
      });
      log.error('Error auto-filling order list', {
        error: handledError.message,
      });
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
