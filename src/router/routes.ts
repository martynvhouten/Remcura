import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Auth pages - uses AuthLayout
  {
    path: '/auth',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('pages/auth/LoginPage.vue'),
        meta: { requiresAuth: false }
      }
      // Future auth pages can be added here:
      // {
      //   path: 'register',
      //   name: 'register', 
      //   component: () => import('pages/auth/RegisterPage.vue'),
      //   meta: { requiresAuth: false }
      // }
    ]
  },

  // Redirect /login to /auth/login for backwards compatibility
  {
    path: '/login',
    redirect: '/auth/login'
  },

  // Main Layout - for authenticated users
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'bestellijsten',
        name: 'bestellijsten',
        component: () => import('pages/BestellijstenPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'bestellijsten/:id',
        name: 'bestellijst-detail',
        component: () => import('pages/BestellijstDetailPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('pages/ProductsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('pages/OrdersPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('pages/AnalyticsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'suppliers',
        name: 'suppliers',
        component: () => import('pages/SuppliersPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import('pages/NotificationsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import('pages/AdminDashboard.vue'),
        meta: { 
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'beheer',
        name: 'beheer',
        component: () => import('pages/AdminDashboard.vue'),
        meta: { 
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'bestellingen',
        redirect: '/bestellijsten'
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('pages/SettingsPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes 