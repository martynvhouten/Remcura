import { route } from 'quasar/wrappers'
import { createRouter, createWebHashHistory, createMemoryHistory } from 'vue-router'

import routes from './routes'
import { useAuthStore } from 'src/stores/auth'
import { routerLogger } from 'src/utils/logger'
import { monitoringService } from 'src/services/monitoring'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Global navigation guard for authentication
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    routerLogger.debug('Navigation guard triggered', { 
      to: to.path, 
      from: from.path 
    })

    // Wait for auth to be initialized
    if (!authStore.initialized) {
      routerLogger.info('Initializing auth store')
      await authStore.initialize()
    }

    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    
    if (requiresAuth && !authStore.isAuthenticated) {
      routerLogger.info('Unauthenticated user accessing protected route', { 
        route: to.path 
      })
      
      // Store intended destination in sessionStorage for clean URLs
      if (to.fullPath !== '/') {
        sessionStorage.setItem('medstock_intended_route', to.fullPath)
      }
      
      // Track navigation event
      monitoringService.trackEvent('navigation_blocked', {
        route: to.path,
        reason: 'unauthenticated'
      })
      
      // Redirect to login without query parameters
      next({ name: 'login' })
    } else if (to.name === 'login' && authStore.isAuthenticated) {
      routerLogger.info('Authenticated user accessing login page')
      
      // Check for intended route after login
      const intendedRoute = sessionStorage.getItem('medstock_intended_route')
      sessionStorage.removeItem('medstock_intended_route')
      
      if (intendedRoute && intendedRoute !== '/') {
        routerLogger.info('Redirecting to intended route', { route: intendedRoute })
        next(intendedRoute)
      } else {
        next({ name: 'dashboard' })
      }
    } else {
      routerLogger.debug('Navigation allowed', { route: to.path })
      next()
    }
  })

  // Global after navigation hook for tracking
  Router.afterEach((to, from) => {
    routerLogger.info('Navigation completed', { 
      to: to.path, 
      from: from.path 
    })
    
    // Track page views
    monitoringService.trackEvent('page_view', {
      route: to.path,
      routeName: to.name as string || 'unknown',
      fromRoute: from.path
    })

    // Add breadcrumb for debugging
    monitoringService.addBreadcrumb(
      `Navigated to ${to.path}`,
      'navigation',
      'info'
    )
  })

  return Router
}) 