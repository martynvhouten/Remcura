import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { useAuthStore } from '../auth';
import { useSuppliersStore } from '../suppliers';
import { createLogger } from '@/utils/logger';
import {
  OrderListRow,
  OrderListItemRow,
  OrderListStatus,
  OrderListDTO,
  OrderListItemDTO,
  OrderListInsert,
  OrderListItemInsert,
  mapOrderListRowToDTO,
  mapOrderListItemRowToDTO,
} from '@/types/inventory';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import type {
  OrderListWithItems,
  CreateOrderListRequest,
  UpdateOrderListRequest,
} from '@/types/stores';
import type { Tables } from '@/types';

const log = createLogger('OrderListsCore');

export function useOrderListsCore() {
  // State
  const orderLists = ref<OrderListWithItems[]>([]);
  const loading = ref(false);
  const saving = ref(false);

  // Dependencies
  const authStore = useAuthStore();
  const suppliersStore = useSuppliersStore();

  // Getters
  const getOrderListById = computed(() => {
    return (id: string) => orderLists.value.find((list: any) => list.id === id);
  });

  const getOrderListsBySupplier = computed(() => {
    return (supplierId: string) =>
      orderLists.value.filter((list: any) => list.supplier_id === supplierId);
  });

  const getOrderListsByStatus = computed(() => {
    return (status: OrderListStatus) =>
      orderLists.value.filter((list: any) => list.status === status);
  });

  const orderListStats = computed(() => {
    const stats: Record<OrderListStatus, number> = {
      draft: 0,
      active: 0,
      submitted: 0,
      completed: 0,
      cancelled: 0,
    };

    orderLists.value.forEach(list => {
      const status: OrderListStatus = list.status ?? 'draft';
      stats[status] = (stats[status] ?? 0) + 1;
    });

    return {
      total: orderLists.value.length,
      ...stats,
    };
  });

  // Actions
  const fetchOrderLists = async (practiceId: string) => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('order_lists')
        .select(
          `
          *,
          supplier:suppliers(*),
          items:order_list_items(
            *,
            product:products(*),
            supplier_product:supplier_products(*),
            reorder_suggestion:reorder_suggestions(*)
          )
        `
        )
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const orderListsWithRelations = (data ?? []) as Array<
        OrderListRow & {
          supplier: Tables<'suppliers'> | null;
          items: Array<
            OrderListItemRow & {
              product: Tables<'products'> | null;
              supplier_product: Tables<'supplier_products'> | null;
            }
          > | null;
        }
      >;

      orderLists.value = (orderListsWithRelations as any).map(
        (orderList: any) => {
          const dto = mapOrderListRowToDTO(orderList);
          dto.supplier = orderList.supplier ?? null;
          const items: OrderListItemDTO[] = (orderList.items ?? []).map(
            (item: any) => {
              const itemDto = mapOrderListItemRowToDTO(item);
              itemDto.product = item.product ?? null;
              itemDto.supplier_product = item.supplier_product ?? null;
              return itemDto;
            }
          );

          return {
            ...dto,
            items,
          } satisfies OrderListWithItems;
        }
      );
    } catch (err: unknown) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'fetchOrderLists',
        practiceId,
      });
      log.error('Error fetching order lists', {
        error: handledError.message,
        practiceId,
      });
      throw handledError;
    } finally {
      loading.value = false;
    }
  };

  const createOrderList = async (
    request: CreateOrderListRequest
  ): Promise<OrderListWithItems> => {
    saving.value = true;
    try {
      const orderListData: OrderListInsert = {
        practice_id: request.practice_id,
        location_id: request.location_id,
        supplier_id: request.supplier_id ?? null,
        name: request.name,
        description: request.description ?? null,
        status: request.status ?? 'draft',
        total_items: 0,
        total_value: 0,
        min_order_value: null,
        created_by: authStore.user?.id ?? null,
      };

      const { data, error } = await supabase
        .from('order_lists')
        .insert(orderListData)
        .select(
          `
          *,
          supplier:suppliers(*)
        `
        )
        .single();

      if (error) throw error;

      const createdDto = mapOrderListRowToDTO(data as OrderListRow);
      createdDto.supplier =
        (data as { supplier?: Tables<'suppliers'> | null }).supplier ?? null;

      const createdOrderList: OrderListWithItems = {
        ...createdDto,
        items: [],
      };

      (orderLists.value as any).unshift(createdOrderList);
      return createdOrderList;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'createOrderList',
        practiceId: request.practice_id,
        metadata: { request },
      });
      log.error('Error creating order list', {
        error: handledError.message,
        practiceId: request.practice_id,
      });
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  const updateOrderList = async (
    request: UpdateOrderListRequest
  ): Promise<void> => {
    saving.value = true;
    try {
      const updatePayload: Partial<OrderListRow> = {
        updated_at: new Date().toISOString(),
      };
      if (request.name !== undefined) updatePayload.name = request.name;
      if (request.description !== undefined)
        updatePayload.description = request.description;
      if (request.supplier_id !== undefined)
        updatePayload.supplier_id = request.supplier_id;
      if (request.location_id !== undefined)
        updatePayload.location_id = request.location_id;

      const { error } = await supabase
        .from('order_lists')
        .update(updatePayload)
        .eq('id', request.id)
        .eq('practice_id', authStore.userProfile?.clinic_id || '');

      if (error) throw error;

      // Update local state
      const index = orderLists.value.findIndex(list => list.id === request.id);
      if (index !== -1) {
        const orderList = orderLists.value[index];
        if (!orderList) {
          return;
        }

        if (request.name !== undefined) orderList.name = request.name;
        if (request.description !== undefined)
          orderList.description = request.description;
        if (request.supplier_id !== undefined) {
          orderList.supplier_id = request.supplier_id;
          orderList.supplier =
            (suppliersStore.suppliers as any).find(
              (s: any) => s.id === request.supplier_id
            ) ?? null;
        }
        if (request.location_id !== undefined) {
          orderList.location_id = request.location_id;
        }
        orderList.updated_at =
          updatePayload.updated_at ?? new Date().toISOString();
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'updateOrderList',
        practiceId: authStore.userProfile?.clinic_id ?? '',
        metadata: { request },
      });
      log.error('Error updating order list', {
        error: handledError.message,
        orderListId: request.id,
      });
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  const deleteOrderList = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      const { error } = await supabase
        .from('order_lists')
        .delete()
        .eq('id', id)
        .eq('practice_id', authStore.userProfile?.clinic_id || '');

      if (error) throw error;

      // Update local state
      const index = orderLists.value.findIndex(list => list.id === id);
      if (index !== -1) {
        orderLists.value.splice(index, 1);
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'deleteOrderList',
        practiceId: authStore.userProfile?.clinic_id ?? '',
        metadata: { orderListId: id },
      });
      log.error('Error deleting order list', {
        error: handledError.message,
        orderListId: id,
      });
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  const changeOrderListStatus = async (
    orderListId: string,
    status: OrderListStatus
  ): Promise<void> => {
    try {
      saving.value = true;

      // Prepare update data
      const updateData: Partial<OrderListRow> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add submission specific fields
      if (status === 'submitted') {
        // No submitted fields in schema; future enhancement could persist elsewhere
      }

      const { error } = await supabase
        .from('order_lists')
        .update(updateData)
        .eq('id', orderListId)
        .eq('practice_id', authStore.userProfile?.clinic_id || '');

      if (error) throw error;

      // Update local state
      const orderList = orderLists.value.find(
        (list: any) => list.id === orderListId
      );
      if (orderList) {
        orderList.status = status;
        orderList.updated_at = updateData.updated_at ?? orderList.updated_at;
        // Submitted metadata not persisted – leaving local fields unchanged
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err as Error, {
        service: 'OrderListsStore',
        operation: 'changeOrderListStatus',
        practiceId: authStore.userProfile?.clinic_id ?? '',
        metadata: { orderListId, status },
      });
      log.error('Error changing order list status', {
        error: handledError.message,
        orderListId,
        status,
      });
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  return {
    // State
    orderLists,
    loading,
    saving,

    // Getters
    getOrderListById,
    getOrderListsBySupplier,
    getOrderListsByStatus,
    orderListStats,

    // Actions
    fetchOrderLists,
    createOrderList,
    updateOrderList,
    deleteOrderList,
    changeOrderListStatus,
  };
}
