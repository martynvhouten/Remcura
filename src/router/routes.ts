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
              requiresRole: ['owner', 'manager', 'assistant', 'logistics'],
              title: 'Stock Counting'
            }
          },
          {
            path: 'counting/:sessionId',
            name: 'counting-session',
            component: () => import('pages/inventory/CountingSessionPage.vue'),
            meta: {
              requiresRole: ['owner', 'manager', 'assistant', 'logistics'],
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
              requiresRole: ['owner', 'manager', 'assistant'],
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
          title: 'Order Lists',
          icon: 'list_alt'
        }
      },
      { 
        path: 'suppliers', 
        name: 'suppliers',
        component: () => import('pages/SuppliersPage.vue'),
        meta: { 
          requiresAuth: true,
          requiresRole: ['owner', 'manager', 'assistant'],
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
          requiresRole: ['owner', 'manager'],
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
          requiresRole: ['owner'],
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
          requiresRole: ['owner'],
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

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
