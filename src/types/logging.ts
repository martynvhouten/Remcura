// Logging and error handling types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogData =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, any>
  | Array<any>
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
  | { message?: string; code?: string; status?: number }
  | string
  | unknown;

export interface ServiceErrorContext {
  service: string;
  method: string;
  user_id?: string;
  practice_id?: string;
  additional_data?: Record<string, any>;
}

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: Record<string, any>;
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
