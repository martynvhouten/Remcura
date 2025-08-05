import { monitoringService } from '@/services/monitoring';
import { apiLogger } from './logger';
import type { ErrorLike, ServiceErrorContext } from '@/types/logging';

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
    error: ErrorLike,
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
    error: ErrorLike,
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
    error: ErrorLike,
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
    error: ErrorLike,
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
  private static extractErrorMessage(error: ErrorLike): string {
      if (typeof error === 'string') { return error; }
  if (error?.message) { return error.message; }
  if (error?.error?.message) { return error.error.message; }
  if (error?.details) { return error.details; }
    return 'An unknown error occurred';
  }

  /**
   * Extract error code from various error types
   */
  private static extractErrorCode(error: ErrorLike): string {
      if (error?.code) { return error.code; }
  if (error?.error?.code) { return error.error.code; }
  if (error?.status) { return `HTTP_${error.status}`; }
  if (error?.statusCode) { return `HTTP_${error.statusCode}`; }
    return 'UNKNOWN_ERROR';
  }

  /**
   * Get user-friendly message from Supabase errors
   */
  private static getSupabaseErrorMessage(error: ErrorLike): string {
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
  private static getSupabaseErrorCode(error: ErrorLike): string {
      if (error?.code) { return `SUPABASE_${error.code}`; }
  if (error?.error?.code) { return `SUPABASE_${error.error.code}`; }
    return 'SUPABASE_ERROR';
  }

  /**
   * Get user-friendly message from API errors
   */
  private static getApiErrorMessage(error: ErrorLike): string {
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
  private static getApiErrorCode(error: ErrorLike): string {
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

// Error Categories for better handling
export enum ErrorCategory {
  VALIDATION = 'validation',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER_ERROR = 'server_error',
  CLIENT_ERROR = 'client_error',
  SUPABASE = 'supabase',
  UNEXPECTED = 'unexpected'
}

// User-friendly error messages
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  NETWORK_ERROR: 'Er is een netwerkfout opgetreden. Controleer je internetverbinding.',
  TIMEOUT_ERROR: 'De aanvraag duurde te lang. Probeer het opnieuw.',
  
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'Onjuiste inloggegevens. Controleer je e-mailadres en wachtwoord.',
  AUTH_SESSION_EXPIRED: 'Je sessie is verlopen. Log opnieuw in.',
  AUTH_UNAUTHORIZED: 'Je hebt geen toegang tot deze functie.',
  
  // Validation errors
  VALIDATION_REQUIRED: 'Dit veld is verplicht.',
  VALIDATION_INVALID_EMAIL: 'Voer een geldig e-mailadres in.',
  VALIDATION_INVALID_FORMAT: 'Ongeldige invoer. Controleer het formaat.',
  
  // Supabase errors
  SUPABASE_CONNECTION: 'Kan geen verbinding maken met de database.',
  SUPABASE_TIMEOUT: 'Database timeout. Probeer het opnieuw.',
  SUPABASE_POLICY: 'Je hebt geen toegang tot deze gegevens.',
  
  // Generic fallbacks
  SERVER_ERROR: 'Er is een serverfout opgetreden. Probeer het later opnieuw.',
  CLIENT_ERROR: 'Er is een fout opgetreden. Ververs de pagina en probeer opnieuw.',
  UNEXPECTED_ERROR: 'Er is een onverwachte fout opgetreden. Neem contact op met support als dit probleem aanhoudt.'
};

/**
 * Enhanced error handler with categorization and user-friendly messages
 */
export class ErrorHandler {
  /**
   * Categorize error based on error properties
   */
  static categorizeError(error: ErrorLike): ErrorCategory {
    if (typeof error === 'string') {
      return ErrorCategory.CLIENT_ERROR;
    }

    if (error instanceof ServiceError) {
      const code = error.code.toLowerCase();
      
      if (code.includes('auth') || code.includes('unauthorized') || code.includes('401')) {
        return ErrorCategory.AUTHENTICATION;
      }
      if (code.includes('forbidden') || code.includes('403')) {
        return ErrorCategory.AUTHORIZATION;
      }
      if (code.includes('not_found') || code.includes('404')) {
        return ErrorCategory.NOT_FOUND;
      }
      if (code.includes('validation') || code.includes('invalid')) {
        return ErrorCategory.VALIDATION;
      }
      if (code.includes('network') || code.includes('timeout')) {
        return ErrorCategory.NETWORK;
      }
      if (code.includes('supabase') || code.includes('42P17')) {
        return ErrorCategory.SUPABASE;
      }
    }

    // Check for network/connection errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return ErrorCategory.NETWORK;
    }

    // Check HTTP status codes
    const status = error?.status || error?.response?.status;
    if (status) {
        if (status === 401) { return ErrorCategory.AUTHENTICATION; }
  if (status === 403) { return ErrorCategory.AUTHORIZATION; }
  if (status === 404) { return ErrorCategory.NOT_FOUND; }
  if (status >= 400 && status < 500) { return ErrorCategory.CLIENT_ERROR; }
  if (status >= 500) { return ErrorCategory.SERVER_ERROR; }
    }

    return ErrorCategory.UNEXPECTED;
  }

  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: ErrorLike, category?: ErrorCategory): string {
    const errorCategory = category || this.categorizeError(error);
    
    // Try to get specific error message first
    if (error instanceof ServiceError) {
      const specificMessage = ERROR_MESSAGES[error.code];
      if (specificMessage) { return specificMessage; }
    }

    // Fall back to category-based messages
    switch (errorCategory) {
      case ErrorCategory.VALIDATION:
        return ERROR_MESSAGES.VALIDATION_INVALID_FORMAT;
      case ErrorCategory.NETWORK:
        return ERROR_MESSAGES.NETWORK_ERROR;
      case ErrorCategory.AUTHENTICATION:
        return ERROR_MESSAGES.AUTH_SESSION_EXPIRED;
      case ErrorCategory.AUTHORIZATION:
        return ERROR_MESSAGES.AUTH_UNAUTHORIZED;
      case ErrorCategory.NOT_FOUND:
        return 'De gevraagde gegevens konden niet worden gevonden.';
      case ErrorCategory.SUPABASE:
        return ERROR_MESSAGES.SUPABASE_CONNECTION;
      case ErrorCategory.SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      case ErrorCategory.CLIENT_ERROR:
        return ERROR_MESSAGES.CLIENT_ERROR;
      default:
        return ERROR_MESSAGES.UNEXPECTED_ERROR;
    }
  }

  /**
   * Handle error with full processing (logging, categorization, user message)
   */
  static async handleError(
    error: ErrorLike,
    context: ServiceErrorContext,
    options: {
      showToUser?: boolean;
      logLevel?: 'error' | 'warn' | 'info';
      includeStack?: boolean;
    } = {}
  ): Promise<{
    category: ErrorCategory;
    userMessage: string;
    serviceError: ServiceError;
  }> {
    const { showToUser = false, logLevel = 'error', includeStack = true } = options;

    // Create or enhance service error
    let serviceError: ServiceError;
    if (error instanceof ServiceError) {
      serviceError = error;
    } else {
      serviceError = ServiceErrorHandler.createServiceError(
        error,
        context.service,
        context.operation,
        context
      );
    }

    // Categorize the error
    const category = this.categorizeError(serviceError);
    
    // Get user-friendly message
    const userMessage = this.getUserMessage(serviceError, category);

    // Log the error using ServiceErrorHandler
    ServiceErrorHandler.logError(serviceError, logLevel, includeStack);

    // Capture for monitoring
    ServiceErrorHandler.captureError(serviceError, context);

    // Show notification to user if requested
    if (showToUser) {
      this.showErrorNotification(userMessage, category);
    }

    return {
      category,
      userMessage,
      serviceError
    };
  }

  /**
   * Show error notification to user (can be extended with toast/notification library)
   */
  private static showErrorNotification(message: string, category: ErrorCategory): void {
    // For now, use console.warn as a placeholder
    // In a real app, you'd integrate with your notification system (Quasar Notify, etc.)
    console.warn(`[${category.toUpperCase()}] ${message}`);
    
    // Example with Quasar Notify (if available):
    // if (window.$q?.notify) {
    //   window.$q.notify({
    //     type: category === ErrorCategory.VALIDATION ? 'warning' : 'negative',
    //     message: message,
    //     position: 'top-right',
    //     timeout: category === ErrorCategory.NETWORK ? 0 : 5000, // Network errors stay until dismissed
    //     actions: [{ icon: 'close', color: 'white' }]
    //   });
    // }
  }

  /**
   * Wrap async function calls with automatic error handling
   */
  static async wrapCall<T>(
    fn: () => Promise<T>,
    context: ServiceErrorContext,
    options?: {
      showToUser?: boolean;
      logLevel?: 'error' | 'warn' | 'info';
      includeStack?: boolean;
      fallbackValue?: T;
    }
  ): Promise<T | undefined> {
    try {
      return await fn();
    } catch (error) {
      const result = await this.handleError(error, context, options);
      
      // Return fallback value if provided
      if (options?.fallbackValue !== undefined) {
        return options.fallbackValue;
      }
      
      // Re-throw for caller to handle if needed
      throw result.serviceError;
    }
  }

  /**
   * Global error handler for unhandled promise rejections
   */
  static setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.handleError(error, {
        service: 'global',
        operation: 'unhandled_rejection',
        metadata: {
          url: window.location.href,
          timestamp: new Date().toISOString()
        }
      }, {
        showToUser: true,
        logLevel: 'error'
      });
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, {
        service: 'global',
        operation: 'javascript_error',
        metadata: {
          url: window.location.href,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString()
        }
      }, {
        showToUser: false, // Don't show JS errors to users
        logLevel: 'error'
      });
    });
  }
} 