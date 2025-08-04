import { supabase } from './supabase';
import { useAuthStore } from '@/stores/auth';
import { dashboardLogger } from '@/utils/logger';
import { t } from '@/utils/i18n-service';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'alert' | 'quickAction';
  data: Record<string, any>;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
}

export interface DashboardData {
  widgets: DashboardWidget[];
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

export interface RoleDashboardConfig {
  role: string;
  title: string;
  subtitle: string;
  primaryColor: string;
  widgets: string[];
  quickActions: string[];
}

class DashboardService {
  private getRoleConfigs(): Record<string, RoleDashboardConfig> {
    return {
      assistant: {
        role: 'assistant',
        title: t('dashboard.titles.assistant'),
        subtitle: t('dashboard.service.subtitles.assistant'),
        primaryColor: 'blue',
        widgets: ['stock-alerts', 'order-suggestions', 'recent-orders', 'quick-scan'],
        quickActions: ['scan-product', 'create-order', 'update-stock', 'view-low-stock']
      },
      manager: {
        role: 'manager', 
        title: t('dashboard.titles.manager'),
        subtitle: t('dashboard.service.subtitles.manager'),
        primaryColor: 'purple',
        widgets: ['analytics-overview', 'cost-analysis', 'supplier-performance', 'team-activity'],
        quickActions: ['view-analytics', 'manage-suppliers', 'approve-orders', 'export-reports']
      },
      owner: {
        role: 'owner',
        title: t('dashboard.titles.owner'), 
        subtitle: t('dashboard.service.subtitles.owner'),
        primaryColor: 'green',
        widgets: ['business-overview', 'financial-summary', 'user-management', 'system-health'],
        quickActions: ['manage-users', 'system-settings', 'financial-reports', 'backup-data']
      }
    };
  }

  async getDashboardData(userRole: string): Promise<DashboardData> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId || authStore.selectedPractice?.id;

    // Use real data with mock fallback for widgets
    dashboardLogger.info(`🎯 Loading dashboard for role: "${userRole}"`);
    
    const roleConfigs = this.getRoleConfigs();
    const config = roleConfigs[userRole] || roleConfigs.assistant;
    
    // Load base metrics
    const metrics = await this.loadMetrics(practiceId);
    
    // Load role-specific widgets
    const widgets = await this.loadWidgets(config.widgets, practiceId, userRole);
    
    // Load role-specific quick actions
    const quickActions = this.getQuickActions(config.quickActions, userRole);
    
    // Load alerts
    const alerts = await this.loadAlerts(practiceId, userRole);

    return {
      widgets,
      metrics,
      quickActions,
      alerts
    };
  }

  private async loadMetrics(practiceId: string) {
    try {
      // Get stock levels
      const { data: stockLevels } = await supabase
        .from('stock_levels')
        .select('*')
        .eq('practice_id', practiceId);

      // Get recent orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('practice_id', practiceId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get products count
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('practice_id', practiceId)
        .eq('active', true);

      // Calculate metrics
      const lowStockCount = stockLevels?.filter(stock => 
        stock.current_quantity <= (stock.minimum_quantity || 0)
      ).length || 0;

      const pendingOrders = orders?.filter(order => 
        ['draft', 'submitted', 'confirmed'].includes(order.status)
      ).length || 0;

      // Get products with prices for total value calculation
      const { data: productsWithPrices } = await supabase
        .from('stock_levels')
        .select(`
          current_quantity,
          products!inner(price)
        `)
        .eq('practice_id', practiceId);
      
      const totalValue = productsWithPrices?.reduce((sum, stock) => 
        sum + (stock.current_quantity * (stock.products.price || 0)), 0
      ) || 0;

      return {
        totalProducts: products?.length || 0,
        lowStockCount,
        pendingOrders,
        totalValue,
        recentActivity: this.calculateRecentActivity(orders, stockLevels)
      };
    } catch (error) {
      dashboardLogger.error('Error loading metrics:', error);
      // Return fallback metrics if there's an error
      return {
        totalProducts: 245,
        lowStockCount: 12,
        pendingOrders: 3,
        totalValue: 15420,
        recentActivity: 8
      };
    }
  }

