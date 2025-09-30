import { captureStructuredError } from '@/services/monitoring';
import { apiLogger } from './logger';
import type { ErrorLike, ServiceErrorContext } from '@/types/logging';

const toPlainObject = (value: unknown): Record<string, unknown> | undefined => {
  if (value && typeof value === 'object') {
    return value as Record<string, unknown>;
  }
  return undefined;
};

export class ServiceError extends Error {
  public readonly code: string;
  public readonly service: string;
  public readonly operation: string;
  public readonly context: ServiceErrorContext | undefined;
  public readonly originalError: Error | undefined;

  constructor(
    message: string,
    code: string,
    service: string,
    operation: string,
    context?: ServiceErrorContext,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ServiceError';
    this.code = code;
    this.service = service;
    this.operation = operation;
    this.context = context ?? undefined;
    this.originalError = originalError ?? undefined;
  }
}

export class ServiceErrorHandler {
  static handle(
    error: ErrorLike,
    context: ServiceErrorContext,
    options: {
      rethrow?: boolean;
      logLevel?: 'error' | 'warn' | 'info';
      includeStack?: boolean;
    } = {}
  ): ServiceError {
    const { rethrow = true, logLevel = 'error', includeStack = true } = options;
    const serviceError = this.createServiceError(error, context);

    this.logError(serviceError, logLevel, includeStack);
    this.captureError(serviceError, context);

    if (rethrow) {
      throw serviceError;
    }

    return serviceError;
  }

  static handleSupabaseError(
    error: ErrorLike,
    context: ServiceErrorContext,
    customMessage?: string
  ): never {
    const message = customMessage ?? this.getSupabaseErrorMessage(error);
    const code = this.getSupabaseErrorCode(error);

    const serviceError = new ServiceError(
      message,
      code,
      context.service,
      context.operation,
      context,
      error instanceof Error ? error : undefined
    );

    this.logError(serviceError, 'error', true);
    this.captureError(serviceError, context);

    throw serviceError;
  }

  static handleApiError(
    error: ErrorLike,
    context: ServiceErrorContext,
    customMessage?: string
  ): never {
    const message = customMessage ?? this.getApiErrorMessage(error);
    const code = this.getApiErrorCode(error);

    const serviceError = new ServiceError(
      message,
      code,
      context.service,
      context.operation,
      context,
      error instanceof Error ? error : undefined
    );

    this.logError(serviceError, 'error', true);
    this.captureError(serviceError, context);

    throw serviceError;
  }

