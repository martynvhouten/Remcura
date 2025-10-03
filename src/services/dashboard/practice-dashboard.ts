import { supabase } from '../supabase';
import { dashboardLogger } from '@/utils/logger';
import { t } from '@/utils/i18n-service';
import { ServiceErrorHandler } from '@/utils/service-error-handler';
import {
  roleDashboardConfig,
  type RoleDashboardDefinition,
} from './role-config';
import type { UserRole } from '@/types/permissions';
import type { AnalyticsStockLevelDTO } from '@/types/analytics';
import type { StockLevelView } from '@/types/inventory';

const mapStockLevelToDashboardDTO = (
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

export interface PracticeWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'alert' | 'table';
  data: Record<string, any>;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
  loading?: boolean;
  error?: string;
}

export interface PracticeDashboardData {
  widgets: PracticeWidget[];
  metrics: {
    totalProducts: number;
    lowStockCount: number;
    pendingOrders: number;
    totalValue: number;
    recentActivity: number;
  };
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    route: string;
    color: string;
    type: string;
    permission?: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    message: string;
    action?: string;
    actionLabel?: string;
  }>;
}

type RoleSummary = {
  title: string;
  subtitle: string;
  widgets: string[];
  color: string;
  icon: string;
};

class PracticeDashboardService {
  /**
   * Krijg role configuratie via de centrale role config service
   */
  getRoleConfig(role: UserRole): RoleSummary {
    const config = roleDashboardConfig.getRoleConfig(role);

    return {
      title: t(config.titleKey),
      subtitle: t(config.subtitleKey),
      widgets: config.widgets.map(widget => widget.id),
      color: config.color,
      icon: config.icon,
    };
  }

  /**
   * Krijg widget configuratie via de centrale config
   */
  private getWidgetConfig(role: UserRole): string[] {
    return roleDashboardConfig.getWidgetIds(role);
  }

  async getDashboardData(
    role: UserRole,
    practiceId: string
  ): Promise<PracticeDashboardData> {
    try {
      dashboardLogger.info(
        `🎯 Loading practice dashboard for role: "${role}", practice: "${practiceId}"`
      );

      const widgetIds = this.getWidgetConfig(role);

      // Load base metrics
      const metrics = await this.loadMetrics(practiceId);

      // Load role-specific widgets
      const widgets = await this.loadWidgets(widgetIds, practiceId, role);

      // Load role-specific quick actions
      const quickActions = this.getQuickActions(role);

      // Load alerts
      const alerts = await this.loadAlerts(practiceId, role);

      return {
        widgets,
        metrics,
        quickActions,
        alerts,
      };
    } catch (error) {
      dashboardLogger.error('Error loading practice dashboard:', error as Record<string, unknown>);
      throw error;
    }
  }

