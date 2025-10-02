import { ref, computed, type Ref } from 'vue';
import { supabase } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';
import type {
  OrderSuggestion,
  StockAlert,
  UrgencyLevel,
  StockLevelView,
} from '@/types/inventory';

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

export function useInventoryAlerts(stockLevels: Ref<StockLevelView[]>) {
  // State
  const orderSuggestions = ref<OrderSuggestion[]>([]);

  const criticalAlerts = computed<StockAlert[]>(() => {
    const alerts: StockAlert[] = [];

    stockLevels.value.forEach(stockLevel => {
      const minimumStock = stockLevel.minimumQuantity ?? 0;
      if (stockLevel.currentQuantity <= minimumStock) {
        alerts.push({
          id: `${stockLevel.productId}-${stockLevel.locationId}-low`,
          product_id: stockLevel.productId,
          location_id: stockLevel.locationId ?? '',
          type: 'low_stock',
          current_stock: stockLevel.currentQuantity,
          minimum_stock: minimumStock,
          message:
            stockLevel.currentQuantity === 0 ? 'Out of Stock' : 'Low Stock',
          created_at: new Date().toISOString(),
        });
      }

      if (stockLevel.currentQuantity < 0) {
        alerts.push({
          id: `${stockLevel.productId}-${stockLevel.locationId}-negative`,
          product_id: stockLevel.productId,
          location_id: stockLevel.locationId ?? '',
          type: 'out_of_stock',
          current_stock: stockLevel.currentQuantity,
          minimum_stock: 0,
          message: `Stock level is below zero: ${stockLevel.currentQuantity}`,
          created_at: new Date().toISOString(),
        });
      }
    });

    return alerts.sort((a, b) => {
      if (a.type === 'out_of_stock' && b.type !== 'out_of_stock') {
        return -1;
      }
      if (b.type === 'out_of_stock' && a.type !== 'out_of_stock') {
        return 1;
      }
      return 0;
    });
  });

  const fetchOrderSuggestions = async (practiceId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_order_advice', {
        practice_uuid: practiceId,
      });

      if (error) throw error;

      const locationMap = new Map<string, string>();
      stockLevels.value.forEach(level => {
        const locationId = level.locationId ?? '';
        if (!locationMap.has(locationId)) {
          locationMap.set(locationId, level.locationName ?? 'Main Location');
        }
      });

      const rows = (data ?? []) as Array<{
        product_id: string;
        product_name: string;
        product_sku: string;
        current_stock: number;
        minimum_stock: number;
        suggested_quantity: number;
        urgency_level: string | null;
        location_id?: string | null;
        preferred_supplier_id?: string | null;
        supplier_name?: string | null;
        days_until_stockout?: number | null;
      }>;

      orderSuggestions.value = rows.map(item => {
        const locationId = item.location_id ?? '';
        return {
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          location_id: locationId,
          location_name: locationMap.get(locationId) ?? 'Main Location',
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock,
          suggested_quantity: item.suggested_quantity,
          preferred_supplier_id: item.preferred_supplier_id ?? null,
          supplier_name: item.supplier_name ?? null,
          urgency_level: normalizeUrgency(item.urgency_level),
          days_until_stockout: item.days_until_stockout ?? null,
        } satisfies OrderSuggestion;
      });
    } catch (error) {
      inventoryLogger.error('Error fetching order suggestions:', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  };

  const getProductStockAtLocation = (productId: string, locationId: string) => {
    const stockLevel = stockLevels.value.find(
      sl => sl.productId === productId && (sl.locationId ?? '') === locationId
    );
    return stockLevel?.currentQuantity ?? 0;
  };

  return {
    orderSuggestions,
    criticalAlerts,
    fetchOrderSuggestions,
    getProductStockAtLocation,
  };
}
