import { route } from 'quasar/wrappers'
import { createRouter, createWebHashHistory, createMemoryHistory } from 'vue-router'

import routes from './routes'
import { useAuthStore } from 'src/stores/auth'

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
    
    // Wait for auth to be initialized
    if (!authStore.initialized) {
      await authStore.initialize()
    }

    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    
    if (requiresAuth && !authStore.isAuthenticated) {
      // Store intended destination in sessionStorage for clean URLs
      if (to.fullPath !== '/') {
        sessionStorage.setItem('medstock_intended_route', to.fullPath)
      }
      // Redirect to login without query parameters
      next({ name: 'login' })
    } else if (to.name === 'login' && authStore.isAuthenticated) {
      // Check for intended route after login
      const intendedRoute = sessionStorage.getItem('medstock_intended_route')
      sessionStorage.removeItem('medstock_intended_route')
      
      if (intendedRoute && intendedRoute !== '/') {
        next(intendedRoute)
      } else {
        next({ name: 'dashboard' })
      }
    } else {
      next()
    }
  })

  return Router
}) 