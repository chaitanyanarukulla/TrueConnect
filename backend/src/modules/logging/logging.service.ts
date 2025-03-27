import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import * as winston from 'winston';
import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import { v4 as uuidv4 } from 'uuid';

// Define log levels
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService implements LoggerService {
  private context?: string;
  private requestId?: string;
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    // Get environment variables
    const nodeEnv = this.configService.get('NODE_ENV') || 'development';
    const logDir = this.configService.get('LOG_DIR') || 'logs';
    const appName = this.configService.get('APP_NAME') || 'trueconnect-api';

    // Configure Winston logger
    this.logger = createLogger({
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
            format.colorize(),
            format.printf(({ level, message, timestamp, context, requestId, ...meta }) => {
              return `${timestamp} [${level}] ${context ? `[${context}]` : ''} ${
                requestId ? `[${requestId}]` : ''
              }: ${message} ${
                Object.keys(meta).length > 1 ? `- ${JSON.stringify(meta)}` : ''
              }`;
            }),
          ),
        }),
      ],
    });

    // Add file transports based on environment
    if (nodeEnv === 'production') {
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
    }
  }

  /**
   * Set the context for the logger
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }

  /**
   * Generate or set a request ID
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
   */
  error(message: any, trace?: string, context?: string): void {
    const meta: Record<string, any> = {};
    if (trace) meta.trace = trace;
    
    this.logger.error(message, {
      context: context || this.context,
      requestId: this.requestId,
      ...meta,
    });
  }

  /**
   * Log warning messages
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
   */
  log(message: any, context?: string, meta?: Record<string, any>): void {
    this.logger.info(message, {
      context: context || this.context,
      requestId: this.requestId,
      ...(meta || {}),
    });
  }

  /**
   * Log debug messages
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
   */
  logRequest(req: Request, userId?: number): void {
    // Extract request ID from headers or generate a new one
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    this.setRequestId(requestId);

    this.debug(`Incoming Request`, 'HTTP', {
      method: req.method,
      url: req.url,
      headers: this.sanitizeHeaders(req.headers),
      body: this.sanitizeBody(req.body),
      ip: req.ip,
      userId: userId || (req as any).user?.id,
    });
  }

  /**
   * Log HTTP response details
   */
  logResponse(req: Request, res: Response, startTime: [number, number], userId?: number): void {
    const endTime = process.hrtime(startTime);
    const responseTime = Math.round((endTime[0] * 1e9 + endTime[1]) / 1e6);

    this.debug(`Outgoing Response`, 'HTTP', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: userId || (req as any).user?.id,
    });
  }

  /**
   * Log application startup details
   */
  logApplicationStartup(port: number): void {
    this.log(`TrueConnect API started successfully on port ${port}`, 'Bootstrap', {
      port,
      nodeEnv: this.configService.get('NODE_ENV') || 'development',
      time: new Date().toISOString(),
    });
  }

  /**
   * Log database connection details
   */
  logDatabaseConnection(connectionDetails: any): void {
    this.log('Database connection established', 'Database', {
      ...connectionDetails,
      password: connectionDetails.password ? '[REDACTED]' : undefined,
    });
  }

  /**
   * Sanitize headers to remove sensitive information
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sanitized = { ...headers };
    const sensitiveHeaders = ['authorization', 'cookie', 'x-auth-token'];
    
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  /**
   * Sanitize request body to remove sensitive information
   */
  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = [
      'password', 
      'currentPassword', 
      'newPassword', 
      'refreshToken',
      'token',
      'accessToken',
      'secret',
      'apiKey'
    ];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
}
