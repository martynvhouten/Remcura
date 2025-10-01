/**
 * Type shims for missing or incomplete type definitions
 * TODO: Replace with proper implementations in Phase B
 */

// Fix for service-error-handler exports
declare module '@/utils/service-error-handler' {
  export class ServiceErrorHandler {
    static handle(error: unknown): void;
    static logError(message: string, error: unknown): void;
  }

  // Export ServiceErrorHandler as ErrorHandler for backward compatibility
  export { ServiceErrorHandler as ErrorHandler };

  export function handleSupabaseError(error: unknown): never;
}

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
