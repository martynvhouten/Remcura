import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { orderLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';
import type { OrderListWithItems } from '@/types/stores';
import type { ReorderSuggestion } from './orderLists-minmax';

export interface SupplierOrder {
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  items: OrderItemForSupplier[];
  total_items: number;
  total_value: number;
  estimated_delivery_date: string;
  order_method: 'email' | 'api' | 'pdf' | 'manual';
  minimum_order_amount: number;
  shipping_cost: number;
  free_shipping_threshold: number;
  payment_terms: number;
  lead_time_days: number;
}

export interface OrderItemForSupplier {
  product_id: string;
  product_name: string;
  product_sku: string;
  supplier_sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  minimum_order_quantity: number;
  order_multiple: number;
  urgency_level: string;
  notes?: string;
}

export interface SplitOrderResult {
  supplier_orders: SupplierOrder[];
  items_without_supplier: OrderItemForSupplier[];
  total_suppliers: number;
  total_estimated_cost: number;
  earliest_delivery_date: string;
  latest_delivery_date: string;
  shipping_optimization_suggestions: string[];
}

export interface OrderSendingResult {
  supplier_id: string;
  supplier_name: string;
  status: 'success' | 'failed' | 'pending';
  method_used: string;
  order_reference?: string;
  tracking_info?: any;
  error_message?: string;
  sent_at?: string;
  delivery_expected?: string;
}

export function useOrderListsSupplierSplitting() {
  // Event emitter for store communication
  const eventEmitter = createEventEmitter('order-lists-supplier-splitting');

  // State
  const splittingProgress = ref<{
    current: number;
    total: number;
    status: string;
  } | null>(null);
  const sendingProgress = ref<{
    current: number;
    total: number;
    status: string;
  } | null>(null);

  // Actions
  const splitOrderBySuppliers = async (
    items: ReorderSuggestion[]
  ): Promise<SplitOrderResult> => {
    splittingProgress.value = {
      current: 0,
      total: items.length,
      status: 'Analyzing items...',
    };

    try {
      orderLogger.info(`Starting supplier splitting for ${items.length} items`);

      // Get all suppliers involved
      const supplierIds = [
        ...new Set(
          items.map(item => item.preferred_supplier_name).filter(Boolean)
        ),
      ];

      splittingProgress.value = {
        current: 10,
        total: 100,
        status: 'Fetching supplier details...',
      };

      // Fetch full supplier details
      const { data: suppliers, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*')
        .in('name', supplierIds);

      if (suppliersError) throw suppliersError;

      splittingProgress.value = {
        current: 30,
        total: 100,
        status: 'Fetching supplier products...',
      };

      // Fetch supplier-specific product details
      const productIds = items.map(item => item.product_id);
      const { data: supplierProducts, error: supplierProductsError } =
        await supabase
          .from('supplier_products')
          .select(
            `
          *,
          supplier:suppliers(id, name, code, order_method, minimum_order_amount, shipping_cost, free_shipping_threshold, payment_terms),
          product:products(id, name, sku)
        `
          )
          .in('product_id', productIds);

      if (supplierProductsError) throw supplierProductsError;

      splittingProgress.value = {
        current: 50,
        total: 100,
        status: 'Creating supplier orders...',
      };

      const supplierOrdersMap = new Map<string, SupplierOrder>();
      const itemsWithoutSupplier: OrderItemForSupplier[] = [];

      // Process each item
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        splittingProgress.value = {
          current: 50 + (i / items.length) * 40,
          total: 100,
          status: `Processing ${item.product_name}...`,
        };

        // Find supplier product details
        const supplierProduct = supplierProducts?.find(
          sp =>
            sp.product_id === item.product_id &&
            sp.supplier?.name === item.preferred_supplier_name
        );

        if (!supplierProduct || !supplierProduct.supplier) {
          // Item has no supplier assignment
          itemsWithoutSupplier.push({
            product_id: item.product_id,
            product_name: item.product_name,
            product_sku: item.product_sku,
            supplier_sku: '',
            quantity: item.calculated_order_quantity,
            unit_price: item.preferred_unit_price || 0,
            total_price:
              item.calculated_order_quantity * (item.preferred_unit_price || 0),
            minimum_order_quantity: 1,
            order_multiple: 1,
            urgency_level: item.urgency_level,
            notes: 'No supplier assigned',
          });
          continue;
        }

        const supplier = supplierProduct.supplier;
        const supplierId = supplier.id;

        // Initialize supplier order if not exists
        if (!supplierOrdersMap.has(supplierId)) {
          const estimatedDeliveryDate = new Date();
          estimatedDeliveryDate.setDate(
            estimatedDeliveryDate.getDate() +
              (supplierProduct.lead_time_days || 7)
          );

          supplierOrdersMap.set(supplierId, {
            supplier_id: supplierId,
            supplier_name: supplier.name,
            supplier_code: supplier.code,
            items: [],
            total_items: 0,
            total_value: 0,
            estimated_delivery_date: estimatedDeliveryDate
              .toISOString()
              .split('T')[0],
            order_method: supplier.order_method || 'manual',
            minimum_order_amount: supplier.minimum_order_amount || 0,
            shipping_cost: supplier.shipping_cost || 0,
            free_shipping_threshold: supplier.free_shipping_threshold || 0,
            payment_terms: supplier.payment_terms || 30,
            lead_time_days: supplierProduct.lead_time_days || 7,
          });
        }

        const supplierOrder = supplierOrdersMap.get(supplierId)!;

        // Adjust quantity based on supplier constraints
        let adjustedQuantity = item.calculated_order_quantity;

        // Apply minimum order quantity
        if (adjustedQuantity < supplierProduct.minimum_order_quantity) {
          adjustedQuantity = supplierProduct.minimum_order_quantity;
        }

        // Apply order multiple
        if (supplierProduct.order_multiple > 1) {
          adjustedQuantity =
            Math.ceil(adjustedQuantity / supplierProduct.order_multiple) *
            supplierProduct.order_multiple;
        }

        const orderItem: OrderItemForSupplier = {
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          supplier_sku: supplierProduct.supplier_sku,
          quantity: adjustedQuantity,
          unit_price:
            supplierProduct.cost_price || item.preferred_unit_price || 0,
          total_price:
            adjustedQuantity *
            (supplierProduct.cost_price || item.preferred_unit_price || 0),
          minimum_order_quantity: supplierProduct.minimum_order_quantity || 1,
          order_multiple: supplierProduct.order_multiple || 1,
          urgency_level: item.urgency_level,
          notes:
            adjustedQuantity !== item.calculated_order_quantity
              ? `Adjusted from ${item.calculated_order_quantity} due to supplier constraints`
              : undefined,
        };

        supplierOrder.items.push(orderItem);
        supplierOrder.total_items++;
        supplierOrder.total_value += orderItem.total_price;
      }

      splittingProgress.value = {
        current: 90,
        total: 100,
        status: 'Optimizing orders...',
      };

      // Convert map to array and optimize
      const supplierOrders = Array.from(supplierOrdersMap.values());

      // Generate shipping optimization suggestions
      const shippingOptimizations: string[] = [];

      supplierOrders.forEach(order => {
        if (
          order.total_value < order.minimum_order_amount &&
          order.minimum_order_amount > 0
        ) {
          shippingOptimizations.push(
            `${order.supplier_name}: Add €${(
              order.minimum_order_amount - order.total_value
            ).toFixed(2)} to reach minimum order amount`
          );
        }

        if (
          order.total_value < order.free_shipping_threshold &&
          order.free_shipping_threshold > 0
        ) {
          const needed = order.free_shipping_threshold - order.total_value;
          shippingOptimizations.push(
            `${order.supplier_name}: Add €${needed.toFixed(
              2
            )} to qualify for free shipping (save €${order.shipping_cost})`
          );
        }
      });

      // Calculate delivery date range
      const deliveryDates = supplierOrders.map(
        order => new Date(order.estimated_delivery_date)
      );
      const earliestDelivery = new Date(
        Math.min(...deliveryDates.map(d => d.getTime()))
      );
      const latestDelivery = new Date(
        Math.max(...deliveryDates.map(d => d.getTime()))
      );

      const result: SplitOrderResult = {
        supplier_orders: supplierOrders,
        items_without_supplier: itemsWithoutSupplier,
        total_suppliers: supplierOrders.length,
        total_estimated_cost: supplierOrders.reduce(
          (sum, order) => sum + order.total_value,
          0
        ),
        earliest_delivery_date: earliestDelivery.toISOString().split('T')[0],
        latest_delivery_date: latestDelivery.toISOString().split('T')[0],
        shipping_optimization_suggestions: shippingOptimizations,
      };

      splittingProgress.value = {
        current: 100,
        total: 100,
        status: 'Complete!',
      };

      orderLogger.info(
        `✅ Successfully split order into ${supplierOrders.length} supplier orders`
      );

      // Emit event
      await eventEmitter.emit(StoreEvents.ORDER_SPLIT_COMPLETED, {
        supplierCount: supplierOrders.length,
        totalItems: items.length,
        totalCost: result.total_estimated_cost,
        optimizations: shippingOptimizations.length,
        timestamp: new Date().toISOString(),
      });

      // Clear progress after short delay
      setTimeout(() => {
        splittingProgress.value = null;
      }, 2000);

      return result;
    } catch (error) {
      splittingProgress.value = null;
      orderLogger.error('Error splitting order by suppliers:', error);
      throw error;
    }
  };

  const sendOrdersToSuppliers = async (
    supplierOrders: SupplierOrder[]
  ): Promise<OrderSendingResult[]> => {
    sendingProgress.value = {
      current: 0,
      total: supplierOrders.length,
      status: 'Preparing to send orders...',
    };

    const results: OrderSendingResult[] = [];

    try {
      for (let i = 0; i < supplierOrders.length; i++) {
        const order = supplierOrders[i];
        sendingProgress.value = {
          current: i,
          total: supplierOrders.length,
          status: `Sending order to ${order.supplier_name}...`,
        };

        try {
          const result = await sendOrderToSupplier(order);
          results.push(result);

          orderLogger.info(
            `✅ Successfully sent order to ${order.supplier_name} via ${result.method_used}`
          );
        } catch (error) {
          const failedResult: OrderSendingResult = {
            supplier_id: order.supplier_id,
            supplier_name: order.supplier_name,
            status: 'failed',
            method_used: order.order_method,
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
          };
          results.push(failedResult);

          orderLogger.error(
            `❌ Failed to send order to ${order.supplier_name}:`,
            error
          );
        }

        // Small delay between sends to avoid overwhelming APIs
        if (i < supplierOrders.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      sendingProgress.value = {
        current: supplierOrders.length,
        total: supplierOrders.length,
        status: 'All orders processed!',
      };

      // Emit completion event
      await eventEmitter.emit(StoreEvents.ORDERS_SENT_TO_SUPPLIERS, {
        totalOrders: supplierOrders.length,
        successCount: results.filter(r => r.status === 'success').length,
        failedCount: results.filter(r => r.status === 'failed').length,
        timestamp: new Date().toISOString(),
      });

      // Clear progress after delay
      setTimeout(() => {
        sendingProgress.value = null;
      }, 3000);

      return results;
    } catch (error) {
      sendingProgress.value = null;
      orderLogger.error('Error sending orders to suppliers:', error);
      throw error;
    }
  };

  const sendOrderToSupplier = async (
    order: SupplierOrder
  ): Promise<OrderSendingResult> => {
    const orderReference = `ORD-${Date.now()}-${order.supplier_code}`;

    switch (order.order_method) {
      case 'api':
        return await sendOrderViaAPI(order, orderReference);

      case 'email':
        return await sendOrderViaEmail(order, orderReference);

      case 'pdf':
        return await sendOrderViaPDF(order, orderReference);

      case 'edi':
        return await sendOrderViaEDI(order, orderReference);

      default:
        return {
          supplier_id: order.supplier_id,
          supplier_name: order.supplier_name,
          status: 'pending',
          method_used: 'manual',
          order_reference: orderReference,
          sent_at: new Date().toISOString(),
        };
    }
  };

  const sendOrderViaAPI = async (
    order: SupplierOrder,
    orderReference: string
  ): Promise<OrderSendingResult> => {
    const { apiService } = await import(
      '@/services/supplierIntegration/apiService'
    );
    return apiService.sendOrderViaAPI(order, orderReference);
  };

  const sendOrderViaEmail = async (
    order: SupplierOrder,
    orderReference: string
  ): Promise<OrderSendingResult> => {
    // For email orders, we use the PDF service which sends via email
    const { pdfService } = await import(
      '@/services/supplierIntegration/pdfService'
    );
    return pdfService.sendOrderViaPDF(order, orderReference);
  };

  const sendOrderViaPDF = async (
    order: SupplierOrder,
    orderReference: string
  ): Promise<OrderSendingResult> => {
    const { pdfService } = await import(
      '@/services/supplierIntegration/pdfService'
    );
    return pdfService.sendOrderViaPDF(order, orderReference);
  };

  const sendOrderViaEDI = async (
    order: SupplierOrder,
    orderReference: string
  ): Promise<OrderSendingResult> => {
    const { ediService } = await import(
      '@/services/supplierIntegration/ediService'
    );
    return ediService.sendOrderViaEDI(order, orderReference);
  };

  // Helper functions - removed as they are now handled by dedicated services

  return {
    // State
    splittingProgress,
    sendingProgress,

    // Actions
    splitOrderBySuppliers,
    sendOrdersToSuppliers,
    sendOrderToSupplier,
  };
}
