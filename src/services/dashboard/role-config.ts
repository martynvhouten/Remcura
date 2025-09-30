import { t } from '@/utils/i18n-service';
import type { UserRole } from '@/types/permissions';
import type { PracticeDashboardData } from './practice-dashboard';
import type { PlatformDashboardData } from './platform-dashboard';

export interface WidgetConfig {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'alert' | 'table';
  size: 'small' | 'medium' | 'large';
  position: number;
  visible: boolean;
  titleKey: string;
  permissions?: string[];
}

export interface RoleDashboardDefinition {
  role: UserRole;
  titleKey: string;
  subtitleKey: string;
  icon: string;
  color: string;
  widgets: WidgetConfig[];
  quickActions: QuickActionConfig[];
}

export type RoleDashboardMap = Record<UserRole, RoleDashboardDefinition>;

export interface QuickActionConfig {
  id: string;
  labelKey: string;
  icon: string;
  route: string;
  color: string;
  type: string;
  permissions?: string[];
}

/**
 * Centrale configuratie voor alle dashboard widgets en quick actions per rol
 */
class RoleDashboardConfig {
  private configs: RoleDashboardMap = {
    // ASSISTANT - Focus op dagelijkse voorraadtaken
    assistant: {
      role: 'assistant',
      titleKey: 'dashboard.roles.assistant',
      subtitleKey: 'dashboard.roles.assistantDescription',
      icon: 'medical_services',
      color: 'blue',
      widgets: [
        {
          id: 'low-stock-alerts',
          type: 'list',
          size: 'medium',
          position: 1,
          visible: true,
          titleKey: 'dashboard.widgets.lowStockAlerts',
        },
        {
          id: 'expiring-products',
          type: 'list',
          size: 'medium',
          position: 2,
          visible: true,
          titleKey: 'dashboard.widgets.expiringProducts',
        },
        {
          id: 'order-suggestions',
          type: 'list',
          size: 'medium',
          position: 3,
          visible: true,
          titleKey: 'dashboard.widgets.orderSuggestions',
        },
        {
          id: 'active-order-lists',
          type: 'table',
          size: 'large',
          position: 4,
          visible: true,
          titleKey: 'dashboard.widgets.activeOrderLists',
        },
        {
          id: 'pending-deliveries',
          type: 'list',
          size: 'medium',
          position: 5,
          visible: true,
          titleKey: 'dashboard.widgets.pendingDeliveries',
        },
      ],
      quickActions: [
        {
          id: 'scan-product',
          labelKey: 'dashboard.quickActions.scanProduct',
          icon: 'qr_code_scanner',
          route: '/scan',
          color: 'primary',
          type: 'scan',
        },
        {
          id: 'view-stock',
          labelKey: 'dashboard.quickActions.viewStock',
          icon: 'inventory',
          route: '/inventory/levels',
          color: 'info',
          type: 'view',
        },
        {
          id: 'create-order',
          labelKey: 'dashboard.quickActions.createOrder',
          icon: 'add_shopping_cart',
          route: '/orders/create',
          color: 'success',
          type: 'create',
        },
        {
          id: 'count-stock',
          labelKey: 'dashboard.quickActions.countStock',
          icon: 'fact_check',
          route: '/inventory/counting',
          color: 'warning',
          type: 'manage',
        },
      ],
    },

    // MANAGER - Focus op analytics en beheer
    manager: {
      role: 'manager',
      titleKey: 'dashboard.roles.manager',
      subtitleKey: 'dashboard.roles.managerDescription',
      icon: 'analytics',
      color: 'purple',
      widgets: [
        {
          id: 'stock-trends',
          type: 'chart',
          size: 'large',
          position: 1,
          visible: true,
          titleKey: 'dashboard.widgets.stockTrends',
        },
        {
          id: 'supplier-performance',
          type: 'table',
          size: 'large',
          position: 2,
          visible: true,
          titleKey: 'dashboard.widgets.supplierPerformance',
        },
        {
          id: 'cost-analysis',
          type: 'chart',
          size: 'medium',
          position: 3,
          visible: true,
          titleKey: 'dashboard.widgets.costAnalysis',
        },
        {
          id: 'error-alerts',
          type: 'alert',
          size: 'medium',
          position: 4,
          visible: true,
          titleKey: 'dashboard.widgets.errorAlerts',
        },
        {
          id: 'pending-orders',
          type: 'metric',
          size: 'small',
          position: 5,
          visible: true,
          titleKey: 'dashboard.widgets.pendingOrders',
        },
      ],
      quickActions: [
        {
          id: 'scan-product',
          labelKey: 'dashboard.quickActions.scanProduct',
          icon: 'qr_code_scanner',
          route: '/scan',
          color: 'primary',
          type: 'scan',
        },
        {
          id: 'view-stock',
          labelKey: 'dashboard.quickActions.viewStock',
          icon: 'inventory',
          route: '/inventory/levels',
          color: 'info',
          type: 'view',
        },
        {
          id: 'view-analytics',
          labelKey: 'dashboard.quickActions.viewAnalytics',
          icon: 'analytics',
          route: '/analytics',
          color: 'purple',
          type: 'analyze',
        },
        {
          id: 'manage-suppliers',
          labelKey: 'dashboard.quickActions.manageSuppliers',
          icon: 'business',
          route: '/suppliers',
          color: 'indigo',
          type: 'manage',
        },
      ],
    },

    // OWNER - Focus op financiëen en compliance
    owner: {
      role: 'owner',
      titleKey: 'dashboard.roles.owner',
      subtitleKey: 'dashboard.roles.ownerDescription',
      icon: 'admin_panel_settings',
      color: 'green',
      widgets: [
        {
          id: 'inventory-value',
          type: 'metric',
          size: 'medium',
          position: 1,
          visible: true,
          titleKey: 'dashboard.widgets.inventoryValue',
        },
        {
          id: 'batch-compliance',
          type: 'metric',
          size: 'medium',
          position: 2,
          visible: true,
          titleKey: 'dashboard.widgets.batchCompliance',
        },
        {
          id: 'supplier-contracts',
          type: 'table',
          size: 'large',
          position: 3,
          visible: true,
          titleKey: 'dashboard.widgets.supplierContracts',
        },
        {
          id: 'stock-rotation',
          type: 'chart',
          size: 'medium',
          position: 4,
          visible: true,
          titleKey: 'dashboard.widgets.stockRotation',
        },
        {
          id: 'audit-notifications',
          type: 'list',
          size: 'medium',
          position: 5,
          visible: true,
          titleKey: 'dashboard.widgets.auditNotifications',
        },
      ],
      quickActions: [
        {
          id: 'scan-product',
          labelKey: 'dashboard.quickActions.scanProduct',
          icon: 'qr_code_scanner',
          route: '/scan',
          color: 'primary',
          type: 'scan',
        },
        {
          id: 'view-stock',
          labelKey: 'dashboard.quickActions.viewStock',
          icon: 'inventory',
          route: '/inventory/levels',
          color: 'info',
          type: 'view',
        },
        {
          id: 'financial-reports',
          labelKey: 'dashboard.quickActions.financialReports',
          icon: 'account_balance',
          route: '/reports/financial',
          color: 'green',
          type: 'analyze',
        },
        {
          id: 'manage-users',
          labelKey: 'dashboard.quickActions.manageUsers',
          icon: 'people',
          route: '/admin/users',
          color: 'red',
          type: 'settings',
        },
      ],
    },

    // LOGISTICS - Focus op bewegingen en leveringen
    logistics: {
      role: 'logistics',
      titleKey: 'dashboard.roles.logistics',
      subtitleKey: 'dashboard.roles.logisticsDescription',
      icon: 'local_shipping',
      color: 'orange',
      widgets: [
        {
          id: 'pending-deliveries',
          type: 'list',
          size: 'large',
          position: 1,
          visible: true,
          titleKey: 'dashboard.widgets.pendingDeliveries',
        },
        {
          id: 'stock-movements',
          type: 'list',
          size: 'medium',
          position: 2,
          visible: true,
          titleKey: 'dashboard.widgets.stockMovements',
        },
        {
          id: 'location-overview',
          type: 'chart',
          size: 'medium',
          position: 3,
          visible: true,
          titleKey: 'dashboard.widgets.locationOverview',
        },
        {
          id: 'transport-status',
          type: 'metric',
          size: 'small',
          position: 4,
          visible: true,
          titleKey: 'dashboard.widgets.transportStatus',
        },
      ],
      quickActions: [
        {
          id: 'scan-product',
          labelKey: 'dashboard.quickActions.scanProduct',
          icon: 'qr_code_scanner',
          route: '/scan',
          color: 'primary',
          type: 'scan',
        },
        {
          id: 'view-movements',
          labelKey: 'dashboard.quickActions.viewMovements',
          icon: 'move_up',
          route: '/inventory/movements',
          color: 'info',
          type: 'view',
        },
        {
          id: 'manage-locations',
          labelKey: 'dashboard.quickActions.manageLocations',
          icon: 'location_on',
          route: '/inventory/locations',
          color: 'orange',
          type: 'manage',
        },
      ],
    },

    // MEMBER - Beperkte toegang
    member: {
      role: 'member',
      titleKey: 'dashboard.roles.member',
      subtitleKey: 'dashboard.roles.memberDescription',
      icon: 'person',
      color: 'grey',
      widgets: [
        {
          id: 'stock-overview',
          type: 'metric',
          size: 'medium',
          position: 1,
          visible: true,
          titleKey: 'dashboard.widgets.stockOverview',
        },
        {
          id: 'my-tasks',
          type: 'list',
          size: 'medium',
          position: 2,
          visible: true,
          titleKey: 'dashboard.widgets.myTasks',
        },
      ],
      quickActions: [
        {
          id: 'scan-product',
          labelKey: 'dashboard.quickActions.scanProduct',
          icon: 'qr_code_scanner',
          route: '/scan',
          color: 'primary',
          type: 'scan',
        },
        {
          id: 'view-stock',
          labelKey: 'dashboard.quickActions.viewStock',
          icon: 'inventory',
          route: '/inventory/levels',
          color: 'info',
          type: 'view',
        },
      ],
    },

    // GUEST - Zeer beperkte toegang
    guest: {
      role: 'guest',
      titleKey: 'dashboard.roles.guest',
      subtitleKey: 'dashboard.roles.guestDescription',
      icon: 'visibility',
      color: 'grey-5',
      widgets: [
        {
          id: 'public-info',
          type: 'metric',
          size: 'medium',
          position: 1,
          visible: true,
          titleKey: 'dashboard.widgets.publicInfo',
        },
      ],
      quickActions: [
        {
          id: 'view-info',
          labelKey: 'dashboard.quickActions.viewInfo',
          icon: 'info',
          route: '/info',
          color: 'info',
          type: 'view',
        },
      ],
    },

    // PLATFORM_OWNER - Geen widgets in normale dashboard, alleen redirect naar platform
    platform_owner: {
      role: 'platform_owner',
      titleKey: 'dashboard.roles.platformOwner',
      subtitleKey: 'dashboard.roles.platformOwnerDescription',
      icon: 'settings',
      color: 'deep-purple',
      widgets: [], // Geen widgets - platform owners moeten naar /platform
      quickActions: [
        {
          id: 'platform-dashboard',
          labelKey: 'dashboard.quickActions.platformDashboard',
          icon: 'dashboard',
          route: '/platform',
          color: 'deep-purple',
          type: 'view',
        },
      ],
    },
  };

