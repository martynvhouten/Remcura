import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { useAuthStore } from '../auth';
import { useSuppliersStore } from '../suppliers';
import { orderLogger } from '@/utils/logger';
import type {
  OrderList,
  OrderListItem,
  OrderListStatus,
} from '@/types/inventory';
import { ServiceErrorHandler } from '@/utils/service-error-handler';

export interface OrderListWithItems extends OrderList {
  items: OrderListItem[];
  supplier?: Supplier;
}

export interface CreateOrderListRequest {
  practice_id: string;
  supplier_id: string;
  name: string;
  description?: string;
  auto_suggest_quantities?: boolean;
  urgent_order?: boolean;
  notes?: string;
}

export interface UpdateOrderListRequest {
  id: string;
  name?: string;
  description?: string;
  supplier_id?: string;
  auto_suggest_quantities?: boolean;
  urgent_order?: boolean;
  notes?: string;
}

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
    return (id: string) => orderLists.value.find(list => list.id === id);
  });

  const getOrderListsBySupplier = computed(() => {
    return (supplierId: string) =>
      orderLists.value.filter(list => list.supplier_id === supplierId);
  });

  const getOrderListsByStatus = computed(() => {
    return (status: OrderListStatus) =>
      orderLists.value.filter(list => list.status === status);
  });

  const orderListStats = computed(() => {
    return {
      total: orderLists.value.length,
      draft: orderLists.value.filter(list => list.status === 'draft').length,
      ready: orderLists.value.filter(list => list.status === 'active').length,
      submitted: orderLists.value.filter(list => list.status === 'submitted')
        .length,
      confirmed: orderLists.value.filter(list => list.status === 'completed')
        .length,
      delivered: orderLists.value.filter(list => list.status === 'cancelled')
        .length,
    };
  });

  // Actions
  const fetchOrderLists = async (practiceId: string) => {
    loading.value = true;
    try {
      const { data, error } = await supabase
        .from('order_lists')
        .select(`
          *,
          supplier:suppliers(*),
          items:order_list_items(
            *,
            product:products(*),
            supplier_product:supplier_products(*)
          )
        `)
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      orderLists.value = (data || []).map(orderList => ({
        ...orderList,
        items: orderList.items || []
      }));
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'fetchOrderLists'
      });
      orderLogger.error('Error fetching order lists:', handledError);
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
      const orderListData = {
        practice_id: request.practice_id,
        supplier_id: request.supplier_id,
        name: request.name,
        description: request.description,
        status: 'draft' as OrderListStatus,
        total_items: 0,
        total_value: 0,
        created_by: authStore.user?.id
      };

      const { data, error } = await supabase
        .from('order_lists')
        .insert(orderListData)
        .select(`
          *,
          supplier:suppliers(*)
        `)
        .single();

      if (error) throw error;

      const newOrderList: OrderListWithItems = {
        ...data,
        items: [],
        supplier: data.supplier
      };

      orderLists.value.unshift(newOrderList);
      return newOrderList;
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'createOrderList'
      });
      orderLogger.error('Error creating order list:', handledError);
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
      const { error } = await supabase
        .from('order_lists')
        .update({
          ...(request.name && { name: request.name }),
          ...(request.description && { description: request.description }),
          ...(request.supplier_id && { supplier_id: request.supplier_id }),
          updated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      // Update local state
      const index = orderLists.value.findIndex(list => list.id === request.id);
      if (index !== -1) {
        const orderList = orderLists.value[index];
        if (!orderList) { return; }
        
        if (request.name !== undefined) orderList.name = request.name;
        if (request.description !== undefined)
          orderList.description = request.description;
        if (request.supplier_id !== undefined) {
          orderList.supplier_id = request.supplier_id;
          orderList.supplier = suppliersStore.suppliers.find(
            s => s.id === request.supplier_id
          ) || undefined;
        }
        orderList.updated_at = new Date().toISOString();
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'updateOrderList'
      });
      orderLogger.error('Error updating order list:', handledError);
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
        .eq('id', id);

      if (error) throw error;

      // Update local state
      const index = orderLists.value.findIndex(list => list.id === id);
      if (index !== -1) {
        orderLists.value.splice(index, 1);
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'deleteOrderList'
      });
      orderLogger.error('Error deleting order list:', handledError);
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
      const updateData: Partial<OrderList> = {
        status,
        updated_at: new Date().toISOString(),
      };

      // Add submission specific fields
      if (status === 'submitted') {
        updateData.submitted_at = new Date().toISOString();
        updateData.submitted_by = authStore.user?.id || '';
      }

      const { error } = await supabase
        .from('order_lists')
        .update(updateData)
        .eq('id', orderListId);

      if (error) throw error;

      // Update local state
      const orderList = orderLists.value.find(list => list.id === orderListId);
      if (orderList) {
        Object.assign(orderList, updateData);
      }

    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'changeOrderListStatus'
      });
      orderLogger.error('Error changing order list status:', handledError);
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