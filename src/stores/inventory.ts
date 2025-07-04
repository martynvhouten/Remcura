import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "src/boot/supabase";
import { useAuthStore } from "./auth";
import type {
  StockLevel,
  StockLevelWithDetails,
  StockMovement,
  MovementWithRelations,
  StockUpdateRequest,
  OrderSuggestion,
  StockAlert,
  InventoryKPI,
} from "src/types/inventory";

export const useInventoryStore = defineStore("inventory", () => {
  // State
  const stockLevels = ref<StockLevelWithDetails[]>([]);
  const stockMovements = ref<MovementWithRelations[]>([]);
  const orderSuggestions = ref<OrderSuggestion[]>([]);
  const stockAlerts = ref<StockAlert[]>([]);
  const loading = ref(false);
  const lastSyncAt = ref<Date | null>(null);

  // Auth store
  const authStore = useAuthStore();

  // Getters
  const totalStockValue = computed(() => {
    return stockLevels.value.reduce((total, stock) => {
      return total + stock.current_quantity * (stock.product?.price || 0);
    }, 0);
  });

  const lowStockItems = computed(() => {
    return stockLevels.value.filter(
      (stock) =>
        stock.current_quantity <= stock.minimum_stock && stock.minimum_stock > 0
    );
  });

  const outOfStockItems = computed(() => {
    return stockLevels.value.filter((stock) => stock.current_quantity <= 0);
  });

  const criticalAlerts = computed(() => {
    return stockAlerts.value.filter(
      (alert) => alert.urgency === "critical" || alert.urgency === "high"
    );
  });

  const stockByLocation = computed(() => {
    return stockLevels.value.reduce((acc, stock) => {
      const locationId = stock.location_id;
      if (!acc[locationId]) {
        acc[locationId] = {
          location: stock.location,
          stocks: [],
        };
      }
      acc[locationId].stocks.push(stock);
      return acc;
    }, {} as Record<string, { location: any; stocks: StockLevelWithDetails[] }>);
  });

  // Actions
  const fetchStockLevels = async (practiceId: string) => {
    loading.value = true;
    try {
      const { data, error } = await supabase.rpc("get_stock_overview", {
        p_practice_id: practiceId,
      });

      if (error) throw error;

      // Transform the data to match our interface
      stockLevels.value = data.map((item: any) => ({
        id: `${item.location_id}-${item.product_id}`,
        practice_id: practiceId,
        location_id: item.location_id,
        product_id: item.product_id,
        current_quantity: item.current_quantity,
        reserved_quantity: 0,
        available_quantity: item.current_quantity,
        minimum_stock: item.minimum_stock,
        maximum_stock: item.maximum_stock,
        reorder_point: item.minimum_stock,
        last_counted_at: item.last_counted_at,
        last_movement_at: item.last_movement_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        location: {
          id: item.location_id,
          name: item.location_name,
          practice_id: practiceId,
        },
        product: {
          id: item.product_id,
          name: item.product_name,
          sku: item.product_sku,
        },
      }));

      lastSyncAt.value = new Date();
    } catch (error) {
      console.error("Error fetching stock levels:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  };

  const updateStockLevel = async (request: StockUpdateRequest) => {
    try {
      const { data, error } = await supabase.rpc("update_stock_level", {
        p_practice_id: request.practice_id,
        p_location_id: request.location_id,
        p_product_id: request.product_id,
        p_quantity_change: request.quantity_change,
        p_movement_type: request.movement_type,
        p_performed_by: authStore.user?.id,
        p_reference_type: request.reference_type,
        p_reference_id: request.reference_id,
        p_reason_code: request.reason_code,
        p_notes: request.notes,
      });

      if (error) throw error;

      // Refresh stock levels after update
      await fetchStockLevels(request.practice_id);

      return data;
    } catch (error) {
      console.error("Error updating stock level:", error);
      throw error;
    }
  };

  const fetchOrderSuggestions = async (practiceId: string) => {
    try {
      const { data, error } = await supabase.rpc("generate_order_suggestions", {
        p_practice_id: practiceId,
      });

      if (error) throw error;

      orderSuggestions.value = data || [];
    } catch (error) {
      console.error("Error fetching order suggestions:", error);
      throw error;
    }
  };

  const fetchStockMovements = async (practiceId: string, limit = 50) => {
    try {
      const { data, error } = await supabase
        .from("stock_movements")
        .select(
          `
          *,
          location:practice_locations(name),
          product:products(name, sku)
        `
        )
        .eq("practice_id", practiceId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      stockMovements.value = data || [];
    } catch (error) {
      console.error("Error fetching stock movements:", error);
      throw error;
    }
  };

  const generateStockAlerts = () => {
    const alerts: StockAlert[] = [];
    const now = new Date().toISOString();

    stockLevels.value.forEach((stock) => {
      // Out of stock alerts
      if (stock.current_quantity <= 0) {
        alerts.push({
          type: "out_of_stock",
          urgency: "critical",
          product_id: stock.product_id,
          product_name: stock.product.name,
          product_sku: stock.product.sku,
          location_id: stock.location_id,
          location_name: stock.location.name,
          current_quantity: stock.current_quantity,
          threshold_quantity: 0,
          message: `${stock.product.name} is out of stock in ${stock.location.name}`,
          suggested_action: "Reorder immediately",
          created_at: now,
        });
      }
      // Low stock alerts
      else if (
        stock.current_quantity <= stock.minimum_stock &&
        stock.minimum_stock > 0
      ) {
        const urgency =
          stock.current_quantity <= stock.minimum_stock * 0.5
            ? "high"
            : "medium";
        alerts.push({
          type: "low_stock",
          urgency,
          product_id: stock.product_id,
          product_name: stock.product.name,
          product_sku: stock.product.sku,
          location_id: stock.location_id,
          location_name: stock.location.name,
          current_quantity: stock.current_quantity,
          threshold_quantity: stock.minimum_stock,
          message: `${stock.product.name} is running low in ${stock.location.name}`,
          suggested_action: "Consider reordering",
          created_at: now,
        });
      }
      // Overstock alerts
      else if (
        stock.maximum_stock > 0 &&
        stock.current_quantity > stock.maximum_stock
      ) {
        alerts.push({
          type: "overstock",
          urgency: "low",
          product_id: stock.product_id,
          product_name: stock.product.name,
          product_sku: stock.product.sku,
          location_id: stock.location_id,
          location_name: stock.location.name,
          current_quantity: stock.current_quantity,
          threshold_quantity: stock.maximum_stock,
          message: `${stock.product.name} is overstocked in ${stock.location.name}`,
          suggested_action: "Consider transferring excess stock",
          created_at: now,
        });
      }
    });

    stockAlerts.value = alerts;
  };

  const getInventoryKPIs = async (
    practiceId: string
  ): Promise<InventoryKPI> => {
    try {
      // This would typically be a more complex query or multiple queries
      // For now, we'll calculate from our current data
      const totalSKUs = stockLevels.value.length;
      const lowStock = lowStockItems.value.length;
      const outOfStock = outOfStockItems.value.length;

      return {
        total_sku_count: totalSKUs,
        total_stock_value: totalStockValue.value,
        low_stock_items: lowStock,
        out_of_stock_items: outOfStock,
        stock_turnover_rate: 0, // Would need historical data
        average_days_to_stockout: 30, // Would need consumption rate calculation
        top_moving_products: [], // Would need movement analysis
        stock_accuracy_percentage: 95, // Would come from counting sessions
        last_full_count_date: undefined,
      };
    } catch (error) {
      console.error("Error calculating inventory KPIs:", error);
      throw error;
    }
  };

  const transferStock = async (
    practiceId: string,
    productId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    notes?: string
  ) => {
    try {
      // First, remove stock from source location
      await updateStockLevel({
        practice_id: practiceId,
        location_id: fromLocationId,
        product_id: productId,
        quantity_change: -quantity,
        movement_type: "transfer",
        reason_code: "transfer_out",
        notes: `Transfer to ${toLocationId}: ${notes || ""}`,
      });

      // Then, add stock to destination location
      await updateStockLevel({
        practice_id: practiceId,
        location_id: toLocationId,
        product_id: productId,
        quantity_change: quantity,
        movement_type: "transfer",
        reason_code: "transfer_in",
        notes: `Transfer from ${fromLocationId}: ${notes || ""}`,
      });

      return { success: true };
    } catch (error) {
      console.error("Error transferring stock:", error);
      throw error;
    }
  };

  const refreshData = async (practiceId: string) => {
    await Promise.all([
      fetchStockLevels(practiceId),
      fetchOrderSuggestions(practiceId),
      fetchStockMovements(practiceId),
    ]);
    generateStockAlerts();
  };

  return {
    // State
    stockLevels,
    stockMovements,
    orderSuggestions,
    stockAlerts,
    loading,
    lastSyncAt,

    // Getters
    totalStockValue,
    lowStockItems,
    outOfStockItems,
    criticalAlerts,
    stockByLocation,

    // Actions
    fetchStockLevels,
    updateStockLevel,
    fetchOrderSuggestions,
    fetchStockMovements,
    generateStockAlerts,
    getInventoryKPIs,
    transferStock,
    refreshData,
  };
});