  private async loadMetrics(practiceId: string) {
    try {
      // 🚀 PERFORMANCE OPTIMIZATION: Use parallel queries instead of sequential
      const [
        stockLevelsResponse,
        ordersResponse,
        productsResponse,
        inventoryValueResponse,
        recentActivityResponse,
      ] = await Promise.all([
        // Stock levels for low stock calculation
        supabase
          .from('stock_levels')
          .select('current_quantity, minimum_quantity')
          .eq('practice_id', practiceId),

        // Orders for pending count
        supabase
          .from('order_lists')
          .select('id, status, total_value')
          .eq('practice_id', practiceId)
          .order('created_at', { ascending: false })
          .limit(50),

        // Products count
        supabase
          .from('products')
          .select('id')
          .eq('practice_id', practiceId)
          .eq('active', true),

        // Inventory value with JOIN optimization
        supabase
          .from('stock_levels')
          .select(
            `
            current_quantity,
            products!inner(price)
          `
          )
          .eq('practice_id', practiceId),

        // Recent activity count
        supabase
          .from('activity_log')
          .select('id')
          .eq('practice_id', practiceId)
          .gte(
            'created_at',
            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          ),
      ]);

      // Check for errors
      const { data: stockLevels, error: stockError } = stockLevelsResponse;
      const { data: orders, error: ordersError } = ordersResponse;
      const { data: products, error: productsError } = productsResponse;
      const { data: inventoryValue, error: inventoryError } =
        inventoryValueResponse;
      const { data: recentActivity, error: activityError } =
        recentActivityResponse;

      if (stockError)
        dashboardLogger.warn('Error fetching stock levels', {
          error: stockError,
        });
      if (ordersError)
        dashboardLogger.warn('Error fetching orders', {
          error: ordersError,
        });
      if (productsError)
        dashboardLogger.warn('Error fetching products', {
          error: productsError,
        });
      if (inventoryError)
        dashboardLogger.warn('Error fetching inventory value', {
          error: inventoryError,
        });
      if (activityError)
        dashboardLogger.warn('Error fetching recent activity', {
          error: activityError,
        });

      // 🚀 PERFORMANCE: Calculate metrics from parallel data
      const lowStockCount =
        stockLevels?.filter(
          stock =>
            (stock.current_quantity ?? 0) <= (stock.minimum_quantity ?? 0)
        ).length || 0;

      const pendingOrders =
        orders?.filter(
          order => order.status && ['draft', 'active'].includes(order.status)
        ).length || 0;

      const totalProducts = products?.length || 0;

      const totalValue =
        inventoryValue?.reduce((total, item) => {
          const price = (item.products as any)?.price || 0;
          return total + (item.current_quantity ?? 0) * price;
        }, 0) || 0;

      return {
        totalProducts,
        lowStockCount,
        pendingOrders,
        totalValue: Math.round(totalValue),
        recentActivity: recentActivity?.length || 0,
      };
    } catch (error) {
      dashboardLogger.error('Error loading metrics:', error as Record<string, unknown>);
      // Return fallback metrics
      return {
        totalProducts: 0,
        lowStockCount: 0,
        pendingOrders: 0,
        totalValue: 0,
        recentActivity: 0,
      };
    }
  }

  private async loadWidgets(
    widgetIds: string[],
    practiceId: string,
    role: UserRole
  ): Promise<PracticeWidget[]> {
    const widgets: PracticeWidget[] = [];
    const roleConfig = roleDashboardConfig.getRoleConfig(role);

    for (let i = 0; i < widgetIds.length; i++) {
      const widgetId = widgetIds[i];
      if (!widgetId) continue;
      try {
        // Krijg widget config voor titel en eigenschappen
        const widgetConfig = roleConfig.widgets.find(w => w.id === widgetId);
        const widget = await this.loadWidget(
          widgetId,
          practiceId ?? '',
          widgetConfig?.position || i,
          widgetConfig
        );
        if (widget) {
          widgets.push(widget);
        }
      } catch (error) {
        ServiceErrorHandler.handle(
          error as Error,
          {
            service: 'PracticeDashboardService',
            operation: 'loadWidget',
            practiceId,
            metadata: { widgetId, role, position: i },
          },
          { rethrow: false, logLevel: 'error' }
        );

        // Add error widget
        const widgetConfig = roleConfig.widgets.find(w => w.id === widgetId);
        widgets.push({
          id: widgetId,
          title: t((widgetConfig?.titleKey ?? 'dashboard.widgets.error') as string),
          type: 'alert',
          data: { error: 'Failed to load widget data' },
          size: widgetConfig?.size || 'medium',
          position: widgetConfig?.position || i,
          visible: true,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return widgets;
  }

  private async loadWidget(
    widgetId: string,
    practiceId: string,
    position: number,
    widgetConfig?: any
  ): Promise<PracticeWidget | null> {
    const baseWidget = {
      id: widgetId,
      title: widgetConfig
        ? t(widgetConfig.titleKey)
        : this.getWidgetTitle(widgetId),
      position,
      visible: true,
      loading: false,
    };

    switch (widgetId) {
      case 'low-stock-alerts':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadLowStockAlerts(practiceId),
        };

      case 'expiring-products':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadExpiringProducts(practiceId),
        };

      case 'order-suggestions':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadOrderSuggestions(practiceId),
        };

      case 'active-order-lists':
        return {
          ...baseWidget,
          type: 'table' as const,
          size: 'large' as const,
          data: await this.loadActiveOrderLists(practiceId),
        };

      case 'pending-deliveries':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadPendingDeliveries(practiceId),
        };

      case 'stock-trends':
        return {
          ...baseWidget,
          type: 'chart' as const,
          size: 'large' as const,
          data: await this.loadStockTrends(practiceId),
        };

      case 'supplier-performance':
        return {
          ...baseWidget,
          type: 'table' as const,
          size: 'large' as const,
          data: await this.loadSupplierPerformance(practiceId),
        };

      case 'cost-analysis':
        return {
          ...baseWidget,
          type: 'chart' as const,
          size: 'medium' as const,
          data: await this.loadCostAnalysis(practiceId),
        };

      case 'error-alerts':
        return {
          ...baseWidget,
          type: 'alert' as const,
          size: 'medium' as const,
          data: await this.loadErrorAlerts(practiceId),
        };

      case 'pending-orders':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'small' as const,
          data: await this.loadPendingOrdersMetric(practiceId),
        };

      case 'inventory-value':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'medium' as const,
          data: await this.loadInventoryValue(practiceId),
        };