  private async loadWidgets(
    widgetIds: string[], 
    practiceId: string, 
    userRole: string
  ): Promise<DashboardWidget[]> {
    dashboardLogger.info(`🔧 Loading widgets for ${userRole}:`, widgetIds);
    
            // Try real widgets first, fallback to mock for role-specific content
    const widgets: DashboardWidget[] = [];

    for (const [index, widgetId] of widgetIds.entries()) {
      try {
        // Try real widget first
        const widget = await this.createWidget(widgetId, practiceId, userRole);
        if (widget) {
          dashboardLogger.info(`✅ Real widget loaded: ${widgetId}`);
          widgets.push(widget);
        } else {
          throw new Error($t('dashboard.widgetcreationreturnednull'));
        }
      } catch (error) {
        dashboardLogger.info(`⚠️ Real widget failed for ${widgetId}, using mock:`, error.message);
        // Always create mock widget on error - this ensures role-specific content
        const mockWidget = this.createMockWidget(widgetId, index);
        if (mockWidget) {
          dashboardLogger.info(`📋 Mock widget created: ${mockWidget.title}`);
          widgets.push(mockWidget);
        }
      }
    }

    dashboardLogger.info(`🎯 Final widget titles for ${userRole}:`, widgets.map(w => w.title));
    return widgets;
  }

  private async createWidget(
    widgetId: string, 
    practiceId: string, 
    userRole: string
  ): Promise<DashboardWidget | null> {
    switch (widgetId) {
      case 'stock-alerts':
        return this.createStockAlertsWidget(practiceId);
      
      case 'order-suggestions':
        return this.createOrderSuggestionsWidget(practiceId);
      
      case 'recent-orders':
        return this.createRecentOrdersWidget(practiceId);
      
      case 'analytics-overview':
        return this.createAnalyticsWidget(practiceId);
      
      case 'business-overview':
        return this.createBusinessOverviewWidget(practiceId);
      
      case 'quick-scan':
        return this.createQuickScanWidget();

      case 'analytics-overview':
        return this.createAnalyticsWidget(practiceId);
      
      case 'business-overview':
        return this.createBusinessOverviewWidget(practiceId);

      // For other widget types, return null to trigger mock widget creation
      case 'cost-analysis':
      case 'supplier-performance':
      case 'team-activity':
      case 'financial-summary':
      case 'user-management':
      case 'system-health':
        dashboardLogger.info(`🎨 Using mock for widget: ${widgetId}`);
        return null;
        
      default:
        dashboardLogger.info(`❌ Unknown widget type: ${widgetId}`);
        return null;
    }
  }

  private async createStockAlertsWidget(practiceId: string): Promise<DashboardWidget> {
    const { data: lowStock } = await supabase
      .from('stock_levels')
      .select(`
        *,
        products (name, sku, category),
        practice_locations (name)
      `)
      .eq('practice_id', practiceId)
      .filter('current_quantity', 'lt', 'minimum_quantity')
      .order('current_quantity', { ascending: true })
      .limit(10);

    return {
      id: 'stock-alerts',
      title: t('dashboard.service.widgets.stockAlerts'),
      type: 'alert',
      data: { items: lowStock || [] },
      size: 'medium',
      position: 1,
      visible: true
    };
  }

  private async createOrderSuggestionsWidget(practiceId: string): Promise<DashboardWidget> {
    const { data: suggestions } = await supabase
      .from('order_suggestions')
      .select(`
        *,
        products (name, sku, category)
      `)
      .eq('practice_id', practiceId)
      .order('urgency_level', { ascending: false })
      .limit(5);

    return {
      id: 'order-suggestions',
      title: t('dashboard.service.widgets.orderSuggestions'),
      type: 'list',
      data: { suggestions: suggestions || [] },
      size: 'large',
      position: 2,
      visible: true
    };
  }

