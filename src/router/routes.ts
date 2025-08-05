import { RouteRecordRaw } from 'vue-router';
import type { UserRole, PermissionType, ResourceType } from '@/services/permissions';

// Extend Vue Router meta interface
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresRole?: UserRole | UserRole[];
    requiresPermission?: {
      permission: PermissionType;
      resource: ResourceType;
      resourceId?: string;
    };
    title?: string;
    icon?: string;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        redirect: '/dashboard' 
      },
      { 
        path: 'dashboard', 
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { 
          requiresAuth: true, 
          title: 'Dashboard',
          icon: 'dashboard'
        }
      },
      { 
        path: 'products', 
        name: 'products',
        component: () => import('pages/ProductsPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresPermission: {
            permission: 'read',
            resource: 'products'
          },
          title: 'Products',
          icon: 'inventory_2'
        }
      },
      {
        path: 'inventory',
        name: 'inventory',
        meta: { 
          requiresAuth: true,
          requiresPermission: {
            permission: 'read',
            resource: 'inventory'
          },
          title: 'Inventory',
          icon: 'warehouse'
        },
        children: [
          {
            path: 'levels',
            name: 'inventory-levels',
            component: () => import('pages/inventory/InventoryLevelsPage.vue'),
            meta: {
              requiresPermission: {
                permission: 'read',
                resource: 'inventory'
              },
              title: 'Stock Levels'
            }
          },
          {
            path: 'counting',
            name: 'inventory-counting',
            component: () => import('pages/inventory/CountingPage.vue'),
            meta: {
              requiresRole: ['owner', 'manager', 'assistant', 'logistics', 'platform_owner'],
              title: 'Stock Counting'
            }
          },
          {
            path: 'counting/:sessionId',
            name: 'counting-session',
            component: () => import('pages/inventory/CountingSessionPage.vue'),
            meta: {
              requiresRole: ['owner', 'manager', 'assistant', 'logistics', 'platform_owner'],
              title: 'Counting Session'
            }
          },
          {
            path: 'movements',
            name: 'inventory-movements',
            component: () => import('pages/inventory/MovementsPage.vue'),
            meta: {
              requiresPermission: {
                permission: 'read',
                resource: 'inventory'
              },
              title: 'Stock Movements'
            }
          },
          {
            path: 'locations',
            name: 'inventory-locations',
            component: () => import('pages/inventory/LocationsPage.vue'),
            meta: {
              requiresRole: ['owner', 'manager', 'assistant', 'platform_owner'],
              title: 'Locations'
            }
          }
        ]
      },
      { 
        path: 'orders', 
        name: 'orders',
        component: () => import('pages/OrdersPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresPermission: {
            permission: 'read',
            resource: 'orders'
          },
          title: 'Orders',
          icon: 'shopping_cart'
        }
      },
      { 
        path: 'order-lists', 
        name: 'order-lists',
        component: () => import('pages/OrderListsPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresPermission: {
            permission: 'read',
            resource: 'orders'
          },
          title: 'Bestellijsten',
          icon: 'list_alt'
        }
      },
      { 
        path: 'order-lists/:id', 
        name: 'order-list-detail',
        component: () => import('pages/OrderListDetailPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresPermission: {
            permission: 'read',
            resource: 'orders'
          },
          title: 'Bestellijst Details',
          icon: 'list_alt'
        }
      },
      { 
        path: 'suppliers', 
        name: 'suppliers',
        component: () => import('pages/SuppliersPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresRole: ['owner', 'manager', 'assistant', 'platform_owner'],
          title: 'Suppliers',
          icon: 'business'
        }
      },
      { 
        path: 'analytics', 
        name: 'analytics',
        component: () => import('pages/AnalyticsPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresPermission: {
            permission: 'read',
            resource: 'analytics'
          },
          title: 'Analytics',
          icon: 'analytics'
        }
      },
      { 
        path: 'notifications', 
        name: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
        meta: { 
          requiresAuth: true,
          title: 'Notifications',
          icon: 'notifications'
        }
      },
      { 
        path: 'settings', 
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresRole: ['owner', 'manager', 'platform_owner'],
          title: 'Settings',
          icon: 'settings'
        }
      },
      { 
        path: 'admin', 
        name: 'admin',
        component: () => import('pages/AdminDashboard.vue'),
        meta: { 
          requiresAuth: true,
          requiresRole: ['owner', 'platform_owner'],
          title: 'Admin Dashboard',
          icon: 'admin_panel_settings'
        }
      },
      { 
        path: 'batch-management', 
        name: 'batch-management',
        component: () => import('pages/BatchManagementPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresPermission: {
            permission: 'read',
            resource: 'inventory'
          },
          title: 'Batch Management',
          icon: 'inventory'
        }
      },
      { 
        path: 'style-guide', 
        name: 'style-guide',
        component: () => import('pages/StyleGuidePage.vue'),
        meta: { 
          requiresAuth: true,
          requiresRole: ['owner', 'platform_owner'],
          title: 'Style Guide'
        }
      }
    ],
  },

  // Auth routes (no authentication required)
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: 'login', 
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { title: 'Login' }
      },
      { 
        path: 'magic-join', 
        name: 'magic-join',
        component: () => import('pages/auth/MagicJoinPage.vue'),
        meta: { title: 'Magic Join' }
      },
    ],
  },

  // Platform Owner Portal
  {
    path: '/platform',
    component: () => import('layouts/MainLayout.vue'),
    meta: { 
      requiresAuth: true,
      requiresRole: 'platform_owner'
    },
    children: [
      {
        path: '',
        name: 'platform-dashboard',
        component: () => import('pages/platform/PlatformDashboard.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'Platform Dashboard',
          icon: 'settings'
        }
      },
      {
        path: 'practices',
        name: 'platform-practices',
        component: () => import('pages/platform/PracticesPage.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'Practice Management',
          icon: 'business'
        }
      },
      {
        path: 'practices/create',
        name: 'platform-practices-create',
        component: () => import('pages/platform/CreatePracticePage.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'Create Practice',
          icon: 'add_business'
        }
      },
      {
        path: 'logs',
        name: 'platform-logs',
        component: () => import('pages/platform/SystemLogsPage.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'System Logs',
          icon: 'description'
        }
      },
      {
        path: 'database',
        name: 'platform-database',
        component: () => import('pages/platform/DatabaseAdminPage.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'Database Admin',
          icon: 'storage'
        }
      },
      {
        path: 'api-docs',
        name: 'platform-api-docs',
        component: () => import('pages/platform/ApiDocsPage.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'API Documentation',
          icon: 'api'
        }
      },
      {
        path: 'monitoring',
        name: 'platform-monitoring',
        component: () => import('pages/platform/MonitoringPage.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'System Monitoring',
          icon: 'monitoring'
        }
      },
      {
        path: 'backup',
        name: 'platform-backup',
        component: () => import('pages/platform/BackupPage.vue'),
        meta: {
          requiresAuth: true,
          requiresRole: 'platform_owner',
          title: 'Backup & Restore',
          icon: 'backup'
        }
      }
    ]
  },



  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
