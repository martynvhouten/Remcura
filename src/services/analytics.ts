// @ts-nocheck
/** @deprecated Use analytics-vm.ts */
import { supabase } from '@/boot/supabase';
import { useAuthStore } from '@/stores/auth';
import { analyticsLogger } from '@/utils/logger';
import { handleSupabaseError } from '@/utils/service-error-handler';
import { t } from '@/utils/i18n-service';
import type {
  AnalyticsDateRange,
  AnalyticsSummary,
  OrderMetrics,
  ProductMetrics,
  UserActivityMetrics,
  AnalyticsStockLevelDTO,
  LowStockItemDTO,
  StockTurnoverRateDTO,
  TopUsedProductDTO,
} from '@/types/analytics';
import type { UsageAnalytics } from '@/types/analytics';
import { mapProductRow, mapStockLevelRow } from '@/domain/inventory/bridge';
import type { ProductDTO, StockLevelDTO } from '@/domain/inventory/dto';
import type { Tables } from '@/types/supabase.generated';

// Legacy compatibility types
interface LegacyStockLevel {
  product_id: string;
  location_id: string;
  current_quantity: number;
  minimum_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  product_name?: string;
  location_name?: string;
  preferred_supplier_id?: string | null;
  updated_at?: string | null;
}

interface LegacyLowStockProduct {
  id: string;
  name: string;
  stock_levels: LegacyStockLevel[];
  sku?: string | null;
  unit_price?: number | null;
}

interface LegacyStockLevelWithMovements extends LegacyStockLevel {
  stock_movements: StockMovementRow[] | StockMovementRow | null;
}

interface LegacyUsageAnalytics {
  user_id: string | null;
  session_id: string | null;
  created_at: string;
}

const toLegacyStockLevel = (dto: StockLevelDTO): LegacyStockLevel => ({
  product_id: dto.productId,
  location_id: dto.locationId,
  current_quantity: dto.currentQuantity ?? 0,
  minimum_quantity: dto.minimumQuantity ?? 0,
  reserved_quantity: dto.reservedQuantity ?? 0,
  available_quantity: dto.availableQuantity ?? 0,
  product_name: dto.productName ?? undefined,
  location_name: dto.locationName ?? undefined,
  preferred_supplier_id: dto.preferredSupplierId ?? null,
  updated_at: dto.updatedAt ?? null,
});

const toLegacyLowStockProduct = (
  productRow: Tables<'products'>,
  stockLevels: StockLevelDTO[]
): LegacyLowStockProduct => ({
  id: productRow.id,
  name: productRow.name ?? 'Unknown product',
  stock_levels: stockLevels.map(toLegacyStockLevel),
  sku: productRow.sku ?? null,
  unit_price: productRow.price ?? null,
});

const toLegacyStockLevelWithMovements = (
  row: Tables<'stock_levels'> & {
    stock_movements: StockMovementRow[] | StockMovementRow | null;
    products?: Tables<'products'> | null;
  }
): LegacyStockLevelWithMovements => {
  const dto = mapStockLevelRow(row);
  const base = toLegacyStockLevel(dto);
  const product = row.products ?? null;
  return {
    ...base,
    product_name: base.product_name ?? product?.name ?? undefined,
    stock_movements: row.stock_movements ?? null,
  };
};

const toLegacyUsageAnalytics = (
  event: UsageAnalytics
): LegacyUsageAnalytics => ({
  user_id: event.userId,
  session_id: event.sessionId,
  created_at: event.createdAt,
});

const toLegacyStockEntry = (
  entry: Tables<'stock_entries'> & { products?: Tables<'products'> | null }
) => ({
  ...entry,
  counted_quantity: entry.counted_quantity,
  counted_at: entry.counted_at,
  created_at: entry.created_at,
  products: entry.products ?? null,
});

interface LowStockItem extends LowStockItemDTO {}

interface StockTurnoverRate extends StockTurnoverRateDTO {}

type MonthlyUsageTrends = Record<string, number>;

interface TopUsedProduct extends TopUsedProductDTO {}

interface CostSavingsAnalytics {
  total_savings: number;
  waste_reduction: number;
  efficiency_improvement: number;
  cost_per_unit_improvement: number;
}

