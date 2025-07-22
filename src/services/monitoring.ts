/**
 * Monitoring and Error Tracking Service
 * Placeholder for production monitoring tools like Sentry, LogRocket, etc.
 */

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

class MonitoringService {
  private config: MonitoringConfig | null = null;
  private isInitialized = false;
  private router: any = null;

  /**
   * Initialize monitoring service
   */
  async initialize(config: MonitoringConfig, router?: any): Promise<void> {
    this.config = config;
    this.router = router;

    // TODO: Initialize monitoring service based on environment
    if (config.environment === 'production') {
      // Initialize Sentry
      await this.initializeSentry(config);

      // Example: Initialize LogRocket
      // await this.initializeLogRocket(config)

      // Example: Initialize custom analytics
      // await this.initializeCustomAnalytics(config)
    }

    this.isInitialized = true;
  }

  /**
   * Track application errors
   */
  captureError(error: Error, context?: ErrorContext): void {
    if (!this.isInitialized || !this.config) {
      console.error('Monitoring service not initialized', error);
      return;
    }

    // Always log to console in development
    if (this.config.environment !== 'production') {
      console.error('Captured error:', error, context);
    }

    // Send to Sentry in production
    if (this.config.environment === 'production') {
      this.sendToSentry(error, context);
    }
  }

  /**
   * Send error to Sentry
   */
  private async sendToSentry(
    error: Error,
    context?: ErrorContext
  ): Promise<void> {
    try {
      const Sentry = await import('@sentry/vue');

      Sentry.withScope(scope => {
        if (context?.userId) {
          scope.setUser({ id: context.userId });
        }

        scope.setTag('environment', this.config?.environment || 'unknown');
        scope.setContext('error_context', {
          url: context?.url || window.location.href,
          userAgent: context?.userAgent || navigator.userAgent,
          timestamp: context?.timestamp || new Date().toISOString(),
          sessionId: context?.sessionId,
        });

        Sentry.captureException(error);
      });
    } catch (sentryError) {
      console.error('Failed to send error to Sentry:', sentryError);
    }
  }

  /**
   * Track custom events/metrics
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized || !this.config) return;

    // TODO: Send to analytics service
    // Example:
    // analytics.track(eventName, properties)
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(user: { id: string; email?: string; role?: string }): void {
    if (!this.isInitialized) return;

    // Update Sentry user context in production
    if (this.config?.environment === 'production') {
      this.setSentryUser(user);
    }
  }

  /**
   * Set Sentry user context
   */
  private async setSentryUser(user: {
    id: string;
    email?: string;
    role?: string;
  }): Promise<void> {
    try {
      const Sentry = await import('@sentry/vue');

      // Only include defined properties
      const sentryUser: { id: string; email?: string; role?: string } = {
        id: user.id,
      };
      if (user.email) sentryUser.email = user.email;
      if (user.role) sentryUser.role = user.role;

      Sentry.setUser(sentryUser);
    } catch (error) {
      console.error('Failed to set Sentry user:', error);
    }
  }

  /**
   * Add custom breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category?: string,
    level?: 'info' | 'warning' | 'error'
  ): void {
    if (!this.isInitialized) return;

    if (this.config?.environment === 'production') {
      this.addSentryBreadcrumb(message, category, level);
    }
  }

  /**
   * Add Sentry breadcrumb
   */
  private async addSentryBreadcrumb(
    message: string,
    category?: string,
    level?: 'info' | 'warning' | 'error'
  ): Promise<void> {
    try {
      const Sentry = await import('@sentry/vue');
      Sentry.addBreadcrumb({
        message,
        category: category || 'custom',
        level: level || 'info',
      });
    } catch (error) {
      console.error('Failed to add Sentry breadcrumb:', error);
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, unit?: string): void {
    if (!this.isInitialized) return;

    // TODO: Send performance data
    // Example:
    // analytics.track('performance', { metric, value, unit })
  }

  // Private methods for service initialization

  private async initializeSentry(config: MonitoringConfig): Promise<void> {
    if (!config.dsn && config.environment === 'production') {
      console.warn('Sentry DSN not provided for production environment');
      return;
    }

    // Dynamically import Sentry to avoid bundling in development
    if (config.environment === 'production' && config.dsn) {
      try {
        const Sentry = await import('@sentry/vue');

        // Create integrations array
        const integrations: any[] = [];

        // Add browser tracing if available
        try {
          const { browserTracingIntegration } = await import('@sentry/vue');
          integrations.push(
            browserTracingIntegration({
              router: this.router,
            })
          );
        } catch (tracingError) {
          console.warn('Browser tracing not available:', tracingError);
        }

        Sentry.init({
          dsn: config.dsn,
          environment: config.environment,
          release: config.version,
          integrations,
          tracesSampleRate: config.environment === 'production' ? 0.1 : 1.0,
          beforeSend(event: any) {
            // Filter out development-related errors
            if (config.environment !== 'production') {
              return event;
            }

            // Filter out specific errors in production
            if (event.exception?.values?.[0]?.value?.includes('Non-Error')) {
              return null;
            }

            return event;
          },
        });
      } catch (error) {
        console.error('Failed to initialize Sentry:', error);
      }
    }
  }

  private async initializeLogRocket(config: MonitoringConfig): Promise<void> {
    // TODO: Implement LogRocket initialization
    // import LogRocket from 'logrocket'
    //
    // LogRocket.init('your-app-id', {
    //   release: config.version,
    //   console: {
    //     shouldAggregateConsoleErrors: true,
    //   },
    // })
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();

// Helper function to initialize monitoring in main.ts
export async function initializeMonitoring(router?: any): Promise<void> {
  const config: MonitoringConfig = {
    environment: import.meta.env.PROD ? 'production' : 'development',
    version: '1.0.0', // TODO: Get from package.json
    // Only include dsn if it's defined
    ...(import.meta.env.VITE_SENTRY_DSN && {
      dsn: import.meta.env.VITE_SENTRY_DSN,
    }),
  };

  await monitoringService.initialize(config, router);
}
