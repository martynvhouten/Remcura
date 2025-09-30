// Logging and error handling types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogPrimitive = string | number | boolean | null | undefined;

export type LogData =
  | LogPrimitive
  | Record<string, unknown>
  | Array<unknown>
  | Error;

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: LogData;
  timestamp: Date;
  context?: string;
}

export type ErrorLike =
  | Error
  | {
      message?: string;
      code?: string;
      status?: number;
      statusCode?: number;
      error?: {
        message?: string;
        code?: string;
      };
      response?: {
        status?: number;
        statusText?: string;
        data?: {
          message?: string;
        };
      };
      details?: string;
    }
  | string;

export interface ServiceErrorContext {
  service: string;
  operation: string;
  userId?: string;
  practiceId?: string;
  metadata?: Record<string, unknown>;
}

export interface AppError {
  code?: string;
  message: string;
  details?: LogData;
  timestamp?: Date;
  context?: string;
  metadata?: Record<string, unknown>;
  originalError?: Error;
}

export enum ErrorCategory {
  VALIDATION = 'validation',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_SERVICE = 'external_service',
  SYSTEM = 'system',
  UNKNOWN = 'unknown',
}

export interface MonitoringConfig {
  enabled: boolean;
  logLevel: LogLevel;
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
}

export interface ErrorContext {
  user_id?: string;
  practice_id?: string;
  url?: string;
  userAgent?: string;
  timestamp: Date;
}
