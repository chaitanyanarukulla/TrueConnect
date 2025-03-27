import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WsLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('WebSocket');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'ws') {
      return next.handle();
    }

    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const eventName = context.getArgByIndex(2);
    
    // Generate request ID for this socket event
    const requestId = uuidv4();
    this.loggingService.setRequestId(requestId);

    // Log incoming WebSocket message
    this.loggingService.debug(`WS Event: ${eventName}`, 'Socket.IO', {
      clientId: client.id,
      userId: client.user?.id,
      data: this.sanitizeData(data),
    });

    return next.handle().pipe(
      tap(response => {
        // Log outgoing WebSocket response
        this.loggingService.debug(`WS Response: ${eventName}`, 'Socket.IO', {
          clientId: client.id,
          userId: client.user?.id,
          success: true,
        });
      }),
      catchError(error => {
        // Log errors
        this.loggingService.error(
          `WS Error in ${eventName}: ${error.message}`,
          error.stack,
          'Socket.IO'
        );
        
        // Rethrow the error to be handled by the gateway exception filters
        throw error;
      })
    );
  }

  /**
   * Sanitize WebSocket event data to remove sensitive information
   */
  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    const sensitiveFields = [
      'password', 
      'token', 
      'refreshToken', 
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
