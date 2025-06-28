/**
 * Production-ready logging utility
 * Replaces console.log statements with environment-aware logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogEntry {
  level: LogLevel
  message: string
  context?: string
  data?: any
  timestamp: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: string, data?: any): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG${context ? ` ${context}` : ''}]`, message, data || '')
    }
  }

  /**
   * Log general information
   */
  info(message: string, context?: string, data?: any): void {
    if (this.isDevelopment) {
      console.info(`[INFO${context ? ` ${context}` : ''}]`, message, data || '')
    }
    
    // In production, could send to monitoring service
    this.sendToMonitoring('info', message, context, data)
  }

  /**
   * Log warnings (always logged)
   */
  warn(message: string, context?: string, data?: any): void {
    console.warn(`[WARN${context ? ` ${context}` : ''}]`, message, data || '')
    this.sendToMonitoring('warn', message, context, data)
  }

  /**
   * Log errors (always logged)
   */
  error(message: string, context?: string, error?: Error | any): void {
    console.error(`[ERROR${context ? ` ${context}` : ''}]`, message, error || '')
    this.sendToMonitoring('error', message, context, error)
  }

  /**
   * Send logs to external monitoring service (placeholder)
   */
  private sendToMonitoring(level: LogLevel, message: string, context?: string, data?: any): void {
    if (!this.isProduction) return

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
      debug: (message: string, data?: any) => this.debug(message, context, data),
      info: (message: string, data?: any) => this.info(message, context, data),
      warn: (message: string, data?: any) => this.warn(message, context, data),
      error: (message: string, error?: Error | any) => this.error(message, context, error)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export contextual loggers for common modules
export const authLogger = logger.createContext('AUTH')
export const apiLogger = logger.createContext('API')
export const routerLogger = logger.createContext('ROUTER')
export const serviceWorkerLogger = logger.createContext('SW') 