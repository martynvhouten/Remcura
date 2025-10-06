/**
 * Type shims for missing or incomplete type definitions
 * TODO: Replace with proper implementations in Phase B
 */

// Note: service-error-handler types are now properly exported from the actual file
// No longer need module declaration shim here

// Global i18n for services (temporary shim)
// In services, use: import { i18n } from '@/i18n' instead
declare global {
  // eslint-disable-next-line no-var
  var $t: ((key: string, ...args: unknown[]) => string) | undefined;
}

// Ensure Vue SFC module definition exists
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

export {};
