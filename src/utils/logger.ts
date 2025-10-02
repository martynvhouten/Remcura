/**
 * Production-ready logging utility
 * Replaces console.log statements with environment-aware logging
 */

import type { LogLevel, LogData } from '@/types/logging';

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  debug(message: string, context?: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.debug(
        `[DEBUG${context ? ` ${context}` : ''}]`,
        message,
        data ?? ''
      );
    }
  }

  info(message: string, context?: string, data?: LogData): void {
    if (this.isDevelopment) {
      console.info(
        `[INFO${context ? ` ${context}` : ''}]`,
        message,
        data ?? ''
      );
    }

    this.sendToMonitoring('info', message, context, data);
  }

  warn(message: string, context?: string, data?: LogData): void {
    console.warn(`[WARN${context ? ` ${context}` : ''}]`, message, data ?? '');
    this.sendToMonitoring('warn', message, context, data);
  }

  error(message: string, context?: string, error?: Error | LogData): void {
    console.error(
      `[ERROR${context ? ` ${context}` : ''}]`,
      message,
      error ?? ''
    );
    this.sendToMonitoring('error', message, context, error ?? undefined);
  }

  private sendToMonitoring(
    _level: LogLevel,
    _message: string,
    _context?: string,
    _data?: LogData
  ): void {
    if (!this.isProduction) {
      return;
    }
  }

  createContext(context: string) {
    const warn = (message: string, data?: LogData) =>
      this.warn(message, context, data);
    const info = (message: string, data?: LogData) =>
      this.info(message, context, data);
    const debug = (message: string, data?: LogData) =>
      this.debug(message, context, data);
    const error = (message: string, error?: Error | LogData) =>
      this.error(message, context, error);

    const structured = (message: string, data?: Record<string, unknown>) =>
      this.info(message, context, data);

    return { debug, info, warn, error, structured };
  }
}

/**
 * Convert unknown values to LogData format
 * Safely handles Error objects, unknown types, and complex objects
 */
export function toLogData(value: unknown): Record<string, unknown> {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: value.stack,
      ...(value.cause && { cause: String(value.cause) }),
    };
  }

  if (typeof value === 'object' && value !== null) {
    // Already an object, just cast it
    return value as Record<string, unknown>;
  }

  // Primitive or null/undefined
  return { value: String(value) };
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

// Export helper for creating contextual loggers on demand
export const createLogger = (context: string) => logger.createContext(context);
