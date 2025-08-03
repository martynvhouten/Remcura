import { ref, computed } from 'vue';
import { supabase } from '@/boot/supabase';
import { inventoryLogger } from '@/utils/logger';
import type { OrderSuggestion, StockAlert } from '@/types/inventory';

export function useInventoryAlerts(stockLevels: Ref<StockLevel[]>) {
  // State
  const orderSuggestions = ref<OrderSuggestion[]>([]);

  // Computed properties
  const criticalAlerts = computed<StockAlert[]>(() => {
    const alerts: StockAlert[] = [];
    
    stockLevels.value.forEach((stockLevel: StockLevel) => {
      // Low stock alerts - using minimum_stock instead of minimum_quantity
      const minimumStock = (stockLevel as any).minimum_stock || (stockLevel as any).minimum_quantity || 10;
      if (stockLevel.current_quantity <= minimumStock) {
        alerts.push({
          product_id: stockLevel.product_id,
          location_id: stockLevel.location_id,
          type: 'low_stock',
          current_quantity: stockLevel.current_quantity,
          threshold_quantity: minimumStock,
          title: stockLevel.current_quantity === 0 ? 'Out of Stock' : 'Low Stock',
          message: `Current stock: ${stockLevel.current_quantity}, Minimum: ${minimumStock}`,
          created_at: new Date().toISOString()
        });
      }

      // Negative stock alerts (if allowed)
      if (stockLevel.current_quantity < 0) {
        alerts.push({
          product_id: stockLevel.product_id,
          location_id: stockLevel.location_id,
          type: 'out_of_stock',
          current_quantity: stockLevel.current_quantity,
          threshold_quantity: 0,
          title: 'Negative Stock',
          message: `Stock level is below zero: ${stockLevel.current_quantity}`,
          created_at: new Date().toISOString()
        });
      }
    });

    return alerts.sort((a, b) => {
      // Sort by severity: out_of_stock first, then low_stock
          if (a.type === 'out_of_stock' && b.type !== 'out_of_stock') { return -1; }
    if (b.type === 'out_of_stock' && a.type !== 'out_of_stock') { return 1; }
      return 0;
    });
  });

  const fetchOrderSuggestions = async (practiceId: string) => {
    try {
      // Use RPC function to get order suggestions based on current stock levels
      const { data, error } = await supabase.rpc('get_order_advice', {
        practice_uuid: practiceId,
      });

      if (error) throw error;

      orderSuggestions.value = (data || []).map((item: StockLevel) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_sku: item.product_sku,
        location_id: item.location_id || '',
        location_name: item.location_name || 'Main Location',
        current_stock: item.current_stock,
        minimum_stock: item.minimum_stock,
        suggested_quantity: item.suggested_quantity,
        preferred_supplier_id: item.preferred_supplier_id || null,
        supplier_name: item.supplier_name,
        urgency_level: item.urgency_level,
        days_until_stockout: item.days_until_stockout || 0,
      }));
    } catch (error) {
      inventoryLogger.error('Error fetching order suggestions:', error);
      throw error;
    }
  };

  const getProductStockAtLocation = (productId: string, locationId: string): number => {
    const stockLevel = stockLevels.value.find((sl: StockLevel) => 
      sl.product_id === productId && sl.location_id === locationId
    );
    return stockLevel?.current_quantity || 0;
  };

  const getProductBatches = (productId: string, locationId: string) => {
    // This would query product_batches table
    // For now, return empty array as this functionality is handled by the batch store
    return [];
  };

  return {
    // State
    orderSuggestions,

    // Computed
    criticalAlerts,

    // Actions
    fetchOrderSuggestions,
    getProductStockAtLocation,
    getProductBatches,
  };
}