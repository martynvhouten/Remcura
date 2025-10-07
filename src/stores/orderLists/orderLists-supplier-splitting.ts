import { ref } from 'vue';
import { supabase } from '@/boot/supabase';
import { createLogger } from '@/utils/logger';
import { createEventEmitter, StoreEvents } from '@/utils/eventBus';
import type { ReorderSuggestion } from './orderLists-minmax';
import type { UrgencyLevel } from '@/types/inventory';

const normalizeUrgency = (value: string | null | undefined): UrgencyLevel => {
  switch (value) {
    case 'critical':
    case 'high':
    case 'medium':
    case 'low':
      return value;
    default:
      return 'low';
  }
};

export interface SupplierOrder {
  practice_id: string;
  location_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  items: OrderItemForSupplier[];
  total_items: number;
  total_cost: number;
  estimated_delivery_date: string;
  earliest_delivery_date: string;
  latest_delivery_date: string;
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
  minimum_order_quantity: number | null;
  order_multiple: number | null;
  urgency_level: UrgencyLevel;
  notes?: string | null;
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
  tracking_info?: Record<string, unknown>;
  error_message?: string;
  sent_at?: string;
  delivery_expected?: string;
}

const supplierLog = createLogger('SupplierSplit');
const infoLog = (message: string, data?: Record<string, unknown>): void =>
  data ? supplierLog.structured(message, data) : supplierLog.info(message);
const warnLog = (message: string, data?: Record<string, unknown>): void =>
  data ? supplierLog.structured(message, data) : supplierLog.warn(message);
