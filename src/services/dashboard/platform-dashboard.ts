import { supabase } from '../supabase';
import { dashboardLogger } from '@/utils/logger';
import { t } from '@/utils/i18n-service';

export interface PlatformWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'list' | 'table' | 'system';
  data: Record<string, any>;
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
  loading?: boolean;
  error?: string;
}

export interface PlatformDashboardData {
  widgets: PlatformWidget[];
  systemInfo: {
    version: string;
    buildNumber: string;
    lastDeployment: string;
    uptime: string;
    environment: string;
  };
  platformMetrics: {
    totalPractices: number;
    totalUsers: number;
    activeToday: number;
    totalEvents: number;
    systemHealth: 'healthy' | 'warning' | 'critical';
  };
  quickActions: Array<{
    id: string;
    label: string;
    icon: string;
    route: string;
    color: string;
    permission?: string;
  }>;
}

class PlatformDashboardService {
  private getWidgetConfig(): string[] {
    return [
      'system-health',
      'version-info',
      'platform-audit-logs',
      'customer-management',
      'api-integration-status',
      'performance-metrics',
      'database-status',
      'error-monitoring'
    ];
  }

  async getDashboardData(): Promise<PlatformDashboardData> {
    try {
      dashboardLogger.info('🌐 Loading platform dashboard');
      
      const widgetIds = this.getWidgetConfig();
      
      // Load system info
      const systemInfo = await this.loadSystemInfo();
      
      // Load platform metrics
      const platformMetrics = await this.loadPlatformMetrics();
      
      // Load platform widgets
      const widgets = await this.loadWidgets(widgetIds);
      
      // Load quick actions
      const quickActions = this.getQuickActions();

      return {
        widgets,
        systemInfo,
        platformMetrics,
        quickActions
      };
    } catch (error) {
      dashboardLogger.error('Error loading platform dashboard:', error);
      throw error;
    }
  }