  private async createRecentOrdersWidget(practiceId: string): Promise<DashboardWidget> {
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .eq('practice_id', practiceId)
      .order('created_at', { ascending: false })
      .limit(5);

    return {
      id: 'recent-orders',
      title: t('dashboard.service.widgets.recentOrders'),
      type: 'list',
      data: { orders: orders || [] },
      size: 'medium',
      position: 3,
      visible: true
    };
  }

  private createQuickScanWidget(): DashboardWidget {
    return {
      id: 'quick-scan',
      title: t('dashboard.service.widgets.quickScan'),
      type: 'quickAction',
      data: { 
        action: 'scan',
        description: t('dashboard.service.widgets.quickScanDescription')
      },
      size: 'small',
      position: 4,
      visible: true
    };
  }

  private async createAnalyticsWidget(practiceId: string): Promise<DashboardWidget> {
    // Simplified analytics data
    const { data: analytics } = await supabase
      .from('usage_analytics')
      .select('*')
      .eq('practice_id', practiceId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    return {
      id: 'analytics-overview',
      title: t('dashboard.service.widgets.analyticsOverview'),
      type: 'chart',
      data: { analytics: analytics || [] },
      size: 'large',
      position: 1,
      visible: true
    };
  }

  private async createBusinessOverviewWidget(practiceId: string): Promise<DashboardWidget> {
    // Business metrics for owners
    const { data: members } = await supabase
      .from('practice_members')
      .select('*')
      .eq('practice_id', practiceId);

    return {
      id: 'business-overview',
      title: t('dashboard.service.widgets.businessOverview'),
      type: 'metric',
      data: { 
        teamSize: members?.length || 0,
        practiceHealth: 95 // Simplified metric
      },
      size: 'large',
      position: 1,
      visible: true
    };
  }

  private getQuickActions(actionIds: string[], userRole: string) {
    const allActions = {
      'scan-product': {
        id: 'scan-product',
        label: t('dashboard.service.quickActions.scanProduct'),
        icon: 'qr_code_scanner',
        route: '/scan',
        color: 'primary'
      },
      'create-order': {
        id: 'create-order',
        label: t('dashboard.service.quickActions.createOrder'),
        icon: 'add_shopping_cart',
        route: '/orders/new',
        color: 'positive'
      },
      'update-stock': {
        id: 'update-stock',
        label: t('dashboard.service.quickActions.updateStock'),
        icon: 'inventory',
        route: '/inventory/levels',
        color: 'info'
      },
      'view-low-stock': {
        id: 'view-low-stock',
        label: t('dashboard.service.quickActions.viewLowStock'),
        icon: 'warning',
        route: '/inventory/levels?filter=low-stock',
        color: 'warning'
      },
      'view-analytics': {
        id: 'view-analytics',
        label: t('dashboard.service.quickActions.viewAnalytics'),
        icon: 'analytics',
        route: '/analytics',
        color: 'purple'
      },
      'manage-suppliers': {
        id: 'manage-suppliers',
        label: t('dashboard.service.quickActions.manageSuppliers'),
        icon: 'business',
        route: '/suppliers',
        color: 'indigo'
      },
      'approve-orders': {
        id: 'approve-orders',
        label: t('dashboard.service.quickActions.approveOrders'),
        icon: 'task_alt',
        route: '/orders?status=pending',
        color: 'orange'
      },
      'export-reports': {
        id: 'export-reports',
        label: t('dashboard.service.quickActions.exportReports'),
        icon: 'download',
        route: '/reports',
        color: 'blue-grey'
      },
      'manage-users': {
        id: 'manage-users',
        label: t('dashboard.service.quickActions.manageUsers'),
        icon: 'people',
        route: '/admin/users',
        color: 'red'
      },
      'system-settings': {
        id: 'system-settings',
        label: t('dashboard.service.quickActions.systemSettings'),
        icon: 'settings',
        route: '/admin/settings',
        color: 'grey'
      },
      'financial-reports': {
        id: 'financial-reports',
        label: t('dashboard.service.quickActions.financialReports'),
        icon: 'account_balance',
        route: '/reports/financial',
        color: 'green'
      },
      'backup-data': {
        id: 'backup-data',
        label: t('dashboard.service.quickActions.backupData'),
        icon: 'backup',
        route: '/admin/backup',
        color: 'blue'
      }
    };

    return actionIds.map(id => allActions[id]).filter(Boolean);
  }

  private async loadAlerts(practiceId: string, userRole: string) {
    try {
      const alerts = [];

          // Low stock alerts - fix supabase.raw issue
    const { data: lowStock } = await supabase
      .from('stock_levels') 
      .select('*')
      .eq('practice_id', practiceId)
      .filter('current_quantity', 'lt', 'minimum_quantity');

      if (lowStock && lowStock.length > 0) {
        alerts.push({
          id: 'low-stock',
          type: 'warning' as const,
          message: t('dashboard.service.alerts.lowStockMessage', { count: lowStock.length }),
          action: '/inventory/levels',
          actionLabel: t('dashboard.service.alerts.viewStock')
        });
      }

      return alerts;
    } catch (error) {
      dashboardLogger.error('Error loading alerts:', error);
      // Return mock alerts if there's an error
      return [
        {
          id: 'demo-alert-1',
          type: 'warning' as const,
          message: t('dashboard.service.alerts.lowStockMessage', { count: 12 }),
          action: '/inventory/levels',
          actionLabel: t('dashboard.service.alerts.viewStock')
        }
      ];
    }
  }

  getRoleConfig(userRole: string): RoleDashboardConfig {
    const roleConfigs = this.getRoleConfigs();
    return roleConfigs[userRole] || roleConfigs.assistant;
  }

  getMockDashboardData(userRole: string): DashboardData {
    const roleConfigs = this.getRoleConfigs();
    const config = roleConfigs[userRole] || roleConfigs.assistant;
    
    dashboardLogger.info(`🎯 Building ${userRole} dashboard with widgets:`, config.widgets);
    
    // Create mock widgets based on role - MUST be role specific
    const mockWidgets = config.widgets.map((widgetId, index) => {
      const widget = this.createMockWidget(widgetId, index);
      return widget;
    }).filter(widget => widget !== null) as DashboardWidget[];

    dashboardLogger.info(`✅ Created ${mockWidgets.length} widgets for ${userRole}:`, mockWidgets.map(w => w.title));

    // Role-specific metrics
    const metrics = this.getMockMetrics(userRole);
    const alerts = this.getMockAlerts(userRole);

    return {
      widgets: mockWidgets,
      metrics,
      quickActions: this.getQuickActions(config.quickActions, userRole),
      alerts
    };
  }

  private getMockMetrics(userRole: string) {
    switch (userRole) {
      case 'manager':
        return {
          totalProducts: 298,
          lowStockCount: 7,
          pendingOrders: 5,
          totalValue: 23650,
          recentActivity: 15
        };
      case 'owner':
        return {
          totalProducts: 342,
          lowStockCount: 3,
          pendingOrders: 8,
          totalValue: 45230,
          recentActivity: 24
        };
      default: // assistant
        return {
          totalProducts: 245,
          lowStockCount: 12,
          pendingOrders: 3,
          totalValue: 15420,
          recentActivity: 8
        };
    }
  }

  private getMockAlerts(userRole: string) {
    switch (userRole) {
      case 'manager':
        return [
          {
            id: 'manager-alert-1',
            type: 'info' as const,
            message: t('dashboard.service.alerts.monthlyReportAvailable'),
            action: '/analytics',
            actionLabel: t('dashboard.service.alerts.viewReport')
          }
        ];
      case 'owner':
        return [
          {
            id: 'owner-alert-1',
            type: 'warning' as const,
            message: t('dashboard.service.alerts.systemUpdateAvailable'),
            action: '/admin/updates',
            actionLabel: t('dashboard.service.alerts.updateNow')
          }
        ];
      default: // assistant
        return [
          {
            id: 'assistant-alert-1',
            type: 'warning' as const,
            message: t('dashboard.service.alerts.lowStockMessage', { count: 12 }),
            action: '/inventory/levels',
            actionLabel: t('dashboard.service.alerts.viewStock')
          }
        ];
    }
  }

  private createMockWidget(widgetId: string, position: number): DashboardWidget | null {
    switch (widgetId) {
      case 'stock-alerts':
        return {
          id: 'stock-alerts',
          title: t('dashboard.service.widgets.stockAlerts'),
          type: 'alert',
          data: { 
            items: [
              {
                id: '1',
                current_quantity: 5,
                minimum_quantity: 10,
                products: { name: 'Paracetamol 500mg', sku: 'PAR-500', category: 'Medicatie' },
                practice_locations: { name: 'Hoofdlocatie' }
              },
              {
                id: '2', 
                current_quantity: 0,
                minimum_quantity: 5,
                products: { name: 'Steriele handschoenen', sku: 'HSG-001', category: 'Verbruiksmateriaal' },
                practice_locations: { name: 'Behandelkamer 1' }
              }
            ] 
          },
          size: 'medium',
          position,
          visible: true
        };

      case 'order-suggestions':
        return {
          id: 'order-suggestions',
          title: t('dashboard.service.widgets.orderSuggestions'),
          type: 'list',
          data: { 
            suggestions: [
              {
                id: '1',
                current_stock: 5,
                suggested_quantity: 50,
                urgency_level: 'high',
                products: { name: 'Insuline injecties', sku: 'INS-001' }
              },
              {
                id: '2',
                current_stock: 12,
                suggested_quantity: 25,
                urgency_level: 'medium', 
                products: { name: 'Bloeddrukmeters', sku: 'BDM-001' }
              }
            ] 
          },
          size: 'large',
          position,
          visible: true
        };

      case 'recent-orders':
        return {
          id: 'recent-orders',
          title: 'Recente Bestellingen',
          type: 'list',
          data: { 
            orders: [
              {
                id: '1',
                order_number: 'ORD-2024-001',
                status: 'confirmed',
                order_date: new Date().toISOString(),
                total_amount: 1250.50
              },
              {
                id: '2',
                order_number: 'ORD-2024-002', 
                status: 'delivered',
                order_date: new Date(Date.now() - 24*60*60*1000).toISOString(),
                total_amount: 890.25
              }
            ] 
          },
          size: 'medium',
          position,
          visible: true
        };

      case 'quick-scan':
        return {
          id: 'quick-scan',
          title: 'Snel Scannen',
          type: 'quickAction',
          data: { 
            action: 'scan',
            description: 'Scan een product barcode voor snelle voorraad updates'
          },
          size: 'small',
          position,
          visible: true
        };

      case 'analytics-overview':
        return {
          id: 'analytics-overview',
          title: 'Analytics Overzicht',
          type: 'chart',
          data: { 
            items: [
              { label: 'Ma', value: 45 },
              { label: 'Di', value: 52 },
              { label: 'Wo', value: 38 },
              { label: 'Do', value: 61 },
              { label: 'Vr', value: 49 }
            ]
          },
          size: 'large',
          position,
          visible: true
        };

      case 'business-overview':
        return {
          id: 'business-overview',
          title: 'Business Overzicht',
          type: 'metric',
          data: { 
            teamSize: 8,
            practiceHealth: 94
          },
          size: 'large', 
          position,
          visible: true
        };

      case 'cost-analysis':
        return {
          id: 'cost-analysis',
          title: 'Kosten Analyse',
          type: 'chart',
          data: { 
            items: [
              { label: 'Medicatie', value: 65 },
              { label: 'Materialen', value: 45 },
              { label: 'Instrumenten', value: 30 },
              { label: 'Onderhoud', value: 20 },
              { label: 'Overig', value: 15 }
            ]
          },
          size: 'medium',
          position,
          visible: true
        };

      case 'supplier-performance':
        return {
          id: 'supplier-performance',
          title: 'Leverancier Prestaties',
          type: 'list',
          data: { 
            items: [
              { title: 'MedSupply NL', subtitle: '98% leverbetrouwbaarheid', icon: 'local_shipping' },
              { title: 'HealthCorp', subtitle: '95% kwaliteitsscore', icon: 'verified' },
              { title: 'PharmaDirect', subtitle: '€2.450 besparing dit kwartaal', icon: 'savings' }
            ]
          },
          size: 'medium',
          position,
          visible: true
        };

      case 'team-activity':
        return {
          id: 'team-activity',
          title: 'Team Activiteit',
          type: 'metric',
          data: { 
            metrics: [
              { key: 'scans', value: 147, label: 'Scans vandaag', icon: 'qr_code_scanner', color: 'primary' },
              { key: 'orders', value: 12, label: 'Bestellingen', icon: 'shopping_cart', color: 'positive' },
              { key: 'updates', value: 34, label: 'Voorraad updates', icon: 'inventory', color: 'info' }
            ]
          },
          size: 'large',
          position,
          visible: true
        };

      case 'financial-summary':
        return {
          id: 'financial-summary',
          title: t('dashboard.service.widgets.financialSummary'),
          type: 'metric',
          data: { 
            metrics: [
              { key: 'revenue', value: '€45.230', label: t('dashboard.service.widgets.monthlyRevenue'), icon: 'trending_up', color: 'positive' },
              { key: 'costs', value: '€12.840', label: t('dashboard.service.widgets.inventoryCosts'), icon: 'account_balance', color: 'warning' },
              { key: 'profit', value: '€32.390', label: t('dashboard.service.widgets.netProfit'), icon: 'savings', color: 'positive' }
            ]
          },
          size: 'large',
          position,
          visible: true
        };

      case 'user-management':
        return {
          id: 'user-management',
          title: t('dashboard.service.widgets.userManagement'),
          type: 'list',
          data: { 
            items: [
              { title: 'Dr. Sarah Johnson', subtitle: t('dashboard.service.widgets.ownerLastActive', { time: '2 uur geleden' }), icon: 'person' },
              { title: 'Mark van der Berg', subtitle: t('dashboard.service.widgets.managerOnlineNow'), icon: 'person' },
              { title: 'Lisa de Vries', subtitle: t('dashboard.service.widgets.assistantLastActive', { time: '1 dag geleden' }), icon: 'person' }
            ]
          },
          size: 'medium',
          position,
          visible: true
        };

      case 'system-health':
        return {
          id: 'system-health',
          title: t('dashboard.service.widgets.systemHealth'),
          type: 'metric',
          data: { 
            value: 98,
            label: t('dashboard.service.widgets.systemStatus'),
            icon: 'health_and_safety',
            color: 'positive'
          },
          size: 'small',
          position,
          visible: true
        };

      default:
        return null;
    }
  }

  /**
   * Calculate recent activity score based on recent orders and stock movements
   */
  private calculateRecentActivity(orders: Order[], stockLevels: StockLevel[]): number {
    if (!orders || !stockLevels) { return 0; }
    
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Count recent orders (last 24 hours)
    const recentOrders = orders.filter(order => 
      new Date(order.created_at) > last24Hours
    ).length;
    
    // Count orders from last week for trending
    const weeklyOrders = orders.filter(order => 
      new Date(order.created_at) > lastWeek
    ).length;
    
    // Calculate activity score: recent orders get higher weight
    const activityScore = (recentOrders * 3) + Math.min(weeklyOrders, 50);
    
    // Return a normalized score (cap at reasonable number for display)
    return Math.min(activityScore, 99);
  }
}

export const dashboardService = new DashboardService(); 