  /**
   * Krijg de volledige dashboard configuratie voor een rol
   */
  getRoleConfig(role: UserRole): RoleDashboardDefinition {
    const config = this.configs[role];
    if (!config) {
      return this.configs.member;
    }

    return config;
  }

  /**
   * Krijg de widgets voor een specifieke rol
   */
  getWidgetIds(role: UserRole): string[] {
    const config = this.configs[role];
    return config?.widgets.map(w => w.id) || [];
  }

  /**
   * Krijg quick actions voor een specifieke rol
   */
  getQuickActions(role: UserRole): QuickActionConfig[] {
    const config = this.configs[role];
    return config?.quickActions || [];
  }

  /**
   * Krijg rol opties voor demo switcher
   */
  getDemoRoleOptions() {
    // Practice rollen voor normale gebruikers
    const practiceRoles: UserRole[] = ['assistant', 'manager', 'owner'];

    // In development mode ook platform_owner tonen voor testing
    const isDevelopment =
      process.env.NODE_ENV === 'development' ||
      window.location.hostname === 'localhost';
    const demoRoles = isDevelopment
      ? [...practiceRoles, 'platform_owner']
      : practiceRoles;

    return demoRoles.map(role => ({
      label: t(this.configs[role].titleKey),
      value: role,
      icon: this.configs[role].icon,
      color: this.configs[role].color,
    }));
  }

  /**
   * Krijg alle beschikbare widget types
   */
  getAllWidgetTypes(): string[] {
    const types = new Set<string>();
    Object.values(this.configs).forEach(config => {
      config.widgets.forEach(widget => {
        types.add(widget.type);
      });
    });
    return Array.from(types);
  }

  /**
   * Check of een rol toegang heeft tot een specifieke widget
   */
  hasWidgetAccess(role: UserRole, widgetId: string): boolean {
    const config = this.configs[role];
    return config?.widgets.some(w => w.id === widgetId && w.visible) || false;
  }
}

export const roleDashboardConfig = new RoleDashboardConfig();