  private async loadSystemInfo() {
    // This would typically come from environment variables or system APIs
    const packageInfo = await import('../../../package.json');
    
    return {
      version: packageInfo.version || '2.1.0',
      buildNumber: process.env.VITE_BUILD_NUMBER || '1234',
      lastDeployment: process.env.VITE_DEPLOYMENT_TIME || new Date().toISOString(),
      uptime: this.getSystemUptime(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  private getSystemUptime(): string {
    // In a real application, this would be calculated from deployment time
    const uptimeMs = Date.now() - new Date('2024-01-01').getTime();
    const days = Math.floor(uptimeMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptimeMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  }

  private async loadPlatformMetrics() {
    try {
      // Get real data from Supabase
      const { count: totalPractices } = await supabase
        .from('practices')
        .select('id', { count: 'exact' });

      const { count: totalUsers } = await supabase
        .from('practice_members')
        .select('user_id', { count: 'exact' });

      const today = new Date().toISOString().split('T')[0];
      const { count: activeToday } = await supabase
        .from('usage_analytics')
        .select('user_id', { count: 'exact' })
        .gte('created_at', today);

      const { count: totalEvents } = await supabase
        .from('usage_analytics')
        .select('id', { count: 'exact' })
        .gte('created_at', today);

      const { count: recentErrors } = await supabase
        .from('activity_log')
        .select('id', { count: 'exact' })
        .ilike('activity_type', '%error%')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      let systemHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (recentErrors && recentErrors > 10) systemHealth = 'warning';
      if (recentErrors && recentErrors > 50) systemHealth = 'critical';

      return {
        totalPractices: totalPractices || 0,
        totalUsers: totalUsers || 0,
        activeToday: activeToday || 0,
        totalEvents: totalEvents || 0,
        systemHealth
      };
    } catch (error) {
      dashboardLogger.error('Error loading platform metrics:', error);
      return {
        totalPractices: 0,
        totalUsers: 0,
        activeToday: 0,
        totalEvents: 0,
        systemHealth: 'critical' as const
      };
    }
  }

  private async loadWidgets(widgetIds: string[]): Promise<PlatformWidget[]> {
    const widgets: PlatformWidget[] = [];

    for (let i = 0; i < widgetIds.length; i++) {
      const widgetId = widgetIds[i];
      try {
        const widget = await this.loadWidget(widgetId, i);
        if (widget) {
          widgets.push(widget);
        }
      } catch (error) {
        dashboardLogger.error(`Error loading platform widget ${widgetId}:`, error);
        // Add error widget
        widgets.push({
          id: widgetId,
          title: this.getWidgetTitle(widgetId),
          type: 'system',
          data: { error: 'Failed to load widget data' },
          size: 'medium',
          position: i,
          visible: true,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return widgets;
  }

  private async loadWidget(widgetId: string, position: number): Promise<PlatformWidget | null> {
    const baseWidget = {
      id: widgetId,
      title: this.getWidgetTitle(widgetId),
      position,
      visible: true,
      loading: false
    };

    switch (widgetId) {
      case 'system-health':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'large' as const,
          data: await this.loadSystemHealth()
        };

      case 'version-info':
        return {
          ...baseWidget,
          type: 'system' as const,
          size: 'medium' as const,
          data: await this.loadVersionInfo()
        };

      case 'platform-audit-logs':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'large' as const,
          data: await this.loadPlatformAuditLogs()
        };

      case 'customer-management':
        return {
          ...baseWidget,
          type: 'table' as const,
          size: 'large' as const,
          data: await this.loadCustomerManagement()
        };

      case 'api-integration-status':
        return {
          ...baseWidget,
          type: 'table' as const,
          size: 'medium' as const,
          data: await this.loadApiIntegrationStatus()
        };

      case 'performance-metrics':
        return {
          ...baseWidget,
          type: 'chart' as const,
          size: 'medium' as const,
          data: await this.loadPerformanceMetrics()
        };

      case 'database-status':
        return {
          ...baseWidget,
          type: 'metric' as const,
          size: 'small' as const,
          data: await this.loadDatabaseStatus()
        };

      case 'error-monitoring':
        return {
          ...baseWidget,
          type: 'list' as const,
          size: 'medium' as const,
          data: await this.loadErrorMonitoring()
        };

      default:
        return null;
    }
  }

  // Platform widget data loaders
  private async loadSystemHealth() {
    const { data: recentErrors } = await supabase
      .from('activity_log')
      .select('activity_type, created_at')
      .ilike('activity_type', '%error%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    const { data: practicesActive } = await supabase
      .from('usage_analytics')
      .select('practice_id')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    const activePractices = new Set(practicesActive?.map(p => p.practice_id)).size;

    // Check database connection health
    const { data: dbHealth } = await supabase
      .from('practices')
      .select('id')
      .limit(1);

    return {
      error_count_24h: recentErrors?.length || 0,
      active_practices_1h: activePractices,
      database_status: dbHealth ? 'connected' : 'disconnected',
      overall_status: recentErrors && recentErrors.length > 20 ? 'warning' : 'healthy',
      last_check: new Date().toISOString()
    };
  }

  private async loadVersionInfo() {
    const packageInfo = await import('../../../package.json');
    
    return {
      app_version: packageInfo.version || '2.1.0',
      build_number: process.env.VITE_BUILD_NUMBER || '1234',
      last_deployment: process.env.VITE_DEPLOYMENT_TIME || new Date().toISOString(),
      database_version: '15.4', // This would typically come from a query
      environment: process.env.NODE_ENV || 'development',
      dependencies: {
        vue: packageInfo.dependencies?.vue || '3.4.0',
        quasar: packageInfo.dependencies?.quasar || '2.14.0',
        supabase: packageInfo.dependencies?.['@supabase/supabase-js'] || '2.38.0'
      }
    };
  }

  private async loadPlatformAuditLogs() {
    const { data } = await supabase
      .from('activity_log')
      .select(`
        activity_type,
        description,
        created_at,
        practices!inner(name),
        user_id
      `)
      .in('activity_type', ['user_created', 'practice_created', 'system_error', 'login_failed'])
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    return {
      items: data?.map(log => ({
        type: log.activity_type,
        description: log.description,
        practice_name: (log.practices as any)?.name || 'System',
        user_id: log.user_id,
        timestamp: log.created_at,
        severity: log.activity_type.includes('error') ? 'error' : 
                 log.activity_type.includes('failed') ? 'warning' : 'info'
      })) || []
    };
  }

  private async loadCustomerManagement() {
    const { data } = await supabase
      .from('practices')
      .select(`
        name,
        email,
        created_at,
        practice_members(user_id),
        practice_locations(id),
        usage_analytics(created_at)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    return {
      headers: ['Practice', 'Email', 'Users', 'Locations', 'Last Activity', 'Created'],
      rows: data?.map(practice => {
        const userCount = (practice.practice_members as any[])?.length || 0;
        const locationCount = (practice.practice_locations as any[])?.length || 0;
        const lastActivity = (practice.usage_analytics as any[])?.length > 0 ? 
          new Date(Math.max(...(practice.usage_analytics as any[]).map((a: any) => new Date(a.created_at).getTime()))).toLocaleDateString() :
          'Never';

        return [
          practice.name,
          practice.email || 'N/A',
          userCount,
          locationCount,
          lastActivity,
          new Date(practice.created_at).toLocaleDateString()
        ];
      }) || []
    };
  }

  private async loadApiIntegrationStatus() {
    const { data } = await supabase
      .from('suppliers')
      .select('integration_type, order_method, sync_enabled, last_sync_at')
      .neq('integration_type', 'manual');

    // Group by integration type and method
    const integrationStats: Record<string, {
      total: number;
      active: number;
      recent_syncs: number;
    }> = {};

    data?.forEach(supplier => {
      const key = `${supplier.integration_type}-${supplier.order_method}`;
      if (!integrationStats[key]) {
        integrationStats[key] = { total: 0, active: 0, recent_syncs: 0 };
      }
      
      integrationStats[key].total++;
      if (supplier.sync_enabled) integrationStats[key].active++;
      if (supplier.last_sync_at && 
          new Date(supplier.last_sync_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        integrationStats[key].recent_syncs++;
      }
    });

    return {
      headers: ['Integration', 'Total', 'Active', 'Recent Syncs', 'Health'],
      rows: Object.entries(integrationStats).map(([key, stats]) => {
        const health = stats.active > 0 ? 
          (stats.recent_syncs / stats.active > 0.8 ? 'Good' : 'Warning') : 
          'Inactive';
        
        return [
          key.replace('-', ' + '),
          stats.total,
          stats.active,
          stats.recent_syncs,
          health
        ];
      })
    };
  }

  private async loadPerformanceMetrics() {
    // Get usage analytics for the last 7 days
    const { data } = await supabase
      .from('usage_analytics')
      .select('created_at, event_type')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Group by day
    const dailyMetrics: Record<string, number> = {};
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      last7Days.push(date);
      dailyMetrics[date] = 0;
    }

    data?.forEach(event => {
      const day = event.created_at.split('T')[0];
      if (dailyMetrics.hasOwnProperty(day)) {
        dailyMetrics[day]++;
      }
    });

    return {
      chart_type: 'line',
      labels: last7Days.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Events',
          data: last7Days.map(date => dailyMetrics[date]),
          color: '#2196F3'
        }
      ],
      total_events: Object.values(dailyMetrics).reduce((sum, val) => sum + val, 0)
    };
  }

  private async loadDatabaseStatus() {
    try {
      // Simple connectivity test
      const start = Date.now();
      const { data } = await supabase
        .from('practices')
        .select('id')
        .limit(1);
      const responseTime = Date.now() - start;

      // Get table sizes (this would require a custom RPC function in production)
      const { data: tableStats } = await supabase.rpc('get_table_stats');

      return {
        status: data ? 'connected' : 'disconnected',
        response_time_ms: responseTime,
        total_tables: tableStats?.length || 0,
        largest_table: tableStats?.[0]?.table_name || 'unknown',
        last_check: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        response_time_ms: null,
        total_tables: 0,
        largest_table: 'unknown',
        last_check: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async loadErrorMonitoring() {
    const { data } = await supabase
      .from('activity_log')
      .select(`
        activity_type,
        description,
        created_at,
        practices!inner(name)
      `)
      .ilike('activity_type', '%error%')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(20);

    // Group errors by type
    const errorGroups: Record<string, { count: number; last_seen: string; practices: Set<string> }> = {};
    
    data?.forEach(error => {
      const type = error.activity_type;
      if (!errorGroups[type]) {
        errorGroups[type] = { count: 0, last_seen: error.created_at, practices: new Set() };
      }
      
      errorGroups[type].count++;
      errorGroups[type].practices.add((error.practices as any)?.name || 'Unknown');
      
      if (new Date(error.created_at) > new Date(errorGroups[type].last_seen)) {
        errorGroups[type].last_seen = error.created_at;
      }
    });

    return {
      items: Object.entries(errorGroups).map(([type, info]) => ({
        error_type: type,
        count: info.count,
        affected_practices: info.practices.size,
        last_seen: info.last_seen,
        severity: info.count > 10 ? 'high' : info.count > 5 ? 'medium' : 'low'
      })).sort((a, b) => b.count - a.count)
    };
  }

  private getWidgetTitle(widgetId: string): string {
    const titles: Record<string, string> = {
      'system-health': t('platform.widgets.systemHealth'),
      'version-info': t('platform.widgets.versionInfo'),
      'platform-audit-logs': t('platform.widgets.auditLogs'),
      'customer-management': t('platform.widgets.customerManagement'),
      'api-integration-status': t('platform.widgets.apiIntegrationStatus'),
      'performance-metrics': t('platform.widgets.performanceMetrics'),
      'database-status': t('platform.widgets.databaseStatus'),
      'error-monitoring': t('platform.widgets.errorMonitoring')
    };

    return titles[widgetId] || widgetId;
  }

  private getQuickActions() {
    return [
      {
        id: 'create-practice',
        label: t('platform.quickActions.createPractice'),
        icon: 'add_business',
        route: '/platform/practices/create',
        color: 'primary'
      },
      {
        id: 'system-logs',
        label: t('platform.quickActions.systemLogs'),
        icon: 'description',
        route: '/platform/logs',
        color: 'info'
      },
      {
        id: 'database-admin',
        label: t('platform.quickActions.databaseAdmin'),
        icon: 'storage',
        route: '/platform/database',
        color: 'warning'
      },
      {
        id: 'api-documentation',
        label: t('platform.quickActions.apiDocumentation'),
        icon: 'api',
        route: '/platform/api-docs',
        color: 'indigo'
      },
      {
        id: 'monitoring',
        label: t('platform.quickActions.monitoring'),
        icon: 'monitoring',
        route: '/platform/monitoring',
        color: 'red'
      },
      {
        id: 'backup-restore',
        label: t('platform.quickActions.backupRestore'),
        icon: 'backup',
        route: '/platform/backup',
        color: 'green'
      }
    ];
  }
}

export const platformDashboardService = new PlatformDashboardService();