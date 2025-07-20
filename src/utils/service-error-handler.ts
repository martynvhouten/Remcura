import { monitoringService } from 'src/services/monitoring';
import { apiLogger } from './logger';

export interface ServiceErrorContext {
  service: string;
  operation: string;
  userId?: string;
  practiceId?: string;
  metadata?: Record<string, any>;
}

export class ServiceError extends Error {
  public readonly code: string;
  public readonly service: string;
  public readonly operation: string;
  public readonly context?: ServiceErrorContext;
  public readonly originalError?: Error | undefined;

  constructor(
    message: string,
    code: string,
    context: ServiceErrorContext,
    originalError?: Error | undefined
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.service = context.service;
    this.operation = context.operation;
    this.context = context;
    this.originalError = originalError;

    // Maintains proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ServiceError);
    }
  }
}

export class ServiceErrorHandler {
  /**
   * Handle and enhance service errors with consistent logging and monitoring
   */
  static handle(
    error: any,
    context: ServiceErrorContext,
    options: {
      rethrow?: boolean;
      logLevel?: 'error' | 'warn' | 'info';
      includeStack?: boolean;
    } = {}
  ): ServiceError {
    const {
      rethrow = true,
      logLevel = 'error',
      includeStack = true,
    } = options;

    // Create enhanced error
    const serviceError = this.createServiceError(error, context);

    // Log error with appropriate level
    this.logError(serviceError, logLevel, includeStack);

    // Send to monitoring service
    this.captureError(serviceError, context);

    // Rethrow if requested
    if (rethrow) {
      throw serviceError;
    }

    return serviceError;
  }

  /**
   * Handle Supabase errors specifically
   */
  static handleSupabaseError(
    error: any,
    context: ServiceErrorContext,
    customMessage?: string
  ): never {
    const message = customMessage || this.getSupabaseErrorMessage(error);
    const code = this.getSupabaseErrorCode(error);
    
    const serviceError = new ServiceError(
      message,
      code,
      context,
      error
    );

    this.logError(serviceError, 'error', true);
    this.captureError(serviceError, context);

    throw serviceError;
  }

  /**
   * Handle API errors (fetch, axios, etc.)
   */
  static handleApiError(
    error: any,
    context: ServiceErrorContext,
    customMessage?: string
  ): never {
    const message = customMessage || this.getApiErrorMessage(error);
    const code = this.getApiErrorCode(error);
    
    const serviceError = new ServiceError(
      message,
      code,
      context,
      error
    );

    this.logError(serviceError, 'error', true);
    this.captureError(serviceError, context);

    throw serviceError;
  }

  /**
   * Wrap async operations with consistent error handling
   */
  static async wrap<T>(
    operation: () => Promise<T>,
    context: ServiceErrorContext,
    customMessage?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = customMessage || `${context.operation} failed`;
      this.handle(error, context, { rethrow: true });
      throw error; // TypeScript needs this, but handle() already throws
    }
  }

  /**
   * Validate required parameters and throw descriptive errors
   */
  static validateRequired(
    params: Record<string, any>,
    context: ServiceErrorContext
  ): void {
    const missing = Object.entries(params)
      .filter(([_, value]) => value === null || value === undefined || value === '')
      .map(([key]) => key);

    if (missing.length > 0) {
      const message = `Missing required parameters: ${missing.join(', ')}`;
      throw new ServiceError(
        message,
        'VALIDATION_ERROR',
        context
      );
    }
  }

  /**
   * Create a ServiceError from any error type
   */
  private static createServiceError(
    error: any,
    context: ServiceErrorContext
  ): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    const message = this.extractErrorMessage(error);
    const code = this.extractErrorCode(error);

    return new ServiceError(message, code, context, error);
  }

  /**
   * Extract meaningful error message from various error types
   */
  private static extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error?.message) return error.error.message;
    if (error?.details) return error.details;
    return 'An unknown error occurred';
  }

  /**
   * Extract error code from various error types
   */
  private static extractErrorCode(error: any): string {
    if (error?.code) return error.code;
    if (error?.error?.code) return error.error.code;
    if (error?.status) return `HTTP_${error.status}`;
    if (error?.statusCode) return `HTTP_${error.statusCode}`;
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly message from Supabase errors
   */
  private static getSupabaseErrorMessage(error: any): string {
    const message = error?.message || 'Database operation failed';
    
    // Common Supabase error translations
    if (message.includes('duplicate key')) {
      return 'Dit item bestaat al in de database';
    }
    if (message.includes('foreign key')) {
      return 'Dit item kan niet worden verwijderd omdat het in gebruik is';
    }
    if (message.includes('not found')) {
      return 'Het opgevraagde item werd niet gevonden';
    }
    if (message.includes('permission')) {
      return 'Je hebt geen toestemming voor deze actie';
    }
    if (message.includes('JWT')) {
      return 'Je sessie is verlopen. Log opnieuw in.';
    }

    return message;
  }

  /**
   * Get error code from Supabase errors
   */
  private static getSupabaseErrorCode(error: any): string {
    if (error?.code) return `SUPABASE_${error.code}`;
    if (error?.error?.code) return `SUPABASE_${error.error.code}`;
    return 'SUPABASE_ERROR';
  }

  /**
   * Get user-friendly message from API errors
   */
  private static getApiErrorMessage(error: any): string {
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.response?.statusText) {
      return `API Error: ${error.response.statusText}`;
    }
    if (error?.message) {
      return error.message;
    }
    return 'API request failed';
  }

  /**
   * Get error code from API errors
   */
  private static getApiErrorCode(error: any): string {
    if (error?.response?.status) {
      return `API_${error.response.status}`;
    }
    if (error?.status) {
      return `API_${error.status}`;
    }
    return 'API_ERROR';
  }

  /**
   * Log error with context
   */
  private static logError(
    error: ServiceError,
    level: 'error' | 'warn' | 'info',
    includeStack: boolean
  ): void {
    const logContext = `${error.service}:${error.operation}`;
    const logMessage = `${error.message} [${error.code}]`;
    
    const logData = {
      code: error.code,
      service: error.service,
      operation: error.operation,
      context: error.context,
      ...(includeStack && { stack: error.stack }),
    };

    switch (level) {
      case 'error':
        apiLogger.error(logMessage, logData);
        break;
      case 'warn':
        apiLogger.warn(logMessage, logData);
        break;
      case 'info':
        apiLogger.info(logMessage, logData);
        break;
    }
  }

  /**
   * Capture error for monitoring
   */
  private static captureError(
    error: ServiceError,
    context: ServiceErrorContext
  ): void {
    monitoringService.captureError(error, {
      userId: context.userId ?? undefined,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('sessionId') ?? 'unknown',
    });
  }
}

// Convenience functions for common use cases
export const handleSupabaseError = ServiceErrorHandler.handleSupabaseError.bind(
  ServiceErrorHandler
);

export const handleApiError = ServiceErrorHandler.handleApiError.bind(
  ServiceErrorHandler
);

export const wrapServiceCall = ServiceErrorHandler.wrap.bind(
  ServiceErrorHandler
);

export const validateRequired = ServiceErrorHandler.validateRequired.bind(
  ServiceErrorHandler
); 