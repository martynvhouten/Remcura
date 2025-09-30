/**
 * Monitoring and Error Tracking Service
 * Placeholder for production monitoring tools like Sentry, LogRocket, etc.
 */

import type { Router } from 'vue-router';
import { logger } from '@/utils/logger';

type StructuredLogger = ReturnType<typeof logger.createContext>;

const createStructuredLogger = (context: string) => {
  const base = logger.createContext(context);
  return {
    info: (message: string, data?: Record<string, unknown>) =>
      data ? base.structured(message, data) : base.info(message),
    warn: (message: string, data?: Record<string, unknown>) =>
      data ? base.structured(message, data) : base.warn(message),
    error: (message: string, data?: Record<string, unknown>) =>
      data ? base.structured(message, data) : base.error(message),
  } satisfies StructuredLogger & {
    info: (message: string, data?: Record<string, unknown>) => void;
    warn: (message: string, data?: Record<string, unknown>) => void;
    error: (message: string, data?: Record<string, unknown>) => void;
  };
};

export interface MonitoringConfig {
  dsn?: string;
  environment: 'development' | 'staging' | 'production';
  userId?: string;
  version: string;
}

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  timestamp: string;
  sessionId?: string;
}

interface TrackingProperties {
  [key: string]: string | number | boolean | undefined;
}

class MonitoringService {
  private config: MonitoringConfig | null = null;
  private isInitialized = false;
  private router: Router | null = null;

  async initialize(config: MonitoringConfig, router?: Router): Promise<void> {
    this.config = config;
    this.router = router ?? null;

    if (config.environment === 'production') {
      await this.initializeSentry(config);
    }

    this.isInitialized = true;
  }

  captureError(error: Error, context?: ErrorContext): void {
    if (!this.isInitialized || !this.config) {
      // eslint-disable-next-line no-console
      console.error('Monitoring service not initialized', error);
      return;
    }

    if (this.config.environment !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Captured error:', error, context);
    }

    if (this.config.environment === 'production') {
      void this.sendToSentry(error, context);
    }
  }

  private async sendToSentry(
    error: Error,
    context?: ErrorContext
  ): Promise<void> {
    if (!this.config) {
      return;
    }

    try {
      const Sentry = await import('@sentry/vue');

      Sentry.withScope(scope => {
        if (context?.userId) {
          scope.setUser({ id: context.userId });
        }

        scope.setTag('environment', this.config?.environment ?? 'unknown');
        scope.setContext('error_context', {
          url:
            context?.url ??
            (typeof window !== 'undefined' ? window.location.href : undefined),
          userAgent:
            context?.userAgent ??
            (typeof navigator !== 'undefined'
              ? navigator.userAgent
              : undefined),
          timestamp: context?.timestamp ?? new Date().toISOString(),
          sessionId: context?.sessionId,
        });

        Sentry.captureException(error);
      });
    } catch (sentryError) {
      // eslint-disable-next-line no-console
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }

  trackEvent(eventName: string, properties?: TrackingProperties): void {
    if (!this.isInitialized || !this.config) {
      return;
    }

    if (this.config.environment !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('Tracking event:', eventName, properties);
    }

    // Hook for production analytics services
  }

  setUserContext(user: { id: string; email?: string; role?: string }): void {
    if (!this.isInitialized) {
      return;
    }

    if (this.config?.environment === 'production') {
      void this.setSentryUser(user);
    }
  }

  private async setSentryUser(user: {
    id: string;
    email?: string;
    role?: string;
  }): Promise<void> {
    try {
      const Sentry = await import('@sentry/vue');

      const sentryUser: { id: string; email?: string; role?: string } = {
        id: user.id,
      };
      if (user.email) {
        sentryUser.email = user.email;
      }
      if (user.role) {
        sentryUser.role = user.role;
      }

      Sentry.setUser(sentryUser);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to set Sentry user:', error);
    }
  }

  addBreadcrumb(
    message: string,
    category?: string,
    level?: 'info' | 'warning' | 'error'
  ): void {
    if (!this.isInitialized) {
      return;
    }

    if (this.config?.environment === 'production') {
      void this.addSentryBreadcrumb(message, category, level);
    }
  }

  private async addSentryBreadcrumb(
    message: string,
    category?: string,
    level?: 'info' | 'warning' | 'error'
  ): Promise<void> {
    try {
      const Sentry = await import('@sentry/vue');
      Sentry.addBreadcrumb({
        message,
        category: category ?? 'custom',
        level: level ?? 'info',
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to add Sentry breadcrumb:', error);
    }
  }

  trackPerformance(metric: string, value: number, unit?: string): void {
    if (!this.isInitialized) {
      return;
    }

    if (this.config?.environment !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('Performance metric:', { metric, value, unit });
    }
  }

  private async initializeSentry(config: MonitoringConfig): Promise<void> {
    if (!config.dsn) {
      // eslint-disable-next-line no-console
      console.warn('Sentry DSN not provided for production environment');
      return;
    }

    try {
      const Sentry = await import('@sentry/vue');

      const integrations: unknown[] = [];

      try {
        const { browserTracingIntegration } = await import('@sentry/vue');
        integrations.push(
          browserTracingIntegration({
            router: this.router ?? undefined,
          })
        );
      } catch (tracingError) {
        // eslint-disable-next-line no-console
        console.warn('Browser tracing not available:', tracingError);
      }

      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.version,
        integrations,
        tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
        beforeSend(event) {
          if (config.environment !== 'production') {
            return event;
          }

          const exception = event?.exception?.values?.[0]?.value ?? '';
          if (
            typeof exception === 'string' &&
            exception.includes('Non-Error')
          ) {
            return null;
          }

          return event;
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize Sentry:', error);
    }
  }
}

export const monitoringService = new MonitoringService();

export async function initializeMonitoring(router?: Router): Promise<void> {
  const config: MonitoringConfig = {
    environment: import.meta.env.PROD ? 'production' : 'development',
    version: '1.0.0',
    ...(import.meta.env.VITE_SENTRY_DSN
      ? { dsn: import.meta.env.VITE_SENTRY_DSN }
      : {}),
  };

  await monitoringService.initialize(config, router);
}

export const captureStructuredError = (
  error: Error,
  metadata: Record<string, unknown> = {}
): void => {
  monitoringService.captureError(error, {
    timestamp: new Date().toISOString(),
    ...metadata,
  });
};
