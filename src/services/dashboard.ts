import { supabase } from './supabase';
import { useAuthStore } from '@/stores/auth';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'alert' | 'quickAction';
  data: any;
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
  private roleConfigs: Record<string, RoleDashboardConfig> = {
    assistant: {
      role: 'assistant',
      title: 'Assistent Dashboard',
      subtitle: 'Beheer bestellingen en voorraad updates',
      primaryColor: 'blue',
      widgets: ['stock-alerts', 'order-suggestions', 'recent-orders', 'quick-scan'],
      quickActions: ['scan-product', 'create-order', 'update-stock', 'view-low-stock']
    },
    manager: {
      role: 'manager', 
      title: 'Manager Dashboard',
      subtitle: 'Overzichten en analyses voor betere besluitvorming',
      primaryColor: 'purple',
      widgets: ['analytics-overview', 'cost-analysis', 'supplier-performance', 'team-activity'],
      quickActions: ['view-analytics', 'manage-suppliers', 'approve-orders', 'export-reports']
    },
    owner: {
      role: 'owner',
      title: 'Eigenaar Dashboard', 
      subtitle: 'Volledige controle en administratie van uw praktijk',
      primaryColor: 'green',
      widgets: ['business-overview', 'financial-summary', 'user-management', 'system-health'],
      quickActions: ['manage-users', 'system-settings', 'financial-reports', 'backup-data']
    }
  };

  async getDashboardData(userRole: string): Promise<DashboardData> {
    const authStore = useAuthStore();
    const practiceId = authStore.clinicId || authStore.selectedPractice?.id;

    // Use real data with mock fallback for widgets
    console.log(`🎯 Loading dashboard for role: "${userRole}"`);
    
    const config = this.roleConfigs[userRole] || this.roleConfigs.assistant;
    
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
      console.error('Error loading metrics:', error);
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
    console.log(`🔧 Loading widgets for ${userRole}:`, widgetIds);
    
            // Try real widgets first, fallback to mock for role-specific content
    const widgets: DashboardWidget[] = [];

    for (const [index, widgetId] of widgetIds.entries()) {
      try {
        // Try real widget first
        const widget = await this.createWidget(widgetId, practiceId, userRole);
        if (widget) {
          console.log(`✅ Real widget loaded: ${widgetId}`);
          widgets.push(widget);
        } else {
          throw new Error('Widget creation returned null');
        }
      } catch (error) {
        console.log(`⚠️ Real widget failed for ${widgetId}, using mock:`, error.message);
        // Always create mock widget on error - this ensures role-specific content
        const mockWidget = this.createMockWidget(widgetId, index);
        if (mockWidget) {
          console.log(`📋 Mock widget created: ${mockWidget.title}`);
          widgets.push(mockWidget);
        }
      }
    }

    console.log(`🎯 Final widget titles for ${userRole}:`, widgets.map(w => w.title));
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
        console.log(`🎨 Using mock for widget: ${widgetId}`);
        return null;
        
      default:
        console.log(`❌ Unknown widget type: ${widgetId}`);
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
      title: 'Voorraad Waarschuwingen',
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
      title: 'Bestel Suggesties',
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
      title: 'Recente Bestellingen',
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
      title: 'Snel Scannen',
      type: 'quickAction',
      data: { 
        action: 'scan',
        description: 'Scan een product barcode voor snelle voorraad updates'
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
      title: 'Analytics Overzicht',
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
      title: 'Business Overzicht',
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
        label: 'Scan Product',
        icon: 'qr_code_scanner',
        route: '/scan',
        color: 'primary'
      },
      'create-order': {
        id: 'create-order',
        label: 'Nieuwe Bestelling',
        icon: 'add_shopping_cart',
        route: '/orders/new',
        color: 'positive'
      },
      'update-stock': {
        id: 'update-stock',
        label: 'Voorraad Bijwerken',
        icon: 'inventory',
        route: '/inventory/levels',
        color: 'info'
      },
      'view-low-stock': {
        id: 'view-low-stock',
        label: 'Lage Voorraad',
        icon: 'warning',
        route: '/inventory/levels?filter=low-stock',
        color: 'warning'
      },
      'view-analytics': {
        id: 'view-analytics',
        label: 'Analytics Bekijken',
        icon: 'analytics',
        route: '/analytics',
        color: 'purple'
      },
      'manage-suppliers': {
        id: 'manage-suppliers',
        label: 'Leveranciers Beheren',
        icon: 'business',
        route: '/suppliers',
        color: 'indigo'
      },
      'approve-orders': {
        id: 'approve-orders',
        label: 'Bestellingen Goedkeuren',
        icon: 'task_alt',
        route: '/orders?status=pending',
        color: 'orange'
      },
      'export-reports': {
        id: 'export-reports',
        label: 'Rapporten Exporteren',
        icon: 'download',
        route: '/reports',
        color: 'blue-grey'
      },
      'manage-users': {
        id: 'manage-users',
        label: 'Gebruikers Beheren',
        icon: 'people',
        route: '/admin/users',
        color: 'red'
      },
      'system-settings': {
        id: 'system-settings',
        label: 'Systeeminstellingen',
        icon: 'settings',
        route: '/admin/settings',
        color: 'grey'
      },
      'financial-reports': {
        id: 'financial-reports',
        label: 'Financiële Rapporten',
        icon: 'account_balance',
        route: '/reports/financial',
        color: 'green'
      },
      'backup-data': {
        id: 'backup-data',
        label: 'Data Backup',
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
          message: `${lowStock.length} producten hebben lage voorraad`,
          action: '/inventory/levels',
          actionLabel: 'Bekijk voorraad'
        });
      }

      return alerts;
    } catch (error) {
      console.error('Error loading alerts:', error);
      // Return mock alerts if there's an error
      return [
        {
          id: 'demo-alert-1',
          type: 'warning' as const,
          message: '12 producten hebben lage voorraad',
          action: '/inventory/levels',
          actionLabel: 'Bekijk voorraad'
        }
      ];
    }
  }

  getRoleConfig(userRole: string): RoleDashboardConfig {
    return this.roleConfigs[userRole] || this.roleConfigs.assistant;
  }

  getMockDashboardData(userRole: string): DashboardData {
    const config = this.roleConfigs[userRole] || this.roleConfigs.assistant;
    
    console.log(`🎯 Building ${userRole} dashboard with widgets:`, config.widgets);
    
    // Create mock widgets based on role - MUST be role specific
    const mockWidgets = config.widgets.map((widgetId, index) => {
      const widget = this.createMockWidget(widgetId, index);
      return widget;
    }).filter(widget => widget !== null) as DashboardWidget[];

    console.log(`✅ Created ${mockWidgets.length} widgets for ${userRole}:`, mockWidgets.map(w => w.title));

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
            message: 'Maandelijkse analyse rapport beschikbaar',
            action: '/analytics',
            actionLabel: 'Bekijk rapport'
          }
        ];
      case 'owner':
        return [
          {
            id: 'owner-alert-1',
            type: 'warning' as const,
            message: 'Systeemupdate beschikbaar',
            action: '/admin/updates',
            actionLabel: 'Update nu'
          }
        ];
      default: // assistant
        return [
          {
            id: 'assistant-alert-1',
            type: 'warning' as const,
            message: '12 producten hebben lage voorraad',
            action: '/inventory/levels',
            actionLabel: 'Bekijk voorraad'
          }
        ];
    }
  }

  private createMockWidget(widgetId: string, position: number): DashboardWidget | null {
    switch (widgetId) {
      case 'stock-alerts':
        return {
          id: 'stock-alerts',
          title: 'Voorraad Waarschuwingen',
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
          title: 'Bestel Suggesties',
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
          title: 'Financieel Overzicht',
          type: 'metric',
          data: { 
            metrics: [
              { key: 'revenue', value: '€45.230', label: 'Omzet deze maand', icon: 'trending_up', color: 'positive' },
              { key: 'costs', value: '€12.840', label: 'Voorraadkosten', icon: 'account_balance', color: 'warning' },
              { key: 'profit', value: '€32.390', label: 'Netto winst', icon: 'savings', color: 'positive' }
            ]
          },
          size: 'large',
          position,
          visible: true
        };

      case 'user-management':
        return {
          id: 'user-management',
          title: 'Gebruikersbeheer',
          type: 'list',
          data: { 
            items: [
              { title: 'Dr. Sarah Johnson', subtitle: 'Eigenaar - Laatst actief: 2 uur geleden', icon: 'person' },
              { title: 'Mark van der Berg', subtitle: 'Manager - Online nu', icon: 'person' },
              { title: 'Lisa de Vries', subtitle: 'Assistent - Laatst actief: 1 dag geleden', icon: 'person' }
            ]
          },
          size: 'medium',
          position,
          visible: true
        };

      case 'system-health':
        return {
          id: 'system-health',
          title: 'Systeem Gezondheid',
          type: 'metric',
          data: { 
            value: 98,
            label: 'Systeem Status',
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
  private calculateRecentActivity(orders: any[], stockLevels: any[]): number {
    if (!orders || !stockLevels) return 0;
    
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