      case 'batch-compliance':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'medium' as const,
          data: await this.loadBatchCompliance(practiceId),
        };

      case 'supplier-contracts':
        return {
          ...baseWidget,
          type: 'table' as const,
          size: 'large' as const,
          data: await this.loadSupplierContracts(),
        };

      case 'stock-rotation':
        return {
          ...baseWidget,
          type: 'chart' as const,
          size: 'medium' as const,
          data: await this.loadStockRotation(practiceId),
        };

      case 'audit-notifications':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadAuditNotifications(practiceId),
        };

      // LOGISTICS role widgets
      case 'stock-movements':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadStockMovements(practiceId),
        };

      case 'location-overview':
        return {
          ...baseWidget,
          type: 'chart' as const,
          size: 'medium' as const,
          data: await this.loadLocationOverview(practiceId),
        };

      case 'transport-status':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'small' as const,
          data: await this.loadTransportStatus(practiceId),
        };

      // MEMBER role widgets
      case 'stock-overview':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'medium' as const,
          data: await this.loadStockOverview(practiceId),
        };

      case 'my-tasks':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadMyTasks(practiceId),
        };

      // GUEST role widgets
      case 'public-info':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'medium' as const,
          data: await this.loadPublicInfo(practiceId),
        };

      // PLATFORM_OWNER role widgets
      case 'system-overview':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'large' as const,
          data: await this.loadSystemOverview(),
        };

      case 'user-analytics':
        return {
          ...baseWidget,
          type: 'chart' as const,
          size: 'medium' as const,
          data: await this.loadUserAnalytics(),
        };

      case 'platform-health':
        return {
          ...baseWidget,
          type: 'alert' as const,
          size: 'medium' as const,
          data: await this.loadPlatformHealth(),
        };

      case 'subscription-status':
        return {
          ...baseWidget,
          type: 'table' as const,
          size: 'large' as const,
          data: await this.loadSubscriptionStatus(),
        };

      default:
        return null;
    }
  }

  // Widget data loaders - ASSISTANT WIDGETS
  private async loadLowStockAlerts(practiceId: string) {
    const { data, error } = await supabase
      .from('stock_levels')
      .select(
        `
        current_quantity,
        minimum_quantity,
        products!inner(name, category),
        practice_locations!inner(name)
      `
      )
      .eq('practice_id', practiceId)
      .order('current_quantity', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error loading low stock alerts:', error);
      return { items: [] };
    }

    // Map Supabase response to expected format
    interface LowStockRow {
      current_quantity: number | null;
      minimum_quantity: number | null;
      products: { name: string; category: string | null } | null;
      practice_locations: { name: string } | null;
    }

    const items =
      (data as LowStockRow[] | null)?.map(row => ({
        name: row.products?.name ?? 'Unknown product',
        category: row.products?.category ?? 'N/A',
        current_quantity: row.current_quantity ?? 0,
        minimum_quantity: row.minimum_quantity ?? 0,
        location: row.practice_locations?.name ?? 'Unknown',
      })) ?? [];

    return {
      items: items || [],
    };
  }

  private async loadExpiringProducts(practiceId: string) {
    const { data, error } = await supabase
      .from('product_batches')
      .select(
        `
        batch_number,
        expiry_date,
        current_quantity,
        products!inner(name),
        practice_locations!inner(name)
      `
      )
      .eq('practice_id', practiceId)
      .lte(
        'expiry_date',
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('expiry_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error loading expiring products:', error);
      return { items: [] };
    }

    return {
      items:
        data?.map((item: any) => ({
          product_name: item.products?.name || 'Unknown Product',
          batch_number: item.batch_number || 'N/A',
          expiry_date: item.expiry_date || null,
          quantity: item.current_quantity || 0,
          location: item.practice_locations?.name || 'Unknown Location',
          days_until_expiry: item.expiry_date
            ? Math.ceil(
                (new Date(item.expiry_date).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : 0,
        })) || [],
    };
  }

  private async loadOrderSuggestions(practiceId: string) {
    const { data } = await supabase
      .from('order_suggestions')
      .select(
        `
        current_stock,
        minimum_stock,
        suggested_quantity,
        urgency_level,
        products!inner(name, category)
      `
      )
      .eq('practice_id', practiceId)
      .gt('expires_at', new Date().toISOString())
      .order('urgency_level', { ascending: false })
      .limit(10);

    return {
      items:
        data?.map(item => ({
          product_name: (item.products as any).name,
          category: (item.products as any).category,
          current_stock: item.current_stock,
          minimum_stock: item.minimum_stock,
          suggested_quantity: item.suggested_quantity,
          urgency: item.urgency_level,
        })) || [],
    };
  }

  private async loadActiveOrderLists(practiceId: string) {
    const { data } = await supabase
      .from('order_lists')
      .select(
        `
        name,
        status,
        total_items,
        total_value,
        created_at,
        suppliers(name)
      `
      )
      .eq('practice_id', practiceId)
      .in('status', ['draft', 'active'])
      .order('updated_at', { ascending: false })
      .limit(10);

    return {
      headers: ['Name', 'Supplier', 'Items', 'Value', 'Status', 'Created'],
      rows:
        data?.map(item => [
          item.name,
          (item.suppliers as any)?.name || 'No supplier',
          item.total_items,
          `€${item.total_value}`,
          item.status,
          item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
        ]) || [],
    };
  }

  private async loadPendingDeliveries(practiceId: string) {
    const { data } = await supabase
      .from('supplier_orders')
      .select(
        `
        delivery_expected,
        total_items,
        total_value,
        suppliers!inner(name),
        order_lists!inner(name, practice_id)
      `
      )
      .eq('order_lists.practice_id', practiceId)
      .in('status', ['sent', 'confirmed'])
      .order('delivery_expected', { ascending: true })
      .limit(10);

    return {
      items:
        data?.map(item => ({
          supplier_name: (item.suppliers as any).name,
          order_name: (item.order_lists as any).name,
          expected_date: item.delivery_expected,
          total_items: item.total_items,
          total_value: item.total_value,
          days_until_delivery: item.delivery_expected
            ? Math.ceil(
                (new Date(item.delivery_expected).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            : null,
        })) || [],
    };
  }

  // Widget data loaders - MANAGER WIDGETS
  private async loadStockTrends(practiceId: string) {
    const { data } = await supabase
      .from('stock_movements')
      .select('created_at, movement_type, quantity_change')
      .eq('practice_id', practiceId)
      .gte(
        'created_at',
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('created_at', { ascending: true });

    // Group by week and movement type
    const weeklyData: Record<string, Record<string, number>> = {};

    data?.forEach(movement => {
      if (!movement.created_at || !movement.movement_type) return;
      const createdAt = movement.created_at;
      const movementType = movement.movement_type;
      const week = new Date(createdAt).toISOString().split('T')[0]; // Simplified to daily for now
      if (!weeklyData[week]) weeklyData[week] = {};
      if (!weeklyData[week][movementType])
        weeklyData[week][movementType] = 0;
      weeklyData[week][movementType] += Number(
        movement.quantity_change ?? 0
      );
    });

    return {
      chart_type: 'line',
      labels: Object.keys(weeklyData).slice(-14), // Last 14 days
      datasets: [
        {
          label: 'In',
          data: Object.keys(weeklyData)
            .slice(-14)
            .map(week => weeklyData[week]?.['in'] ?? 0),
          color: '#4CAF50',
        },
        {
          label: 'Out',
          data: Object.keys(weeklyData)
            .slice(-14)
            .map(week => Math.abs(weeklyData[week]?.['out'] ?? 0)),
          color: '#F44336',
        },
      ],
    };
  }

  private async loadSupplierPerformance(practiceId: string) {
    try {
      const { data, error } = await supabase.rpc('get_supplier_performance', {
        practice_id_param: practiceId,
      });

      if (error) {
        ServiceErrorHandler.handle(
          error as Error,
          {
            service: 'PracticeDashboardService',
            operation: 'loadSupplierPerformance',
            practiceId,
          },
          { rethrow: false, logLevel: 'warn' }
        );
      }

      return {
        headers: [
          'Supplier',
          'Integration',
          'Orders',
          'Avg Delivery',
          'Failed',
          'Last Sync',
        ],
        rows:
          data?.map((item: any) => [
            item.supplier_name,
            item.integration_type,
            item.total_orders,
            item.avg_delivery_days ? `${item.avg_delivery_days} days` : 'N/A',
            item.failed_orders,
            item.last_sync_at
              ? new Date(item.last_sync_at).toLocaleDateString()
              : 'Never',
          ]) || [],
      };
    } catch (error) {
      ServiceErrorHandler.handle(
        error as Error,
        {
          service: 'PracticeDashboardService',
          operation: 'loadSupplierPerformance',
          practiceId,
        },
        { rethrow: false, logLevel: 'error' }
      );

      // Graceful empty state with headers
      return {
        headers: [
          'Supplier',
          'Integration',
          'Orders',
          'Avg Delivery',
          'Failed',
          'Last Sync',
        ],
        rows: [],
      };
    }
  }

  private async loadCostAnalysis(practiceId: string) {
    const { data } = await supabase
      .from('product_batches')
      .select(
        `
        total_cost,
        products!inner(category)
      `
      )
      .eq('practice_id', practiceId)
      .gte(
        'created_at',
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
      );

    const categoryTotals: Record<string, number> = {};
    data?.forEach(batch => {
      const category = (batch.products as any).category || 'Unknown';
      categoryTotals[category] =
        (categoryTotals[category] || 0) + Number(batch.total_cost || 0);
    });

    return {
      chart_type: 'doughnut',
      labels: Object.keys(categoryTotals),
      data: Object.values(categoryTotals),
      total: Object.values(categoryTotals).reduce((sum, val) => sum + val, 0),
    };
  }

  private async loadErrorAlerts(practiceId: string) {
    const { data } = await supabase
      .from('activity_log')
      .select('activity_type, description, created_at')
      .eq('practice_id', practiceId)
      .ilike('activity_type', '%error%')
      .gte(
        'created_at',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      alerts:
        data?.map(alert => ({
          type: 'error' as const,
          title: alert.activity_type,
          message: alert.description,
          timestamp: alert.created_at,
        })) || [],
    };
  }

  private async loadPendingOrdersMetric(practiceId: string) {
    const { data, count } = await supabase
      .from('order_lists')
      .select('total_value', { count: 'exact' })
      .eq('practice_id', practiceId)
      .in('status', ['draft', 'active']);

    const totalValue =
      data?.reduce((sum, order) => sum + Number(order.total_value || 0), 0) ||
      0;

    return {
      count: count || 0,
      total_value: totalValue,
      trend: 'stable', // Could be calculated from historical data
    };
  }

  // Widget data loaders - OWNER WIDGETS
  private async loadInventoryValue(practiceId: string) {
    const { data } = await supabase
      .from('stock_levels')
      .select(
        `
        current_quantity,
        products!inner(price, category)
      `
      )
      .eq('practice_id', practiceId);

    let totalValue = 0;
    const categoryValues: Record<string, number> = {};
    let totalProducts = 0;

    data?.forEach(item => {
      const price = Number((item.products as any).price || 0);
      const quantity = Number(item.current_quantity || 0);
      const value = price * quantity;

      totalValue += value;
      totalProducts++;

      const category = (item.products as any).category || 'Unknown';
      categoryValues[category] = (categoryValues[category] || 0) + value;
    });

    return {
      total_value: totalValue,
      total_products: totalProducts,
      category_breakdown: categoryValues,
      average_value_per_product:
        totalProducts > 0 ? totalValue / totalProducts : 0,
    };
  }

  private async loadBatchCompliance(practiceId: string) {
    const { data } = await supabase
      .from('product_batches')
      .select('expiry_date, quality_check_passed, status')
      .eq('practice_id', practiceId)
      .eq('status', 'active');

    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    let totalBatches = 0;
    let expiringSoon = 0;
    let expired = 0;
    let qualityIssues = 0;

    data?.forEach(batch => {
      totalBatches++;

      const expiryDate = new Date(batch.expiry_date);
      if (expiryDate <= now) expired++;
      else if (expiryDate <= thirtyDaysFromNow) expiringSoon++;

      if (batch.quality_check_passed === false) qualityIssues++;
    });

    return {
      total_batches: totalBatches,
      expiring_soon: expiringSoon,
      expired: expired,
      quality_issues: qualityIssues,
      compliance_rate:
        totalBatches > 0
          ? ((totalBatches - expired - qualityIssues) / totalBatches) * 100
          : 100,
    };
  }

  private async loadSupplierContracts() {
    const { data } = await supabase
      .from('suppliers')
      .select(
        `
        name,
        integration_type,
        order_method,
        last_sync_at,
        minimum_order_amount,
        payment_terms,
        supplier_products(id)
      `
      )
      .eq('is_active', true)
      .limit(10);

    return {
      headers: [
        'Supplier',
        'Type',
        'Method',
        'Products',
        'Min Order',
        'Payment Terms',
        'Last Sync',
      ],
      rows:
        data?.map(supplier => [
          supplier.name,
          supplier.integration_type,
          supplier.order_method,
          (supplier.supplier_products as any[])?.length || 0,
          `€${supplier.minimum_order_amount || 0}`,
          `${supplier.payment_terms || 30} days`,
          supplier.last_sync_at
            ? new Date(supplier.last_sync_at).toLocaleDateString()
            : 'Never',
        ]) || [],
    };
  }

  private async loadStockRotation(practiceId: string) {
    const { data } = await supabase
      .from('product_batches')
      .select(
        `
        created_at,
        received_date,
        products!inner(category)
      `
      )
      .eq('practice_id', practiceId)
      .eq('status', 'depleted')
      .gte(
        'created_at',
        new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      );

    const categoryRotation: Record<
      string,
      { total_days: number; count: number }
    > = {};

    data?.forEach(batch => {
      if (!batch.created_at || !batch.received_date) return;
      const category = (batch.products as any).category || 'Unknown';
      const shelfLifeDays = Math.ceil(
        (new Date(batch.created_at).getTime() -
          new Date(batch.received_date).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (!categoryRotation[category]) {
        categoryRotation[category] = { total_days: 0, count: 0 };
      }

      categoryRotation[category].total_days += shelfLifeDays;
      categoryRotation[category].count++;
    });

    return {
      chart_type: 'bar',
      labels: Object.keys(categoryRotation),
      data: Object.values(categoryRotation).map(cat =>
        cat.count > 0 ? Math.round(cat.total_days / cat.count) : 0
      ),
      title: 'Average Shelf Life by Category (days)',
    };
  }

  private async loadAuditNotifications(practiceId: string) {
    const { data } = await supabase
      .from('counting_sessions')
      .select(
        `
        name,
        status,
        total_products_counted,
        products_with_variance,
        total_variance_value,
        completed_at,
        practice_locations!inner(name)
      `
      )
      .eq('practice_id', practiceId)
      .eq('status', 'completed')
      .gte(
        'completed_at',
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('completed_at', { ascending: false })
      .limit(10);

    return {
      items:
        data?.map(session => ({
          session_name: session.name,
          location: (session.practice_locations as any).name,
          products_counted: session.total_products_counted,
          variances: session.products_with_variance ?? 0,
          variance_value: session.total_variance_value,
          completed_at: session.completed_at,
          status: (session.products_with_variance ?? 0) > 0 ? 'warning' : 'success',
        })) || [],
    };
  }

  private getWidgetTitle(widgetId: string): string {
    const titles: Record<string, string> = {
      'low-stock-alerts': t('dashboard.widgets.lowStockAlerts'),
      'expiring-products': t('dashboard.widgets.expiringProducts'),
      'order-suggestions': t('dashboard.widgets.orderSuggestions'),
      'active-order-lists': t('dashboard.widgets.activeOrderLists'),
      'pending-deliveries': t('dashboard.widgets.pendingDeliveries'),
      'stock-trends': t('dashboard.widgets.stockTrends'),
      'supplier-performance': t('dashboard.widgets.supplierPerformance'),
      'cost-analysis': t('dashboard.widgets.costAnalysis'),
      'error-alerts': t('dashboard.widgets.errorAlerts'),
      'pending-orders': t('dashboard.widgets.pendingOrders'),
      'inventory-value': t('dashboard.widgets.inventoryValue'),
      'batch-compliance': t('dashboard.widgets.batchCompliance'),
      'supplier-contracts': t('dashboard.widgets.supplierContracts'),
      'stock-rotation': t('dashboard.widgets.stockRotation'),
      'audit-notifications': t('dashboard.widgets.auditNotifications'),
    };

    return titles[widgetId] || widgetId;
  }

  private getQuickActions(role: UserRole) {
    const quickActions = roleDashboardConfig.getQuickActions(role);

    return quickActions.map(action => ({
      id: action.id,
      label: t(action.labelKey),
      icon: action.icon,
      route: action.route,
      color: action.color,
      type: action.type,
    }));
  }

  private async loadAlerts(practiceId: string, role: UserRole) {
    const alerts = [];

    try {
      // Low stock alert for all roles
      const { data: lowStock } = await supabase
        .from('stock_levels')
        .select('id')
        .eq('practice_id', practiceId)
        .filter('current_quantity', 'lte', 'minimum_quantity')
        .limit(1);

      if (lowStock && lowStock.length > 0) {
        alerts.push({
          id: 'low-stock',
          type: 'warning' as const,
          message: t('dashboard.alerts.lowStockMessage'),
          action: '/inventory/levels',
          actionLabel: t('dashboard.alerts.viewStock'),
        });
      }

      // Role-specific alerts
      if (role === 'manager' || role === 'owner') {
        const { data: failedOrders } = await supabase
          .from('supplier_orders')
          .select('id')
          .eq('status', 'failed')
          .limit(1);

        if (failedOrders && failedOrders.length > 0) {
          alerts.push({
            id: 'failed-orders',
            type: 'error' as const,
            message: t('dashboard.alerts.failedOrdersMessage'),
            action: '/orders',
            actionLabel: t('dashboard.alerts.viewOrders'),
          });
        }
      }

      if (role === 'owner') {
        const { data: expiredBatches } = await supabase
          .from('product_batches')
          .select('id')
          .eq('practice_id', practiceId)
          .lt('expiry_date', new Date().toISOString())
          .eq('status', 'active')
          .limit(1);

        if (expiredBatches && expiredBatches.length > 0) {
          alerts.push({
            id: 'expired-batches',
            type: 'error' as const,
            message: t('dashboard.alerts.expiredBatchesMessage'),
            action: '/inventory/batches',
            actionLabel: t('dashboard.alerts.viewBatches'),
          });
        }
      }
    } catch (error) {
      dashboardLogger.error('Error loading alerts:', error as Record<string, unknown>);
    }

    return alerts;
  }

  // Additional widget loaders for new roles

  // LOGISTICS role widget loaders
  private async loadStockMovements(practiceId: string) {
    const { data } = await supabase
      .from('stock_movements')
      .select(
        `
        movement_type,
        quantity_change,
        reason,
        created_at,
        products!inner(name),
        practice_locations!inner(name)
      `
      )
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      items:
        data?.map(movement => ({
          product_name: (movement.products as any).name,
          location: (movement.practice_locations as any).name,
          movement_type: movement.movement_type,
          quantity_change: movement.quantity_change,
          reason: movement.reason || 'Manual adjustment',
          timestamp: movement.created_at,
        })) || [],
    };
  }

  private async loadLocationOverview(practiceId: string) {
    const { data } = await supabase
      .from('stock_levels')
      .select(
        `
        current_quantity,
        practice_locations!inner(name)
      `
      )
      .eq('practice_id', practiceId);

    const locationTotals: Record<string, number> = {};
    data?.forEach(item => {
      const location = (item.practice_locations as any).name;
      locationTotals[location] =
        (locationTotals[location] || 0) + Number(item.current_quantity);
    });

    return {
      chart_type: 'doughnut',
      labels: Object.keys(locationTotals),
      data: Object.values(locationTotals),
      total: Object.values(locationTotals).reduce((sum, val) => sum + val, 0),
    };
  }

  private async loadTransportStatus(practiceId: string) {
    const { data } = await supabase
      .from('supplier_orders')
      .select(
        `
        status,
        order_lists!inner(practice_id)
      `
      )
      .eq('order_lists.practice_id', practiceId)
      .in('status', ['sent', 'in_transit', 'delivered']);

    const statusCounts =
      data?.reduce((acc: Record<string, number>, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}) || {};

    return {
      in_transit: statusCounts.in_transit || 0,
      delivered_today: statusCounts.delivered || 0,
      pending_delivery: statusCounts.sent || 0,
      total_active: Object.values(statusCounts).reduce(
        (sum: number, val) => sum + val,
        0
      ),
    };
  }

  // MEMBER role widget loaders
  private async loadStockOverview(practiceId: string) {
    const { data } = await supabase
      .from('stock_levels')
      .select('current_quantity, minimum_quantity')
      .eq('practice_id', practiceId);

    const totalItems = data?.length || 0;
    const lowStockItems =
      data?.filter(
        item => (item.current_quantity ?? 0) <= (item.minimum_quantity || 0)
      ).length || 0;
    const outOfStockItems =
      data?.filter(item => (item.current_quantity ?? 0) <= 0).length || 0;

    return {
      total_items: totalItems,
      low_stock_items: lowStockItems,
      out_of_stock_items: outOfStockItems,
      healthy_stock: totalItems - lowStockItems - outOfStockItems,
    };
  }

  private async loadMyTasks(practiceId: string) {
    // Deze zou gekoppeld kunnen worden aan een task systeem
    // Voor nu simuleren we enkele basis taken
    const tasks = [
      {
        id: 'count-location-1',
        title: 'Voorraad tellen locatie 1',
        priority: 'high',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'counting',
      },
      {
        id: 'receive-order-123',
        title: 'Bestelling #123 ontvangen',
        priority: 'medium',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'receiving',
      },
    ];

    return {
      items: tasks.map(task => ({
        ...task,
        days_until_due: Math.ceil(
          (new Date(task.due_date).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        ),
      })),
    };
  }

  // GUEST role widget loaders
  private async loadPublicInfo(practiceId: string) {
    return {
      practice_name: 'Demo Practice',
      status: 'Active',
      last_updated: new Date().toISOString(),
      public_info: 'Welcome to our inventory system',
    };
  }

  // PLATFORM_OWNER role widget loaders
  private async loadSystemOverview() {
    // Deze zouden echte platform metrics moeten zijn
    return {
      total_practices: 150,
      active_users: 1200,
      total_transactions: 50000,
      system_uptime: 99.9,
      storage_used: '85%',
      api_calls_today: 25000,
    };
  }

  private async loadUserAnalytics() {
    // Simulatie van user analytics data
    const lastWeek = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      chart_type: 'line',
      labels: lastWeek,
      datasets: [
        {
          label: 'Active Users',
          data: [850, 920, 1100, 980, 1200, 1150, 1180],
          color: '#2196F3',
        },
        {
          label: 'New Registrations',
          data: [12, 18, 25, 15, 30, 22, 28],
          color: '#4CAF50',
        },
      ],
    };
  }

  private async loadPlatformHealth() {
    // Platform health check alerts
    const alerts = [
      {
        type: 'success' as const,
        title: 'System Status',
        message: 'All systems operational',
        timestamp: new Date().toISOString(),
      },
      {
        type: 'warning' as const,
        title: 'Database Performance',
        message: 'Slightly elevated response times detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ];

    return { alerts };
  }

  private async loadSubscriptionStatus() {
    // Platform subscription overview
    const subscriptions = [
      {
        practice_name: 'Practice A',
        plan: 'Professional',
        status: 'Active',
        billing_period: 'Monthly',
        amount: '€99',
        next_billing: '2024-02-15',
      },
      {
        practice_name: 'Practice B',
        plan: 'Enterprise',
        status: 'Active',
        billing_period: 'Yearly',
        amount: '€999',
        next_billing: '2024-05-20',
      },
    ];

    return {
      headers: [
        'Practice',
        'Plan',
        'Status',
        'Billing',
        'Amount',
        'Next Billing',
      ],
      rows: subscriptions.map(sub => [
        sub.practice_name,
        sub.plan,
        sub.status,
        sub.billing_period,
        sub.amount,
        sub.next_billing,
      ]),
    };
  }
}

export const practiceDashboardService = new PracticeDashboardService();
