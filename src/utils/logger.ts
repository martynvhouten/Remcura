/**
 * Production-ready logging utility
 * Replaces console.log statements with environment-aware logging
 */

import type { LogLevel, LogData, LogEntry } from '@/types/logging';

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.debug(
        `[DEBUG${context ? ` ${context}` : ''}]`,
        message,
        data || ''
      );
    }
  }

  /**
   * Log general information
   */
  info(message: string, context?: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.info(
        `[INFO${context ? ` ${context}` : ''}]`,
        message,
        data || ''
      );
    }

    // In production, could send to monitoring service
    this.sendToMonitoring('info', message, context, data);
  }

  /**
   * Log warnings (always logged)
   */
  warn(message: string, context?: string, data?: LogData): void {
    console.warn(`[WARN${context ? ` ${context}` : ''}]`, message, data || '');
    this.sendToMonitoring('warn', message, context, data);
  }

  /**
   * Log errors (always logged)
   */
  error(message: string, context?: string, error?: Error | any): void {
    console.error(
      `[ERROR${context ? ` ${context}` : ''}]`,
      message,
      error || ''
    );
    this.sendToMonitoring('error', message, context, error);
  }

  /**
   * Send logs to external monitoring service (placeholder)
   */
  private sendToMonitoring(
    _level: LogLevel,
    _message: string,
    _context?: string,
    _data?: LogData
  ): void {
    if (!this.isProduction) {
      return;
    }

    // TODO: Integrate with monitoring service (Sentry, LogRocket, etc.)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.addBreadcrumb({
    //     message,
    //     category: context || 'app',
    //     level,
    //     data
    //   })
    // }
  }

  /**
   * Create a contextual logger for specific modules
   */
  createContext(context: string) {
    return {
      debug: (message: string, data?: LogData) =>
        this.debug(message, context, data),
      info: (message: string, data?: LogData) =>
        this.info(message, context, data),
      warn: (message: string, data?: LogData) =>
        this.warn(message, context, data),
      error: (message: string, error?: Error | LogData) =>
        this.error(message, context, error),
    };
  }
}

// Export singleton instance
export const logger = new Logger();

// Export contextual loggers for common modules
export const authLogger = logger.createContext('AUTH');
export const apiLogger = logger.createContext('API');
export const routerLogger = logger.createContext('ROUTER');
export const serviceWorkerLogger = logger.createContext('SW');

// Store loggers
export const productLogger = logger.createContext('PRODUCTS');
export const inventoryLogger = logger.createContext('INVENTORY');
export const orderLogger = logger.createContext('ORDERS');
export const supplierLogger = logger.createContext('SUPPLIERS');
export const countingLogger = logger.createContext('COUNTING');
export const batchLogger = logger.createContext('BATCH');
export const clinicLogger = logger.createContext('CLINIC');

// Service loggers
export const analyticsLogger = logger.createContext('ANALYTICS');
export const dashboardLogger = logger.createContext('DASHBOARD');
export const magentoLogger = logger.createContext('MAGENTO');
export const offlineLogger = logger.createContext('OFFLINE');
export const notificationLogger = logger.createContext('NOTIFICATIONS');
