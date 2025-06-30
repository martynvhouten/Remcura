import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  // Auth pages - uses AuthLayout
  {
    path: '/auth',
    component: () => import(/* webpackChunkName: "auth-layout" */ 'layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "auth-login" */ 'pages/auth/LoginPage.vue'),
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
    component: () => import(/* webpackChunkName: "main-layout" */ 'layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ 'pages/DashboardPage.vue'),
        meta: { requiresAuth: true, preload: true }
      },
      {
        path: 'bestellijsten',
        name: 'bestellijsten',
        component: () => import(/* webpackChunkName: "bestellijsten" */ 'pages/BestellijstenPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'bestellijsten/:id',
        name: 'bestellijst-detail',
        component: () => import(/* webpackChunkName: "bestellijst-detail" */ 'pages/BestellijstDetailPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'products',
        name: 'products',
        component: () => import(/* webpackChunkName: "products" */ 'pages/ProductsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import(/* webpackChunkName: "orders" */ 'pages/OrdersPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import(/* webpackChunkName: "analytics" */ 'pages/AnalyticsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'suppliers',
        name: 'suppliers',
        component: () => import(/* webpackChunkName: "suppliers" */ 'pages/SuppliersPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'notifications',
        name: 'notifications',
        component: () => import(/* webpackChunkName: "notifications" */ 'pages/NotificationsPage.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'admin',
        name: 'admin',
        component: () => import(/* webpackChunkName: "admin" */ 'pages/AdminDashboard.vue'),
        meta: { 
          requiresAuth: true,
          requiresAdmin: true
        }
      },
      {
        path: 'beheer',
        name: 'beheer',
        component: () => import(/* webpackChunkName: "admin" */ 'pages/AdminDashboard.vue'),
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
        component: () => import(/* webpackChunkName: "settings" */ 'pages/SettingsPage.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import(/* webpackChunkName: "error" */ 'pages/ErrorNotFound.vue')
  }
]

export default routes 