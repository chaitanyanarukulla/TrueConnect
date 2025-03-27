import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      return this.handleHttpRequest(context, next);
    }

    if (context.getType() === 'ws') {
      return this.handleWsEvent(context, next);
    }

    // Default handler for other types
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    this.loggingService.setContext(`${controllerName}.${handlerName}`);
    
    return this.handleRequest(next);
  }

  private handleHttpRequest(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Get the controller and handler name for context
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    this.loggingService.setContext(`${controllerName}.${handlerName}`);

    // Extract request from context to get request ID if it exists
    const request = context.switchToHttp().getRequest();
    if (request && request.headers['x-request-id']) {
      this.loggingService.setRequestId(request.headers['x-request-id']);
    }

    // Measure execution time
    const startTime = process.hrtime();

    return next.handle().pipe(
      tap(() => {
        const endTime = process.hrtime(startTime);
        const executionTime = Math.round((endTime[0] * 1e9 + endTime[1]) / 1e6);
        
        // Only log if not already logged by middleware
        if (!request || !request._routeLogged) {
          this.loggingService.debug(`${handlerName} completed`, controllerName, {
            executionTime: `${executionTime}ms`,
            endpoint: request?.url,
            method: request?.method,
          });
          
          // Mark as logged to prevent duplicate logs
          if (request) request._routeLogged = true;
        }
      }),
      catchError(error => {
        // Log errors based on type
        if (error instanceof HttpException) {
          // Known HTTP exceptions
          const status = error.getStatus();
          const response = error.getResponse();
          
          if (status >= 500) {
            this.loggingService.error(
              `HTTP ${status}: ${error.message}`,
              error.stack,
              controllerName
            );
          } else if (status >= 400) {
            this.loggingService.warn(`HTTP ${status}: ${error.message}`, controllerName, {
              response,
              endpoint: request?.url,
              method: request?.method,
            });
          }
        } else {
          // Unknown exceptions
          this.loggingService.error(
            'Unhandled exception',
            error.stack,
            controllerName,
          );
          
          // Transform to InternalServerErrorException for consistent response
          error = new InternalServerErrorException('Internal server error');
        }
        
        return throwError(() => error);
      })
    );
  }

  private handleWsEvent(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const eventName = context.getArgByIndex(2) || 'unknown';
    
    this.loggingService.setContext(`WS.${eventName}`);
    
    // Log WebSocket event with minimal data
    this.loggingService.debug(`Processing WebSocket event: ${eventName}`, undefined, {
      clientId: client.id,
      userId: client.user?.id,
    });
    
    return this.handleRequest(next);
  }

  private handleRequest(next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof Error) {
          this.loggingService.error(
            error.message || 'An error occurred',
            error.stack,
          );
        } else {
          this.loggingService.error('An unknown error occurred', 
            typeof error === 'string' ? error : JSON.stringify(error)
          );
        }
        
        return throwError(() => error);
      })
    );
  }
}
