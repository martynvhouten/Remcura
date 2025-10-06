import { computed, ref } from 'vue';
import type { ProductWithStock } from '@/types/inventory';

interface CartItemState {
  product_id: string;
  product: ProductWithStock;
  quantity: number;
  unit_price?: number | null;
  supplier_id?: string | null;
  notes?: string;
}

export function useProductsCart() {
  const cart = ref<CartItemState[]>([]);
  const orderLists = ref<Record<string, CartItemState[]>>({});

  const cartItemsCount = computed(() =>
    cart.value.reduce((sum, item) => sum + item.quantity, 0)
  );

  const cartTotal = computed(() =>
    cart.value.reduce(
      (total, item) => total + item.quantity * (item.unit_price ?? 0),
      0
    )
  );

  const addToCart = (
    product: ProductWithStock,
    quantity = 1,
    supplierId?: string
  ) => {
    const existingItem = cart.value.find(
      item =>
        item.product_id === product.id &&
        (!supplierId || item.supplier_id === supplierId)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      return;
    }

    cart.value.push({
      product_id: product.id,
      product,
      quantity,
      unit_price: product.unitPrice ?? null,
      supplier_id: supplierId ?? product.supplierId ?? null,
    });
  };

  const removeFromCart = (productId: string, supplierId?: string) => {
    cart.value = cart.value.filter(
      item =>
        !(
          item.product_id === productId &&
          (!supplierId || item.supplier_id === supplierId)
        )
    );
  };

  const updateCartItemQuantity = (
    productId: string,
    quantity: number,
    supplierId?: string
  ) => {
    const item = cart.value.find(
      cartItem =>
        cartItem.product_id === productId &&
        (!supplierId || cartItem.supplier_id === supplierId)
    );

    if (item) {
      item.quantity = quantity;
    }
  };

  const clearCart = () => {
    cart.value = [];
  };

  const addToOrderList = (
    listId: string,
    product: ProductWithStock,
    quantity: number,
    supplierId?: string
  ) => {
    if (!orderLists.value[listId]) {
      orderLists.value[listId] = [];
    }

    orderLists.value[listId].push({
      product_id: product.id,
      product,
      quantity,
      unit_price: product.unitPrice ?? null,
      supplier_id: supplierId ?? product.supplierId ?? null,
    });
  };

  const removeFromOrderList = (listId: string, productId: string) => {
    if (!orderLists.value[listId]) {
      return;
    }

    orderLists.value[listId] = orderLists.value[listId].filter(
      item => item.product_id !== productId
    );
  };

  const clearOrderLists = () => {
    orderLists.value = {};
  };

  return {
    cart,
    orderLists,
    cartItemsCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToOrderList,
    removeFromOrderList,
    clearOrderLists,
  };
}