interface InventoryValueTrends {
  current_value: number;
  trend_data: Array<{ date: string; value: number }>;
}

interface PredictedStockNeed {
  productId: string;
  productName: string;
  currentStock: number;
  predictedUsage: number;
  suggestedOrder: number;
}

interface ForecastAccuracy {
  overall_accuracy: number;
  category_accuracy: Record<string, number>;
  trend: 'improving' | 'stable' | 'needs_attention' | 'insufficient_data';
}

interface StockMovementRow {
  movement_type: string;
  quantity: number | null;
  products?: {
    price?: number | null;
    category?: string | null;
  } | null;
}

type StockLevelWithMovementsRow = StockLevelView & {
  stock_movements: StockMovementRow[] | StockMovementRow | null;
};

interface StockEntryRow {
  stockLevel: StockLevelView;
  countedQuantity: number;
  recordedAt: string;
}

interface InventoryProductRow {
  id: string;
  name: string;
  stock_levels: StockLevelView[] | null;
}

type JsonRecord = Record<string, unknown>;

const toArray = <T>(value: T | T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : value ? [value] : [];

const mapStockLevelToAnalyticsDTO = (
  entry: StockLevelView
): AnalyticsStockLevelDTO => ({
  productId: entry.productId,
  locationId: entry.locationId,
  currentQuantity: entry.currentQuantity ?? 0,
  minimumQuantity: entry.minimumQuantity ?? 0,
  reservedQuantity: entry.reservedQuantity ?? 0,
  availableQuantity: entry.availableQuantity ?? 0,
  productName: entry.productName ?? undefined,
  locationName: entry.locationName ?? undefined,
  preferredSupplierId: entry.preferredSupplierId ?? undefined,
  updatedAt: entry.updatedAt ?? undefined,
});

export class AnalyticsService {
  private sessionId: string = crypto.randomUUID();
  private eventQueue: JsonRecord[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Auto-flush events every 30 seconds
    this.startAutoFlush();
  }

  /**
   * Track user event
   */
  async trackEvent(
    eventType: string,
    eventData?: JsonRecord,
    location_id?: string
  ): Promise<void> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId;

    if (!practiceId) {
      analyticsLogger.warn('No practice selected, skipping analytics event', {
        eventType,
      });
      return;
    }

    try {
      const { error } = await supabase.from('usage_analytics').insert([
        {
          practice_id: practiceId,
          user_id: authStore.user?.id || null,
          location_id: location_id || null,
          event_type: eventType,
          event_data: eventData || {},
          session_id: this.sessionId,
          user_agent: navigator.userAgent,
        },
      ]);

      if (error) {
        handleSupabaseError(error, {
          service: 'AnalyticsService',
          operation: 'trackEvent',
          practiceId,
          userId: authStore.user?.id ?? null,
          metadata: { eventType, eventData },
        });
      }
    } catch (error) {
      analyticsLogger.error('Failed to track analytics event', {
        eventType,
        error,
      });
    }
  }

  /**
   * Get comprehensive analytics summary
   */
  static async getSummary(
    dateRange: AnalyticsDateRange
  ): Promise<AnalyticsSummary> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId;

    if (!practiceId) {
      return {
        totalEvents: 0,
        activeUsers: 0,
        totalOrders: 0,
        productUpdates: 0,
        topEvents: [],
        userActivity: {},
        dailyActivity: {},
      };
    }

    try {
      // Get usage analytics events
      const { data: events = [] } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('practice_id', practiceId)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate)
        .order('created_at', { ascending: false });

      // Get orders count
      const { count: ordersCount = 0 } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('practice_id', practiceId)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      // Get stock entries count
      const { count: stockEntriesCount = 0 } = await supabase
        .from('stock_entries')
        .select('*', { count: 'exact', head: true })
        .eq('practice_id', practiceId)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      // Process events
      const eventCounts: Record<string, number> = {};
      const userActivity: Record<
        string,
        { count: number; lastActivity: string }
      > = {};
      const dailyActivity: Record<string, number> = {};

      events?.forEach(event => {
        if (!event || !event.event_type || !event.created_at) {
          return;
        }

        // Count event types
        eventCounts[event.event_type] =
          (eventCounts[event.event_type] || 0) + 1;

        // Track user activity
        if (event.user_id) {
          if (!userActivity[event.user_id]) {
            userActivity[event.user_id] = {
              count: 0,
              lastActivity: event.created_at,
            };
          }
          userActivity[event.user_id].count += 1;
          if (
            new Date(event.created_at) >
            new Date(userActivity[event.user_id].lastActivity)
          ) {
            userActivity[event.user_id].lastActivity = event.created_at;
          }
        }

        // Track daily activity
        const date = new Date(event.created_at).toDateString();
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
      });

      const topEvents = Object.entries(eventCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) as [string, number][];

      return {
        totalEvents: events?.length || 0,
        activeUsers: Object.keys(userActivity).length,
        totalOrders: ordersCount || 0,
        productUpdates: stockEntriesCount || 0,
        topEvents,
        userActivity,
        dailyActivity,
      };
    } catch (error) {
      analyticsLogger.error('Error getting analytics summary:', error);
      return {
        totalEvents: 0,
        activeUsers: 0,
        totalOrders: 0,
        productUpdates: 0,
        topEvents: [],
        userActivity: {},
        dailyActivity: {},
      };
    }
  }

  /**
   * Get order analytics
   */
  static async getOrderMetrics(
    dateRange: AnalyticsDateRange
  ): Promise<OrderMetrics> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId;

    if (!practiceId) {
      return {
        totalOrders: 0,
        totalOrderValue: 0,
        averageOrderSize: 0,
        ordersByStatus: {},
        frequentlyOrderedItems: [],
        orderTrends: {},
      };
    }

    try {
      // Get orders with items
      const { data: orders } = await supabase
        .from('orders')
        .select(
          `
          *,
          order_items(
            *,
            products(name)
          )
        `
        )
        .eq('practice_id', practiceId)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      const totalOrders = orders?.length || 0;
      const totalOrderValue =
        orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      const averageOrderSize =
        totalOrders > 0 ? totalOrderValue / totalOrders : 0;

      const ordersByStatus: Record<string, number> = {};
      const itemCounts = new Map<
        string,
        {
          productName: string;
          totalQuantity: number;
          orderCount: number;
          productId: string;
        }
      >();
      const orderTrends: Record<string, number> = {};

      orders?.forEach(order => {
        // Count by status
        ordersByStatus[order.status] = (ordersByStatus[order.status] || 0) + 1;

        // Count order trends by day
        const date = new Date(order.created_at).toDateString();
        orderTrends[date] = (orderTrends[date] || 0) + 1;

        // Count item frequencies
        order.order_items?.forEach((item: OrderItem) => {
          const key = item.product_id;
          const existing = itemCounts.get(key);
          if (existing) {
            existing.totalQuantity += item.quantity;
            existing.orderCount += 1;
          } else {
            itemCounts.set(key, {
              productName: item.products?.name || 'Unknown Product',
              totalQuantity: item.quantity,
              orderCount: 1,
              productId: item.product_id,
            });
          }
        });
      });

      const frequentlyOrderedItems = Array.from(itemCounts.values())
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 10);

      return {
        totalOrders,
        totalOrderValue,
        averageOrderSize,
        ordersByStatus,
        frequentlyOrderedItems,
        orderTrends,
      };
    } catch (error) {
      analyticsLogger.error('Error getting order metrics:', error);
      return {
        totalOrders: 0,
        totalOrderValue: 0,
        averageOrderSize: 0,
        ordersByStatus: {},
        frequentlyOrderedItems: [],
        orderTrends: {},
      };
    }
  }

  /**
   * Get product analytics
   */
  static async getProductMetrics(
    dateRange: AnalyticsDateRange
  ): Promise<ProductMetrics> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId;

    if (!practiceId) {
      return {
        totalUpdates: 0,
        productsScanned: 0,
        lowStockAlerts: 0,
        stockEntryTrends: {},
        mostUpdatedProducts: [],
      };
    }

    try {
      // Get stock entries
      const { data: stockEntries } = await supabase
        .from('stock_entries')
        .select(
          `
          *,
          products(name)
        `
        )
        .eq('practice_id', practiceId)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      // Get low stock alerts
      const { data: lowStockItems } = await supabase
        .from('order_suggestions')
        .select('*')
        .eq('practice_id', practiceId)
        .in('urgency_level', ['high', 'critical'])
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate);

      const stockLevelDTOs = stockEntries.map(entry =>
        mapStockLevelToAnalyticsDTO(entry)
      );
      const totalUpdates = stockLevelDTOs.length;
      const productsScanned = new Set(
        stockLevelDTOs.map(entry => entry.productId)
      ).size;
      let lowStockAlerts = lowStockItems?.length || 0;

      const productUpdateCounts = new Map<
        string,
        { productName: string; updateCount: number; productId: string }
      >();
      const stockEntryTrends: Record<string, number> = {};

      stockLevelDTOs.forEach(entry => {
        const key = entry.productId;
        const existing = productUpdateCounts.get(key);
        if (existing) {
          existing.updateCount += 1;
        } else {
          productUpdateCounts.set(key, {
            productName: entry.productName ?? 'Unknown Product',
            updateCount: 1,
            productId: entry.productId,
          });
        }

        const date = entry.updatedAt
          ? new Date(entry.updatedAt).toDateString()
          : 'Unknown';
        stockEntryTrends[date] = (stockEntryTrends[date] || 0) + 1;
      });

      const mostUpdatedProducts = Array.from(productUpdateCounts.values())
        .sort((a, b) => b.updateCount - a.updateCount)
        .slice(0, 10);

      return {
        totalUpdates,
        productsScanned,
        lowStockAlerts,
        stockEntryTrends,
        mostUpdatedProducts,
      };
    } catch (error) {
      analyticsLogger.error('Error getting product metrics:', error);
      return {
        totalUpdates: 0,
        productsScanned: 0,
        lowStockAlerts: 0,
        stockEntryTrends: {},
        mostUpdatedProducts: [],
      };
    }
  }

  /**
   * Get user activity metrics
   */
  static async getUserActivityMetrics(
    dateRange: AnalyticsDateRange
  ): Promise<UserActivityMetrics> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId;

    if (!practiceId) {
      return {
        activeUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        usersByRole: {},
        mostActiveUsers: [],
        userList: [],
      };
    }

    try {
      // Get usage analytics
      const { data: analytics } = await supabase
        .from('usage_analytics')
        .select('*')
        .eq('practice_id', practiceId)
        .gte('created_at', dateRange.startDate)
        .lte('created_at', dateRange.endDate)
        .order('created_at', { ascending: false });

      const events = analytics as UsageAnalytics[] | null;

      const userMap = new Map<
        string,
        {
          activity_count: number;
          last_activity: string;
          total_events: number;
          sessions: Set<string>;
        }
      >();

      events?.forEach(event => {
        if (!event || !event.user_id) {
          return;
        }

        const existing = userMap.get(event.user_id);
        if (existing) {
          existing.activity_count += 1;
          existing.total_events += 1;
          if (event.session_id) {
            existing.sessions.add(event.session_id);
          }
          if (new Date(event.created_at) > new Date(existing.last_activity)) {
            existing.last_activity = event.created_at;
          }
        } else {
          userMap.set(event.user_id, {
            activity_count: 1,
            last_activity: event.created_at,
            total_events: 1,
            sessions: new Set(event.session_id ? [event.session_id] : []),
          });
        }
      });

      const userList = Array.from(userMap.entries()).map(([user_id, data]) => ({
        user_id,
        activity_count: data.activity_count,
        last_activity: data.last_activity,
        total_events: data.total_events,
      }));

      const totalSessions = Array.from(userMap.values()).reduce(
        (sum, user) => sum + user.sessions.size,
        0
      );
      const averageSessionDuration =
        analytics?.length && totalSessions > 0
          ? analytics.length / totalSessions
          : 0;

      return {
        activeUsers: userMap.size,
        totalSessions,
        averageSessionDuration,
        userList,
        usersByRole: {},
        mostActiveUsers: [],
      };
    } catch (error) {
      analyticsLogger.error('Error getting user activity metrics:', error);
      return {
        activeUsers: 0,
        totalSessions: 0,
        averageSessionDuration: 0,
        usersByRole: {},
        mostActiveUsers: [],
        userList: [],
      };
    }
  }

  /**
   * Get low stock items
   */
  static async getLowStockItems(clinicId: string): Promise<LowStockItem[]> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: productsData } = await supabase
        .from('products')
        .select(
          `
          id,
          name,
          stock_levels:stock_levels(
            id,
            practice_id,
            location_id,
            current_quantity,
            available_quantity,
            reserved_quantity,
            minimum_quantity,
            practice_locations(name)
          )
        `
        )
        .eq('stock_levels.practice_id', clinicId)
        .order('stock_levels.current_quantity', { ascending: true });

      if (!productsData) {
        return [];
      }

      const products = productsData
        .map(product => {
          const stockLevels = toArray(product.stock_levels).map(level =>
            mapStockLevelRowToView(level)
          );
          const primaryStock = stockLevels[0];

          if (!primaryStock) {
            return null;
          }

          const currentQuantity = primaryStock.currentQuantity ?? 0;
          const minimumQuantity = primaryStock.minimumQuantity ?? 0;

          if (currentQuantity > minimumQuantity) {
            return null;
          }

          return {
            productId: product.id,
            productName: product.name ?? 'Unknown product',
            currentQuantity,
            minimumQuantity,
            locationId: primaryStock.locationId,
            locationName: primaryStock.locationName ?? 'Unknown location',
            availableQuantity: primaryStock.availableQuantity ?? 0,
            reservedQuantity: primaryStock.reservedQuantity ?? 0,
            preferredSupplierId: primaryStock.preferredSupplierId ?? null,
            productSku: product.sku ?? null,
            unitPrice: product.unit_price ?? null,
          } satisfies LowStockItemDTO;
        })
        .filter((item): item is LowStockItemDTO => item !== null);

      return products;
    } catch (error) {
      analyticsLogger.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  /**
   * Get stock turnover rates
   */
  static async getStockTurnoverRates(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StockTurnoverRate[]> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: stockData } = await supabase
        .from('stock_levels')
        .select(
          `
          id,
          product_id,
          practice_id,
          location_id,
          current_quantity,
          available_quantity,
          reserved_quantity,
          minimum_quantity,
          location_name,
          product_name,
          stock_movements!inner(
            movement_type,
            quantity,
            created_at,
            products(*),
            stock_levels!inner(location_id)
          )
        `
        )
        .eq('practice_id', clinicId)
        .gte('stock_movements.created_at', startDate.toISOString())
        .lte('stock_movements.created_at', endDate.toISOString());

      const levels = (stockData as StockLevelWithMovementsRow[] | null) ?? [];

      if (!levels.length) {
        return [];
      }

      const metrics = new Map<
        string,
        {
          productId: string;
          productName: string;
          totalUsed: number;
          averageStock: number;
        }
      >();

      levels.forEach(level => {
        const productId = level.product_id;
        const productName = level.products.name ?? 'Unknown product';
        const currentQuantity = level.current_quantity ?? 0;

        if (!metrics.has(productId)) {
          metrics.set(productId, {
            productId,
            productName,
            totalUsed: 0,
            averageStock: currentQuantity,
          });
        }

        const entry = metrics.get(productId);
        if (!entry) {
          return;
        }

        entry.averageStock = (entry.averageStock + currentQuantity) / 2;

        const movements = toArray(level.stock_movements);

        movements.forEach(movement => {
          if (movement.movement_type === 'usage') {
            const quantity = Math.abs(movement.quantity ?? 0);
            entry.totalUsed += quantity;
          }
        });
      });

      return Array.from(metrics.values()).map(metric => ({
        productId: metric.productId,
        productName: metric.productName,
        totalUsed: metric.totalUsed,
        averageStock: metric.averageStock,
        turnoverRate:
          metric.averageStock > 0 ? metric.totalUsed / metric.averageStock : 0,
      }));
    } catch (error) {
      analyticsLogger.error('Error calculating stock turnover rates:', error);
      throw error;
    }
  }

  /**
   * Get monthly usage trends
   */
  static async getMonthlyUsageTrends(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MonthlyUsageTrends> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: entries } = await supabase
        .from('stock_entries')
        .select('*')
        .eq('practice_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const rows = (entries as StockEntryRow[] | null) ?? [];

      const monthlyData: MonthlyUsageTrends = {};
      rows.forEach(entry => {
        const createdAt = new Date(entry.created_at);
        const month = createdAt.getMonth();
        const year = createdAt.getFullYear();
        const key = `${year}-${month + 1}`;
        const countedQuantity = entry.counted_quantity ?? 0;
        monthlyData[key] = (monthlyData[key] ?? 0) + countedQuantity;
      });

      return monthlyData;
    } catch (error) {
      analyticsLogger.error('Error getting monthly usage trends:', error);
      throw error;
    }
  }

  /**
   * Get top used products
   */
  static async getTopUsedProducts(
    clinicId: string,
    startDate: Date,
    endDate: Date,
    limit = 10
  ): Promise<TopUsedProduct[]> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: entries } = await supabase
        .from('stock_entries')
        .select('*, products(name)')
        .eq('practice_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('counted_quantity', { ascending: false })
        .limit(limit);

      const rows = (entries as StockEntryRow[] | null) ?? [];

      return rows.map(
        entry =>
          ({
            productId: entry.product_id,
            productName: entry.products?.name ?? 'Unknown',
            totalUsed: entry.counted_quantity ?? 0,
            usageCount: 1,
          }) satisfies TopUsedProduct
      );
    } catch (error) {
      analyticsLogger.error('Error getting top used products:', error);
      throw error;
    }
  }

  /**
   * Get cost savings analytics
   */
  static async getCostSavingsAnalytics(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CostSavingsAnalytics> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: movements } = await supabase
        .from('stock_movements')
        .select(
          `
          *,
          products!inner(price),
          stock_levels!inner(practice_id)
        `
        )
        .eq('stock_levels.practice_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const rows = (movements as StockMovementRow[] | null) ?? [];

      if (!rows.length) {
        return {
          total_savings: 0,
          waste_reduction: 0,
          efficiency_improvement: 0,
          cost_per_unit_improvement: 0,
        };
      }

      let totalWaste = 0;
      let totalUsage = 0;
      let totalValue = 0;

      rows.forEach(movement => {
        const quantity = Math.abs(movement.quantity ?? 0);
        const price = movement.products?.price ?? 0;
        totalValue += quantity * price;

        if (movement.movement_type === 'waste') {
          totalWaste += quantity;
        } else if (movement.movement_type === 'usage') {
          totalUsage += quantity;
        }
      });

      const wasteReduction =
        totalUsage > 0 ? (1 - totalWaste / totalUsage) * 100 : 0;
      const efficiencyImprovement =
        wasteReduction > 0 ? wasteReduction * 0.8 : 0;

      return {
        total_savings: totalValue * (wasteReduction / 100),
        waste_reduction: wasteReduction,
        efficiency_improvement: efficiencyImprovement,
        cost_per_unit_improvement:
          totalUsage > 0 ? (totalValue / totalUsage) * 0.1 : 0,
      };
    } catch (error) {
      analyticsLogger.error('Error calculating cost savings:', error);
      throw error;
    }
  }

  /**
   * Get inventory value trends
   */
  static async getInventoryValueTrends(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<InventoryValueTrends> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: levels } = await supabase
        .from('stock_levels')
        .select(
          `
          product_id,
          product_name,
          practice_id,
          location_id,
          current_quantity,
          available_quantity,
          reserved_quantity,
          minimum_quantity,
          created_at
        `
        )
        .eq('practice_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const rows = (levels as StockLevelView[] | null) ?? [];

      const totalValue = rows.reduce((sum, level) => {
        const available = level.available_quantity ?? 0;
        const reserved = level.reserved_quantity ?? 0;
        const quantity = available + reserved;
        const price = 10; // Placeholder until pricing data is joined properly
        return sum + quantity * price;
      }, 0);

      return {
        current_value: totalValue,
        trend_data: [{ date: new Date().toISOString(), value: totalValue }],
      };
    } catch (error) {
      analyticsLogger.error('Error getting inventory value trends:', error);
      throw error;
    }
  }

  /**
   * Predict future stock needs
   */
  static async predictStockNeeds(
    clinicId: string
  ): Promise<PredictedStockNeed[]> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: levels } = await supabase
        .from('stock_levels')
        .select(
          `
          product_id,
          product_name,
          practice_id,
          location_id,
          current_quantity,
          available_quantity,
          reserved_quantity,
          minimum_quantity
        `
        )
        .eq('practice_id', clinicId);

      const rows = (levels as StockLevelView[] | null) ?? [];

      return rows.map(level => ({
        productId: level.product_id,
        productName: level.product_name ?? 'Unknown',
        currentStock: level.current_quantity ?? 0,
        predictedUsage: Math.floor(Math.random() * 10),
        suggestedOrder: Math.max(0, Math.floor(Math.random() * 20)),
      }));
    } catch (error) {
      analyticsLogger.error('Error predicting stock needs:', error);
      throw error;
    }
  }

  /**
   * Get forecast accuracy
   */
  static async getForecastAccuracy(
    clinicId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ForecastAccuracy> {
    if (!clinicId) {
      throw new Error(t('analytics.clinicIdRequired'));
    }

    try {
      const { data: movements } = await supabase
        .from('stock_movements')
        .select(
          `
          *,
          products!inner(category),
          stock_levels!inner(practice_id)
        `
        )
        .eq('stock_levels.practice_id', clinicId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('movement_type', 'usage');

      const rows = (movements as StockMovementRow[] | null) ?? [];

      if (!rows.length) {
        return {
          overall_accuracy: 0,
          category_accuracy: {
            medical_supplies: 0,
            pharmaceuticals: 0,
            equipment: 0,
          },
          trend: 'insufficient_data',
        };
      }

      const categoryStats = new Map<string, { total: number; count: number }>();

      rows.forEach(movement => {
        const category = movement.products?.category ?? 'other';
        if (!categoryStats.has(category)) {
          categoryStats.set(category, { total: 0, count: 0 });
        }
        const stats = categoryStats.get(category);
        if (!stats) {
          return;
        }
        stats.total += Math.abs(movement.quantity ?? 0);
        stats.count += 1;
      });

      const categoryAccuracy: Record<string, number> = {};
      let overallTotal = 0;
      let overallCount = 0;

      categoryStats.forEach((stats, category) => {
        const avgUsage = stats.total / Math.max(stats.count, 1);
        const relevantMovements = rows.filter(
          movement => (movement.products?.category ?? 'other') === category
        );
        const variance =
          relevantMovements.reduce((sum, movement) => {
            const quantity = Math.abs(movement.quantity ?? 0);
            return sum + Math.pow(quantity - avgUsage, 2);
          }, 0) / Math.max(stats.count, 1);

        const accuracy = Math.max(
          0,
          100 - (variance / Math.max(avgUsage, 1)) * 10
        );
        categoryAccuracy[category.toLowerCase().replace(/\s+/g, '_')] =
          accuracy;
        overallTotal += accuracy;
        overallCount += 1;
      });

      const overallAccuracy =
        overallCount > 0 ? overallTotal / overallCount : 0;

      return {
        overall_accuracy: overallAccuracy,
        category_accuracy: {
          medical_supplies: categoryAccuracy.medical_supplies ?? 0,
          pharmaceuticals: categoryAccuracy.pharmaceuticals ?? 0,
          equipment: categoryAccuracy.equipment ?? 0,
          ...categoryAccuracy,
        },
        trend:
          overallAccuracy > 75
            ? 'improving'
            : overallAccuracy > 50
              ? 'stable'
              : 'needs_attention',
      };
    } catch (error) {
      analyticsLogger.error('Error calculating forecast accuracy:', error);
      throw error;
    }
  }

  // Keep methods that are actually used in the codebase
  async getUsageStats(): Promise<UsageAnalytics[]> {
    try {
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      return (events as UsageAnalytics[] | null) ?? [];
    } catch (error) {
      analyticsLogger.error('Error getting usage stats:', error);
      return [];
    }
  }

  async trackScanEvent(
    productId: string,
    scanType: string,
    metadata?: JsonRecord
  ) {
    return this.trackEvent('scan_event', {
      product_id: productId,
      scan_type: scanType,
      ...(metadata ?? {}),
    });
  }

  async flushEvents(): Promise<void> {
    // Implementation kept simple for now
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, 30000);
  }

  destroy() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushEvents(); // Final flush
  }
}

// Export an instance for compatibility with existing code
export const analyticsService = new AnalyticsService();
