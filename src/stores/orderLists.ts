import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from 'src/boot/supabase';
import { useAuthStore } from './auth';
import { useProductsStore } from './products';
import { useSuppliersStore } from './suppliers';
import type {
  OrderList,
  OrderListItem,
  Supplier,
  OrderListStatus,
} from 'src/types/inventory';
import { ServiceErrorHandler } from 'src/utils/service-error-handler';

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

export interface AddOrderListItemRequest {
  order_list_id: string;
  product_id: string;
  supplier_product_id: string;
  requested_quantity: number;
  location_id?: string;
  notes?: string;
}

export const useOrderListsStore = defineStore('orderLists', () => {
  // State
  const orderLists = ref<OrderListWithItems[]>([]);
  const loading = ref(false);
  const saving = ref(false);

  // Dependencies
  const authStore = useAuthStore();
  const productsStore = useProductsStore();
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
      console.error('Error fetching order lists:', handledError);
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
      console.error('Error creating order list:', handledError);
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
        if (!orderList) return;
        
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
      console.error('Error updating order list:', handledError);
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
      console.error('Error deleting order list:', handledError);
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  const duplicateOrderList = async (
    originalId: string,
    newName: string
  ): Promise<OrderListWithItems> => {
    saving.value = true;
    try {
      const original = orderLists.value.find(list => list.id === originalId);
      if (!original) throw new Error('Original order list not found');

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
      console.error('Error duplicating order list:', handledError);
      throw handledError;
    } finally {
      saving.value = false;
    }
  };

  const addOrderListItem = async (
    request: AddOrderListItemRequest
  ): Promise<void> => {
    try {
      const product = productsStore.getProductById(request.product_id);
      if (!product) throw new Error('Product not found');

      const supplierProduct = product.supplier_products?.find(
        sp => sp.id === request.supplier_product_id
      );
      if (!supplierProduct) throw new Error('Supplier product not found');

      const itemData = {
        order_list_id: request.order_list_id,
        product_id: request.product_id,
        supplier_product_id: request.supplier_product_id,
        suggested_quantity: request.requested_quantity,
        ordered_quantity: request.requested_quantity,
        unit_price: supplierProduct.unit_price,
        notes: request.notes
      };

      const { data, error } = await supabase
        .from('order_list_items')
        .insert(itemData)
        .select(`
          *,
          product:products(*),
          supplier_product:supplier_products(*)
        `)
        .single();

      if (error) throw error;

      // Update local state
      const orderListIndex = orderLists.value.findIndex(
        list => list.id === request.order_list_id
      );
      if (orderListIndex !== -1) {
        orderLists.value[orderListIndex].items.push(data);
        updateOrderListTotals(request.order_list_id);
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'addOrderListItem'
      });
      console.error('Error adding order list item:', handledError);
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
        const itemIndex = orderList.items.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
          orderList.items.splice(itemIndex, 1);
          updateOrderListTotals(orderList.id);
          break;
        }
      }
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'removeOrderListItem'
      });
      console.error('Error removing order list item:', handledError);
      throw handledError;
    }
  };

  const updateOrderListItem = async (
    itemId: string,
    updates: { requested_quantity?: number; notes?: string }
  ): Promise<void> => {
    try {
      const updateData: any = {};
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
        const item = orderList.items.find(item => item.id === itemId);
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
        operation: 'updateOrderListItem'
      });
      console.error('Error updating order list item:', handledError);
      throw handledError;
    }
  };

  const updateOrderListTotals = async (orderListId: string): Promise<void> => {
    const orderList = orderLists.value.find(list => list.id === orderListId);
    if (!orderList) return;

    const totalItems = orderList.items.reduce(
      (sum, item) => sum + item.requested_quantity,
      0
    );
    const totalValue = orderList.items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );

    try {
      const { error } = await supabase
        .from('order_lists')
        .update({
          total_items: totalItems,
          total_value: totalValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderListId);

      if (error) throw error;

      // Update local state
      orderList.total_items = totalItems;
      orderList.total_amount = totalValue;
      orderList.updated_at = new Date().toISOString();
    } catch (err) {
      console.error('Error updating order list totals:', err);
    }
  };

  const addToCart = async (orderListId: string): Promise<void> => {
    try {
      const orderList = orderLists.value.find(list => list.id === orderListId);
      if (!orderList) throw new Error('Order list not found');

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
      console.error('Error adding order list to cart:', handledError);
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
      console.log('Auto-fill from stock levels not yet implemented');
    } catch (err) {
      const handledError = ServiceErrorHandler.handle(err, {
        service: 'OrderListsStore',
        operation: 'autoFillFromStockLevels'
      });
      console.error('Error auto-filling order list:', handledError);
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
      const updateData: any = {
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
      console.error('Error changing order list status:', handledError);
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
    duplicateOrderList,
    addOrderListItem,
    removeOrderListItem,
    updateOrderListItem,
    addToCart,
    autoFillFromStockLevels,
    changeOrderListStatus,
  };
});
