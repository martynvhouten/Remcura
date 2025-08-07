import { ref, computed } from 'vue';
import { productLogger } from '@/utils/logger';
import type {
  CartItem,
  OrderListCart,
  ProductWithStock,
} from '@/types/inventory';

export function useProductsCart() {
  // State
  const cart = ref<CartItem[]>([]);
  const orderLists = ref<OrderListCart[]>([]);

  // Getters
  const cartItemsCount = computed(() => {
    return cart.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  const cartTotal = computed(() => {
    return cart.value.reduce((sum, item) => {
      return sum + item.unit_price * item.quantity;
    }, 0);
  });

  // Cart management actions
  const addToCart = (
    product: ProductWithStock,
    quantity: number = 1,
    supplierId?: string
  ) => {
    const existingItemIndex = cart.value.findIndex(
      item =>
        item.product_id === product.id &&
        (!supplierId || item.supplier_id === supplierId)
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.value[existingItemIndex].quantity += quantity;
      cart.value[existingItemIndex].total_price =
        cart.value[existingItemIndex].quantity *
        cart.value[existingItemIndex].unit_price;
    } else {
      // Add new item
      const cartItem: CartItem = {
        id: `${product.id}-${supplierId || 'default'}-${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        supplier_id: supplierId,
        quantity,
        unit_price: product.unit_price || 0,
        total_price: (product.unit_price || 0) * quantity,
        minimum_order_quantity: product.minimum_order_quantity || 1,
        maximum_order_quantity: product.maximum_order_quantity,
        category: product.category,
        unit_of_measure: product.unit_of_measure || 'piece',
        added_at: new Date().toISOString(),
      };
      cart.value.push(cartItem);
    }

    productLogger.info(`Added ${quantity} of ${product.name} to cart`);
  };

  const removeFromCart = (productId: string, supplierId?: string) => {
    const itemIndex = cart.value.findIndex(
      item =>
        item.product_id === productId &&
        (!supplierId || item.supplier_id === supplierId)
    );

    if (itemIndex >= 0) {
      const removedItem = cart.value.splice(itemIndex, 1)[0];
      productLogger.info(`Removed ${removedItem.product_name} from cart`);
    }
  };

  const updateCartItemQuantity = (
    productId: string,
    quantity: number,
    supplierId?: string
  ) => {
    const item = cart.value.find(
      item =>
        item.product_id === productId &&
        (!supplierId || item.supplier_id === supplierId)
    );

    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId, supplierId);
      } else {
        item.quantity = quantity;
        item.total_price = item.unit_price * quantity;
        productLogger.info(
          `Updated ${item.product_name} quantity to ${quantity}`
        );
      }
    }
  };

  const clearCart = () => {
    cart.value = [];
    productLogger.info('Cart cleared');
  };

  // Order list management
  const addToOrderList = (
    product: ProductWithStock,
    quantity: number,
    supplierId?: string
  ) => {
    // Find or create order list for the supplier
    let orderList = orderLists.value.find(ol => ol.supplier_id === supplierId);

    if (!orderList) {
      orderList = {
        id: `temp-${Date.now()}`,
        supplier_id: supplierId || 'no-supplier',
        supplier_name: product.supplier_name || 'Unknown Supplier',
        items: [],
        total_items: 0,
        estimated_total: 0,
        created_at: new Date().toISOString(),
        status: 'draft' as const,
      };
      orderLists.value.push(orderList);
    }

    // Check if product already exists in the order list
    const existingItemIndex = orderList.items.findIndex(
      item => item.product_id === product.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      orderList.items[existingItemIndex].quantity += quantity;
      orderList.items[existingItemIndex].total_price =
        orderList.items[existingItemIndex].quantity *
        orderList.items[existingItemIndex].unit_price;
    } else {
      // Add new item
      const orderItem: CartItem = {
        id: `${product.id}-${supplierId || 'default'}-${Date.now()}`,
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        supplier_id: supplierId,
        quantity,
        unit_price: product.unit_price || 0,
        total_price: (product.unit_price || 0) * quantity,
        minimum_order_quantity: product.minimum_order_quantity || 1,
        maximum_order_quantity: product.maximum_order_quantity,
        category: product.category,
        unit_of_measure: product.unit_of_measure || 'piece',
        added_at: new Date().toISOString(),
      };
      orderList.items.push(orderItem);
    }

    // Update order list totals
    orderList.total_items = orderList.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    orderList.estimated_total = orderList.items.reduce(
      (sum, item) => sum + item.total_price,
      0
    );

    productLogger.info(
      `Added ${quantity} of ${product.name} to order list for ${orderList.supplier_name}`
    );
  };

  const removeFromOrderList = (orderListId: string, productId: string) => {
    const orderList = orderLists.value.find(ol => ol.id === orderListId);
    if (orderList) {
      const itemIndex = orderList.items.findIndex(
        item => item.product_id === productId
      );
      if (itemIndex >= 0) {
        const removedItem = orderList.items.splice(itemIndex, 1)[0];

        // Update totals
        orderList.total_items = orderList.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        orderList.estimated_total = orderList.items.reduce(
          (sum, item) => sum + item.total_price,
          0
        );

        productLogger.info(
          `Removed ${removedItem.product_name} from order list`
        );

        // Remove empty order lists
        if (orderList.items.length === 0) {
          const orderListIndex = orderLists.value.findIndex(
            ol => ol.id === orderListId
          );
          if (orderListIndex >= 0) {
            orderLists.value.splice(orderListIndex, 1);
          }
        }
      }
    }
  };

  const clearOrderLists = () => {
    orderLists.value = [];
    productLogger.info('Order lists cleared');
  };

  return {
    // State
    cart,
    orderLists,

    // Getters
    cartItemsCount,
    cartTotal,

    // Cart actions
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,

    // Order list actions
    addToOrderList,
    removeFromOrderList,
    clearOrderLists,
  };
}
