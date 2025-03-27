import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {
    this.loggingService.setContext('HTTP');
  }

  use(req: Request, res: Response, next: NextFunction): void {
    // Record the start time for response time calculation
    const startTime = process.hrtime();
    
    // Log the request
    this.loggingService.logRequest(req);

    // Add request ID to response headers for tracking
    const requestId = this.loggingService.getRequestId();
    if (requestId) {
      res.setHeader('x-request-id', requestId);
    }

    // Override end method to log response
    const originalEnd = res.end;
    
    // @ts-ignore - We need to override the method but there are complex function signatures
    res.end = function(...args: any[]): Response {
      // Restore original end method
      res.end = originalEnd;
      
      // Call the original end method with all arguments
      // @ts-ignore
      originalEnd.apply(res, args);
      
      // Log the response
      this.loggingService.logResponse(req, res, startTime);
      
      return res;
    }.bind(this);

    next();
  }
}
