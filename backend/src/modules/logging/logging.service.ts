import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as winston from 'winston';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';
import * as chalk from 'chalk';

// Define log levels with corresponding colors and symbols
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
  SUCCESS = 'success', // Custom level for successful operations
  AUTH = 'auth',       // Custom level for authentication operations
  DATABASE = 'database', // Custom level for database operations
  HTTP = 'http',       // Custom level for HTTP operations
}

// Custom symbols and colors for better terminal visibility
const LOG_SYMBOLS: Record<string, string> = {
  error: '❌',
  warn: '⚠️',
  info: 'ℹ️',
  debug: '🔍',
  verbose: '🔊',
  success: '✅',
  auth: '🔐',
  database: '🗄️',
  http: '🌐',
};

/**
 * Enhanced Logging Service for TrueConnect Backend
 * 
 * Provides structured logging with context tracking, request IDs,
 * and specialized methods for different parts of the application.
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService implements LoggerService {
  private context?: string;
  private requestId?: string;
  private logger: winston.Logger;
  private isConsoleColorized: boolean;

  constructor(private configService: ConfigService) {
    // Get environment variables
    const nodeEnv = this.configService.get('NODE_ENV') || 'development';
    const logDir = this.configService.get('LOG_DIR') || 'logs';
    const appName = this.configService.get('APP_NAME') || 'trueconnect-api';
    this.isConsoleColorized = this.configService.get('LOG_COLORIZE') !== 'false';

    // Add custom log levels to Winston
    const customLevels = {
      levels: {
        error: 0,
        warn: 1,
        auth: 2,    // Authentication is high priority
        http: 3,    // HTTP requests/responses
        info: 4,
        database: 5,
        success: 6,
        debug: 7,
        verbose: 8,
      },
      colors: {
        error: 'red',
        warn: 'yellow',
        auth: 'magenta',
        http: 'cyan',
        info: 'blue',
        database: 'grey',
        success: 'green',
        debug: 'white',
        verbose: 'grey',
      }
    };

    // Custom formatter for console output
    const consoleFormatter = format.printf(({ level, message, timestamp, context, requestId, ...meta }) => {
      const symbol = LOG_SYMBOLS[level.toLowerCase()] || '';
      const formattedContext = context ? `[${context}]` : '';
      const formattedRequestId = requestId ? `[${requestId}]` : '';
      
      let metaStr = '';
      if (Object.keys(meta).length > 1) { // Skip service and environment
        const { service, environment, ...restMeta } = meta;
        if (Object.keys(restMeta).length > 0) {
          metaStr = `\n${JSON.stringify(restMeta, null, 2)}`;
        }
      }
      
      return `${symbol} ${timestamp} [${level.toUpperCase()}] ${formattedContext} ${formattedRequestId} ${message} ${metaStr}`;
    });

    // Configure Winston logger
    this.logger = createLogger({
      levels: customLevels.levels,
      level: nodeEnv === 'production' ? 'info' : 'debug',
      defaultMeta: { 
        service: appName,
        environment: nodeEnv,
      },
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.errors({ stack: true }),
        format.json(),
      ),
      transports: [
        // Always log to console
        new transports.Console({
          format: format.combine(
            this.isConsoleColorized ? format.colorize({ colors: customLevels.colors }) : format.simple(),
            consoleFormatter
          ),
        }),
      ],
    });

    // Add file transports based on environment
    if (nodeEnv === 'production' || this.configService.get('LOG_TO_FILE') === 'true') {
      // Daily rotate file transport for all logs
      this.logger.add(
        new transports.DailyRotateFile({
          dirname: logDir,
          filename: 'application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          format: format.combine(
            format.timestamp(),
            format.json(),
          ),
        })
      );

      // Daily rotate file transport for error logs
      this.logger.add(
        new transports.DailyRotateFile({
          dirname: logDir,
          filename: 'error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'error',
          format: format.combine(
            format.timestamp(),
            format.json(),
          ),
        })
      );
      
      // Separate log for authentication issues
      this.logger.add(
        new transports.DailyRotateFile({
          dirname: logDir,
          filename: 'auth-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
          level: 'auth',
          format: format.combine(
            format.timestamp(),
            format.json(),
          ),
        })
      );
    }

    // Initialize logger with application startup message
    this.log('TrueConnect API logger initialized', 'LoggingService');
  }

  /**
   * Set the context for the logger
   * @param context The module or service name
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Generate or set a request ID for tracking requests across the application
   * @param requestId Optional existing request ID or generates a new one
   */
  setRequestId(requestId?: string): this {
    this.requestId = requestId || uuidv4();
    return this;
  }

  /**
   * Get the current request ID
   */
  getRequestId(): string | undefined {
    return this.requestId;
  }

  /**
   * Log error messages
   * @param message Error message or error object
   * @param trace Stack trace or additional error details
   * @param context Optional context override
   */
  error(message: any, trace?: string, context?: string): void {
    const meta: Record<string, any> = {};
    if (trace) meta.trace = trace;
    
    // If message is an Error object, extract message and stack
    if (message instanceof Error) {
      meta.errorName = message.name;
      meta.stack = message.stack;
      message = message.message;
    }
    
    this.logger.error(message, {
      context: context || this.context,
      requestId: this.requestId,
      ...meta,
    });
  }

  /**
   * Log warning messages
   * @param message Warning message
   * @param context Optional context override
   * @param meta Additional metadata
   */
  warn(message: any, context?: string, meta?: Record<string, any>): void {
    this.logger.warn(message, {
      context: context || this.context,
      requestId: this.requestId,
      ...(meta || {}),
    });
  }

  /**
   * Log info messages (standard log method)
   * @param message Info message
   * @param context Optional context override
   * @param meta Additional metadata
   */
  log(message: any, context?: string, meta?: Record<string, any>): void {
    this.logger.info(message, {
      context: context || this.context,
      requestId: this.requestId,
      ...(meta || {}),
    });
  }

  /**
   * Log success messages for successful operations
   * @param message Success message
   * @param context Optional context override
   * @param meta Additional metadata
   */
  success(message: any, context?: string, meta?: Record<string, any>): void {
    this.logger.log('success', message, {
      context: context || this.context,
      requestId: this.requestId,
      ...(meta || {}),
    });
  }

  /**
   * Log debug messages
   * @param message Debug message
   * @param context Optional context override
   * @param meta Additional metadata
   */
  debug(message: any, context?: string, meta?: Record<string, any>): void {
    this.logger.debug(message, {
      context: context || this.context,
      requestId: this.requestId,
      ...(meta || {}),
    });
  }

  /**
   * Log verbose messages
   * @param message Verbose message
   * @param context Optional context override
   * @param meta Additional metadata
   */
  verbose(message: any, context?: string, meta?: Record<string, any>): void {
    this.logger.verbose(message, {
      context: context || this.context,
      requestId: this.requestId,
      ...(meta || {}),
    });
  }

  /**
   * Log HTTP request details
   * @param req Express request object
   * @param userId Optional user ID if authenticated
   */
  logRequest(req: Request, userId?: number): void {
    // Extract request ID from headers or generate a new one
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    this.setRequestId(requestId);

    // Determine if this is an API request
    const isApiRequest = req.url.startsWith('/api');
    
    this.logger.log('http', `Incoming Request: ${req.method} ${req.url}`, {
      context: 'HTTP',
      requestId: this.requestId,
      method: req.method,
      url: req.url,
      apiRequest: isApiRequest,
      headers: this.sanitizeHeaders(req.headers),
      body: isApiRequest ? this.sanitizeBody(req.body) : undefined,
      ip: req.ip,
      userId: userId || (req as any).user?.id,
    });
  }

  /**
   * Log HTTP response details
   * @param req Express request object
   * @param res Express response object
   * @param startTime Process hrtime when request started
   * @param userId Optional user ID if authenticated
   */
  logResponse(req: Request, res: Response, startTime: [number, number], userId?: number): void {
    const endTime = process.hrtime(startTime);
    const responseTime = Math.round((endTime[0] * 1e9 + endTime[1]) / 1e6);

    // Use different log levels based on status code
    const isError = res.statusCode >= 400;
    const level = isError ? 'error' : (res.statusCode >= 300 ? 'warn' : 'http');
    
    this.logger.log(level, `Outgoing Response: ${req.method} ${req.url} [${res.statusCode}] ${responseTime}ms`, {
      context: 'HTTP',
      requestId: this.requestId,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: userId || (req as any).user?.id,
    });
  }

  /**
   * Log authentication events
   * @param action Authentication action (login, register, etc.)
   * @param userId User ID if available
   * @param meta Additional information about the authentication
   * @param isSuccess Whether the authentication was successful
   */
  logAuth(action: string, userId?: string | number, meta?: Record<string, any>, isSuccess = true): void {
    const level = isSuccess ? 'auth' : 'error';
    const statusText = isSuccess ? 'Success' : 'Failed';
    
    this.logger.log(level, `Auth ${action}: ${statusText}`, {
      context: 'Auth',
      requestId: this.requestId,
      userId,
      action,
      success: isSuccess,
      ...(meta || {}),
    });
  }

  /**
   * Log application startup details
   * @param port The port the application is running on
   */
  logApplicationStartup(port: number): void {
    this.success(`TrueConnect API started successfully on port ${port}`, 'Bootstrap', {
      port,
      nodeEnv: this.configService.get('NODE_ENV') || 'development',
      time: new Date().toISOString(),
    });
  }

  /**
   * Log database connection details
   * @param connectionDetails Information about the database connection
   */
  logDatabaseConnection(connectionDetails: any): void {
    this.logger.log('database', 'Database connection established', {
      context: 'Database',
      requestId: this.requestId,
      ...connectionDetails,
      password: connectionDetails.password ? '[REDACTED]' : undefined,
    });
  }

  /**
   * Log database query execution
   * @param query SQL query or query information
   * @param params Query parameters
   * @param duration Query execution time in ms
   */
  logQuery(query: string, params?: any[], duration?: number): void {
    this.logger.log('database', `Database Query${duration ? ` (${duration}ms)` : ''}`, {
      context: 'Database',
      requestId: this.requestId,
      query,
      params: this.sanitizeQueryParams(params),
      duration,
    });
  }

  /**
   * Sanitize headers to remove sensitive information
   * @param headers Request headers
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token', 'x-refresh-token'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive information
   * @param body Request body
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = [
      'password', 
      'currentPassword', 
      'newPassword', 
      'confirmPassword',
      'refreshToken',
      'token',
      'accessToken',
      'secret',
      'apiKey',
      'pin',
      'code',
      'secretAnswer'
    ];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Sanitize SQL query parameters to remove sensitive information
   * @param params Query parameters
   */
  private sanitizeQueryParams(params?: any[]): any[] | undefined {
    if (!params) return params;
    
    const sanitizedParams = [...params];
    const sensitiveParamPatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /credential/i
    ];
    
    // Look for parameters that might be sensitive based on patterns
    sanitizedParams.forEach((param, index) => {
      if (typeof param === 'string' && 
          sensitiveParamPatterns.some(pattern => 
            pattern.test(sanitizedParams[index-1]?.toString() || '')
          )) {
        sanitizedParams[index] = '[REDACTED]';
      }
    });
    
    return sanitizedParams;
  }
}
