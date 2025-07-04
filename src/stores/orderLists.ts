import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAuthStore } from "./auth";
import { useProductsStore } from "./products";
import { useSuppliersStore } from "./suppliers";
import type {
  OrderList,
  OrderListItem,
  Supplier,
  OrderListStatus,
} from "src/types/inventory";

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

export const useOrderListsStore = defineStore("orderLists", () => {
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
    return (id: string) => orderLists.value.find((list) => list.id === id);
  });

  const getOrderListsBySupplier = computed(() => {
    return (supplierId: string) =>
      orderLists.value.filter((list) => list.supplier_id === supplierId);
  });

  const getOrderListsByStatus = computed(() => {
    return (status: OrderListStatus) =>
      orderLists.value.filter((list) => list.status === status);
  });

  const orderListStats = computed(() => {
    return {
      total: orderLists.value.length,
      draft: orderLists.value.filter((list) => list.status === "draft").length,
      ready: orderLists.value.filter((list) => list.status === "ready").length,
      submitted: orderLists.value.filter((list) => list.status === "submitted")
        .length,
      confirmed: orderLists.value.filter((list) => list.status === "confirmed")
        .length,
      delivered: orderLists.value.filter((list) => list.status === "delivered")
        .length,
    };
  });

  // Actions
  const fetchOrderLists = async (practiceId: string) => {
    loading.value = true;
    try {
      // For now, use mock data since we don't have the database schema yet
      // This will be replaced with actual Supabase calls when the schema is ready
      orderLists.value = [];
    } catch (error) {
      console.error("Error fetching order lists:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const createOrderList = async (
    request: CreateOrderListRequest
  ): Promise<OrderListWithItems> => {
    saving.value = true;
    try {
      // Mock implementation - replace with actual Supabase call
      const newOrderList: OrderListWithItems = {
        id: `ol_${Date.now()}`,
        practice_id: request.practice_id,
        supplier_id: request.supplier_id,
        name: request.name,
        description: request.description,
        status: "draft" as OrderListStatus,
        total_items: 0,
        total_amount: 0,
        currency: "EUR",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: authStore.user?.id || "",
        auto_suggest_quantities: request.auto_suggest_quantities || false,
        urgent_order: request.urgent_order || false,
        notes: request.notes,
        items: [],
        supplier: suppliersStore.suppliers.find(
          (s) => s.id === request.supplier_id
        ),
      };

      orderLists.value.unshift(newOrderList);
      return newOrderList;
    } catch (error) {
      console.error("Error creating order list:", error);
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const updateOrderList = async (
    request: UpdateOrderListRequest
  ): Promise<void> => {
    saving.value = true;
    try {
      // Mock implementation - replace with actual Supabase call
      const index = orderLists.value.findIndex(
        (list) => list.id === request.id
      );
      if (index !== -1) {
        const orderList = orderLists.value[index];
        if (request.name !== undefined) orderList.name = request.name;
        if (request.description !== undefined)
          orderList.description = request.description;
        if (request.supplier_id !== undefined) {
          orderList.supplier_id = request.supplier_id;
          orderList.supplier = suppliersStore.suppliers.find(
            (s) => s.id === request.supplier_id
          );
        }
        if (request.auto_suggest_quantities !== undefined)
          orderList.auto_suggest_quantities = request.auto_suggest_quantities;
        if (request.urgent_order !== undefined)
          orderList.urgent_order = request.urgent_order;
        if (request.notes !== undefined) orderList.notes = request.notes;
        orderList.updated_at = new Date().toISOString();
      }
    } catch (error) {
      console.error("Error updating order list:", error);
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const deleteOrderList = async (id: string): Promise<void> => {
    saving.value = true;
    try {
      // Mock implementation - replace with actual Supabase call
      const index = orderLists.value.findIndex((list) => list.id === id);
      if (index !== -1) {
        orderLists.value.splice(index, 1);
      }
    } catch (error) {
      console.error("Error deleting order list:", error);
      throw error;
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
      const original = orderLists.value.find((list) => list.id === originalId);
      if (!original) throw new Error("Original order list not found");

      const newOrderList: OrderListWithItems = {
        ...original,
        id: `ol_${Date.now()}`,
        name: newName,
        status: "draft" as OrderListStatus,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: [...original.items], // Copy items
      };

      orderLists.value.unshift(newOrderList);
      return newOrderList;
    } catch (error) {
      console.error("Error duplicating order list:", error);
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const addOrderListItem = async (
    request: AddOrderListItemRequest
  ): Promise<void> => {
    try {
      // Mock implementation - replace with actual Supabase call
      const product = productsStore.getProductById(request.product_id);
      if (!product) throw new Error("Product not found");

      const supplierProduct = product.supplier_products?.find(
        (sp) => sp.id === request.supplier_product_id
      );
      if (!supplierProduct) throw new Error("Supplier product not found");

      const newItem: OrderListItem = {
        id: `oli_${Date.now()}`,
        order_list_id: request.order_list_id,
        practice_id: authStore.currentPractice?.id || "",
        product_id: request.product_id,
        supplier_product_id: request.supplier_product_id,
        location_id: request.location_id,
        requested_quantity: request.requested_quantity,
        unit_price: supplierProduct.unit_price,
        total_price: supplierProduct.unit_price * request.requested_quantity,
        currency: supplierProduct.currency,
        suggestion_source: "manual",
        status: "pending",
        notes: request.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const orderListIndex = orderLists.value.findIndex(
        (list) => list.id === request.order_list_id
      );
      if (orderListIndex !== -1) {
        orderLists.value[orderListIndex].items.push(newItem);
        updateOrderListTotals(request.order_list_id);
      }
    } catch (error) {
      console.error("Error adding order list item:", error);
      throw error;
    }
  };

  const removeOrderListItem = async (itemId: string): Promise<void> => {
    try {
      // Mock implementation - replace with actual Supabase call
      for (const orderList of orderLists.value) {
        const itemIndex = orderList.items.findIndex(
          (item) => item.id === itemId
        );
        if (itemIndex !== -1) {
          orderList.items.splice(itemIndex, 1);
          updateOrderListTotals(orderList.id);
          break;
        }
      }
    } catch (error) {
      console.error("Error removing order list item:", error);
      throw error;
    }
  };

  const updateOrderListItem = async (
    itemId: string,
    updates: { requested_quantity?: number; notes?: string }
  ): Promise<void> => {
    try {
      // Mock implementation - replace with actual Supabase call
      for (const orderList of orderLists.value) {
        const item = orderList.items.find((item) => item.id === itemId);
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
    } catch (error) {
      console.error("Error updating order list item:", error);
      throw error;
    }
  };

  const updateOrderListTotals = (orderListId: string): void => {
    const orderList = orderLists.value.find((list) => list.id === orderListId);
    if (!orderList) return;

    orderList.total_items = orderList.items.reduce(
      (sum, item) => sum + item.requested_quantity,
      0
    );
    orderList.total_amount = orderList.items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );
    orderList.updated_at = new Date().toISOString();
  };

  const addToCart = async (orderListId: string): Promise<void> => {
    try {
      const orderList = orderLists.value.find(
        (list) => list.id === orderListId
      );
      if (!orderList) throw new Error("Order list not found");

      // Clear existing cart
      productsStore.clearCart();

      // Add all items to cart
      for (const item of orderList.items) {
        const product = productsStore.getProductById(item.product_id);
        if (product) {
          const supplierProduct = product.supplier_products?.find(
            (sp) => sp.id === item.supplier_product_id
          );
          productsStore.addToCart(
            product,
            item.requested_quantity,
            supplierProduct?.supplier_id
          );
        }
      }
    } catch (error) {
      console.error("Error adding order list to cart:", error);
      throw error;
    }
  };

  const autoFillFromStockLevels = async (
    orderListId: string
  ): Promise<void> => {
    saving.value = true;
    try {
      // Mock implementation - replace with actual logic based on stock levels
      console.log("Auto-filling order list from stock levels:", orderListId);
      // This would implement logic to automatically suggest products based on stock levels
    } catch (error) {
      console.error("Error auto-filling order list:", error);
      throw error;
    } finally {
      saving.value = false;
    }
  };

  const changeOrderListStatus = async (
    orderListId: string,
    status: OrderListStatus
  ): Promise<void> => {
    try {
      // Mock implementation - replace with actual Supabase call
      const orderList = orderLists.value.find(
        (list) => list.id === orderListId
      );
      if (orderList) {
        orderList.status = status;
        orderList.updated_at = new Date().toISOString();
        if (status === "submitted") {
          orderList.submitted_at = new Date().toISOString();
          orderList.submitted_by = authStore.user?.id || "";
        }
      }
    } catch (error) {
      console.error("Error changing order list status:", error);
      throw error;
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