  static async wrap<T>(
    operation: () => Promise<T>,
    context: ServiceErrorContext,
    customMessage?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const serviceError = this.createServiceError(
        error instanceof Error ? error : new Error(String(error)),
        context
      );
      if (customMessage) {
        serviceError.message = customMessage;
      }
      this.logError(serviceError, 'error', true);
      this.captureError(serviceError, context);
      throw serviceError;
    }
  }

  static validateRequired(
    params: Record<string, unknown>,
    context: ServiceErrorContext
  ): void {
    const missing = Object.entries(params)
      .filter(
        ([, value]) => value === null || value === undefined || value === ''
      )
      .map(([key]) => key);

    if (missing.length > 0) {
      throw new ServiceError(
        `Missing required parameters: ${missing.join(', ')}`,
        'VALIDATION_ERROR',
        context.service,
        context.operation,
        context
      );
    }
  }

  private static createServiceError(
    error: ErrorLike,
    context: ServiceErrorContext
  ): ServiceError {
    if (error instanceof ServiceError) {
      return error;
    }

    const message = this.extractErrorMessage(error);
    const code = this.extractErrorCode(error);
    const original = error instanceof Error ? error : undefined;

    return new ServiceError(
      message,
      code,
      context.service,
      context.operation,
      context,
      original
    );
  }

  private static extractErrorMessage(error: ErrorLike): string {
    if (typeof error === 'string') {
      return error;
    }

    const maybeError = error as
      | (Partial<Error> & { error?: { message?: string }; details?: string })
      | undefined;

    if (maybeError?.message) {
      return maybeError.message;
    }
    if (maybeError?.error?.message) {
      return maybeError.error.message ?? 'An unknown error occurred';
    }
    if (maybeError?.details) {
      return maybeError.details;
    }

    return 'An unknown error occurred';
  }

  private static extractErrorCode(error: ErrorLike): string {
    if (typeof error === 'string') {
      return 'STRING_ERROR';
    }

    const maybeError = error as
      | {
          code?: string;
          error?: { code?: string };
          status?: number;
          statusCode?: number;
        }
      | undefined;

    if (maybeError?.code) {
      return maybeError.code;
    }
    if (maybeError?.error?.code) {
      return maybeError.error.code ?? 'UNKNOWN_ERROR';
    }
    if (maybeError?.status) {
      return `HTTP_${maybeError.status}`;
    }
    if (maybeError?.statusCode) {
      return `HTTP_${maybeError.statusCode}`;
    }

    return 'UNKNOWN_ERROR';
  }

  private static getSupabaseErrorMessage(error: ErrorLike): string {
    const maybeError = error as { message?: string } | undefined;
    const message = maybeError?.message ?? 'Database operation failed';

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

  private static getSupabaseErrorCode(error: ErrorLike): string {
    const maybeError = error as
      | {
          code?: string;
          error?: { code?: string };
        }
      | undefined;

    if (maybeError?.code) {
      return `SUPABASE_${maybeError.code}`;
    }
    if (maybeError?.error?.code) {
      return `SUPABASE_${maybeError.error.code}`;
    }
    return 'SUPABASE_ERROR';
  }

  private static getApiErrorMessage(error: ErrorLike): string {
    const maybeError = error as
      | {
          response?: { data?: { message?: string }; statusText?: string };
          message?: string;
        }
      | undefined;

    if (maybeError?.response?.data?.message) {
      return maybeError.response.data.message ?? 'API request failed';
    }
    if (maybeError?.response?.statusText) {
      return `API Error: ${maybeError.response.statusText}`;
    }
    if (maybeError?.message) {
      return maybeError.message;
    }
    return 'API request failed';
  }

  private static getApiErrorCode(error: ErrorLike): string {
    const maybeError = error as
      | {
          response?: { status?: number };
          status?: number;
        }
      | undefined;

    if (maybeError?.response?.status) {
      return `API_${maybeError.response.status}`;
    }
    if (maybeError?.status) {
      return `API_${maybeError.status}`;
    }
    return 'API_ERROR';
  }

  private static logError(
    error: ServiceError,
    level: 'error' | 'warn' | 'info',
    includeStack: boolean
  ): void {
    const logMessage = `${error.message} [${error.code}]`;

    const logData: Record<string, unknown> = {
      code: error.code,
      service: error.service,
      operation: error.operation,
      context: error.context,
      ...(includeStack && error.stack ? { stack: error.stack } : {}),
      originalError: error.originalError
        ? toPlainObject(error.originalError)
        : undefined,
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

  private static captureError(
    error: ServiceError,
    context: ServiceErrorContext
  ): void {
    const metadata: Record<string, unknown> = {
      userId: context.userId,
      practiceId: context.practiceId,
      ...context.metadata,
      timestamp: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      metadata.url = window.location.href;
    }

    if (typeof navigator !== 'undefined') {
      metadata.userAgent = navigator.userAgent;
    }

    if (typeof sessionStorage !== 'undefined') {
      metadata.sessionId = sessionStorage.getItem('sessionId') ?? undefined;
    }

    captureStructuredError(error, metadata);
  }
}

export const handleSupabaseError =
  ServiceErrorHandler.handleSupabaseError.bind(ServiceErrorHandler);

export const handleApiError =
  ServiceErrorHandler.handleApiError.bind(ServiceErrorHandler);

export const wrapServiceCall =
  ServiceErrorHandler.wrap.bind(ServiceErrorHandler);

export const validateRequired =
  ServiceErrorHandler.validateRequired.bind(ServiceErrorHandler);