const errorLog = (message: string, data?: Record<string, unknown>): void =>
  data ? supplierLog.structured(message, data) : supplierLog.error(message);

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
      infoLog('Starting supplier splitting', {
        itemCount: items.length,
      });

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
      const { error: suppliersError } = await supabase
        .from('suppliers')
        .select('id')
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
        if (!item) {
          continue;
        }
        splittingProgress.value = {
          current: 50 + (i / items.length) * 40,
          total: 100,
          status: `Processing ${item.product_name}...`,
        };

        // Find supplier product details
        const supplierProduct = (supplierProducts ?? []).find(
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
            unit_price: item.preferred_unit_price ?? 0,
            total_price:
              item.calculated_order_quantity * (item.preferred_unit_price ?? 0),
            minimum_order_quantity: 1,
            order_multiple: 1,
            urgency_level: normalizeUrgency(item.urgency_level),
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
              (supplierProduct.lead_time_days ?? 7)
          );

          supplierOrdersMap.set(supplierId, {
            practice_id: item.practice_id,
            location_id: item.location_id ?? '',
            supplier_id: supplierId,
            supplier_name: supplier.name,
            supplier_code: supplier.code ?? supplierId,
            items: [],
            total_items: 0,
            total_cost: 0,
            estimated_delivery_date:
              estimatedDeliveryDate.toISOString().split('T')[0] ?? '',
            earliest_delivery_date:
              estimatedDeliveryDate.toISOString().split('T')[0] ?? '',
            latest_delivery_date:
              estimatedDeliveryDate.toISOString().split('T')[0] ?? '',
            order_method:
              (supplier.order_method as SupplierOrder['order_method']) ??
              'manual',
            minimum_order_amount: supplier.minimum_order_amount ?? 0,
            shipping_cost: supplier.shipping_cost ?? 0,
            free_shipping_threshold: supplier.free_shipping_threshold ?? 0,
            payment_terms: supplier.payment_terms ?? 30,
            lead_time_days: supplierProduct.lead_time_days ?? 7,
          });
        }

        const supplierOrder = supplierOrdersMap.get(supplierId);
        if (!supplierOrder) {
          warnLog('Supplier order missing after initialization', {
            supplierId,
          });
          continue;
        }

        const earliestDate = new Date();
        earliestDate.setDate(
          earliestDate.getDate() + (supplierProduct.lead_time_days ?? 7)
        );

        const latestDate = new Date(earliestDate);
        latestDate.setDate(latestDate.getDate() + 3);

        supplierOrder.earliest_delivery_date = (earliestDate
          .toISOString()
          .split('T')[0] ?? '') as string;

        supplierOrder.latest_delivery_date = (latestDate
          .toISOString()
          .split('T')[0] ?? '') as string;

        // Adjust quantity based on supplier constraints
        let adjustedQuantity = item.calculated_order_quantity;

        // Apply minimum order quantity
        if (
          supplierProduct.minimum_order_quantity !== null &&
          supplierProduct.minimum_order_quantity !== undefined &&
          adjustedQuantity < supplierProduct.minimum_order_quantity
        ) {
          adjustedQuantity = supplierProduct.minimum_order_quantity;
        }

        // Apply order multiple
        if (
          supplierProduct.order_multiple !== null &&
          supplierProduct.order_multiple !== undefined &&
          supplierProduct.order_multiple > 1
        ) {
          adjustedQuantity =
            Math.ceil(adjustedQuantity / supplierProduct.order_multiple) *
            supplierProduct.order_multiple;
        }

        const orderItem: OrderItemForSupplier = {
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          supplier_sku: supplierProduct.supplier_sku || '',
          quantity: adjustedQuantity,
          unit_price:
            supplierProduct.cost_price ?? item.preferred_unit_price ?? 0,
          total_price:
            adjustedQuantity *
            (supplierProduct.cost_price ?? item.preferred_unit_price ?? 0),
          minimum_order_quantity: supplierProduct.minimum_order_quantity ?? 1,
          order_multiple: supplierProduct.order_multiple ?? 1,
          urgency_level: normalizeUrgency(item.urgency_level),
          notes:
            adjustedQuantity !== item.calculated_order_quantity
              ? `Adjusted from ${item.calculated_order_quantity} due to supplier constraints`
              : null,
        } satisfies OrderItemForSupplier;

        supplierOrder.items.push(orderItem);
        supplierOrder.total_items += 1;
        supplierOrder.total_cost += orderItem.total_price;
      }

      splittingProgress.value = {
        current: 90,
        total: 100,
        status: 'Optimizing orders...',
      };

      // Convert map to array and optimize
      const supplierOrders = Array.from(supplierOrdersMap.values());
      const totalCost = supplierOrders.reduce(
        (sum, order) => sum + order.total_cost,
        0
      );

      const deliveryTimes = supplierOrders
        .map(order => Date.parse(order.estimated_delivery_date))
        .filter(time => Number.isFinite(time));

      const fallbackDate = (new Date().toISOString().split('T')[0] ??
        '') as string;
      const earliestDelivery = deliveryTimes.length
        ? ((new Date(Math.min(...deliveryTimes)).toISOString().split('T')[0] ??
            '') as string)
        : fallbackDate;

      const latestDelivery = deliveryTimes.length
        ? ((new Date(Math.max(...deliveryTimes)).toISOString().split('T')[0] ??
            '') as string)
        : fallbackDate;

      infoLog('Supplier splitting completed', {
        supplierCount: supplierOrders.length,
        withoutSupplier: itemsWithoutSupplier.length,
        totalCost,
        earliestDelivery,
        latestDelivery,
      });

      return {
        supplier_orders: supplierOrders,
        items_without_supplier: itemsWithoutSupplier,
        total_suppliers: supplierOrders.length,
        total_estimated_cost: totalCost,
        earliest_delivery_date: earliestDelivery,
        latest_delivery_date: latestDelivery,
        shipping_optimization_suggestions: [],
      };
    } catch (error) {
      splittingProgress.value = null;
      errorLog('Error splitting order by suppliers', {
        error: error instanceof Error ? error.message : String(error),
      });
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
        if (!order) {
          continue;
        }
        sendingProgress.value = {
          current: i,
          total: supplierOrders.length,
          status: `Sending order to ${order.supplier_name}...`,
        };

        try {
          const result = await sendOrderToSupplier(order);
          results.push(result);

          infoLog('Order sent to supplier', {
            supplier: order.supplier_name,
            method: result.method_used,
          });
        } catch (error) {
          const failedResult: OrderSendingResult = {
            supplier_id: order.supplier_id,
            supplier_name: order.supplier_name,
            status: 'failed',
            method_used: order.order_method,
            error_message:
              error instanceof Error ? error.message : 'Unknown error',
            sent_at: new Date().toISOString(),
            delivery_expected: order.estimated_delivery_date,
          };
          results.push(failedResult);

          errorLog('Failed to send order to supplier', {
            supplier: order.supplier_name,
            error: error instanceof Error ? error.message : String(error),
          });
        }

        if (i < supplierOrders.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      sendingProgress.value = {
        current: supplierOrders.length,
        total: supplierOrders.length,
        status: 'All orders processed!',
      };

      const successCount = results.filter(r => r.status === 'success').length;
      const failedCount = results.filter(r => r.status === 'failed').length;

      await eventEmitter.emit(StoreEvents.ORDERS_SENT_TO_SUPPLIERS, {
        totalOrders: supplierOrders.length,
        successCount,
        failedCount,
        timestamp: new Date().toISOString(),
      });

      setTimeout(() => {
        sendingProgress.value = null;
      }, 3000);

      return results;
    } catch (error) {
      sendingProgress.value = null;
      errorLog('Error sending orders to suppliers', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const sendOrderToSupplier = async (
    order: SupplierOrder
  ): Promise<OrderSendingResult> => {
    const orderReference = `ORD-${Date.now()}-${order.supplier_code}`;

    switch (order.order_method) {
      case 'api':
        return sendOrderViaAPI(order, orderReference);
      case 'email':
        return sendOrderViaEmail(order, orderReference);
      case 'pdf':
        return sendOrderViaPDF(order, orderReference);
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
