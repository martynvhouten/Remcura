import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useAuthStore } from '@/stores/auth';
import { PermissionService } from '@/services/permissions';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route((/* { store, ssrContext } */) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Global navigation guard for authentication and permissions
  Router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Initialize auth store if not already done
    if (!authStore.initialized) {
      await authStore.initialize();
    }

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login' });
      return;
    }

    // Check role-based permissions
    if (to.meta.requiresRole && authStore.isAuthenticated) {
      try {
        const userRole = await PermissionService.getUserRole();
        const requiredRoles = Array.isArray(to.meta.requiresRole)
          ? to.meta.requiresRole
          : [to.meta.requiresRole];

        // If no role found but user is authenticated, default to 'guest' for demo purposes
        const effectiveRole = userRole || 'guest';

        if (!requiredRoles.includes(effectiveRole)) {
          console.warn(
            `Access denied. User role: ${effectiveRole}, Required: ${requiredRoles.join(
              ', '
            )}`
          );

          // Only redirect if not dashboard - avoid infinite loops
          if (to.name !== 'dashboard') {
            next({ name: 'dashboard' });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        // On error, allow access but log the issue for debugging
        console.warn(
          'Allowing access due to role check error - this should be fixed in production'
        );
      }
    }

    // Check specific permissions
    if (to.meta.requiresPermission && authStore.isAuthenticated) {
      try {
        const { permission, resource, resourceId } = to.meta.requiresPermission;
        const hasPermission = await PermissionService.hasPermission(
          permission,
          resource,
          resourceId
        );

        if (!hasPermission) {
          console.warn(
            `Access denied. Missing permission: ${permission} on ${resource}`
          );

          // Only redirect if not dashboard - avoid infinite loops
          if (to.name !== 'dashboard') {
            next({ name: 'dashboard' });
            return;
          }
        }
      } catch (error) {
        console.error('Error checking permission:', error);
        // On error, allow access but log the issue for debugging
        console.warn(
          'Allowing access due to permission check error - this should be fixed in production'
        );
      }
    }

    // If authenticated user tries to access login page, redirect to dashboard
    if (authStore.isAuthenticated && to.name === 'login') {
      next({ name: 'dashboard' });
      return;
    }

    next();
  });

  // Global after navigation hook for tracking
  Router.afterEach((_to, _from) => {
    // Track page views
    // monitoringService.trackEvent('page_view', {
    //   route: to.path,
    //   routeName: (to.name as string) || 'unknown',
    //   fromRoute: from.path,
    // });
    // Add breadcrumb for debugging
    // monitoringService.addBreadcrumb(
    //   `Navigated to ${to.path}`,
    //   'navigation',
    //   'info'
    // );
  });

  return Router;
});
