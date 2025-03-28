import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';  // This import should resolve correctly from this path
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { LoggingService } from './modules/logging';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  // Create bootstrap logger for startup process
  const bootstrapLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}] [Bootstrap]: ${message}`;
      })
    ),
    transports: [new winston.transports.Console()],
  });

  bootstrapLogger.info('Starting TrueConnect API');

  // Create the NestJS application with Winston logger
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: bootstrapLogger,
    }),
  });
  
  // Get the logging service using resolve() for scoped provider
  const loggingService = await app.resolve(LoggingService);
  loggingService.setContext('Bootstrap');
  
  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });
  
  // Add request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
    next();
  });
  
  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  loggingService.debug('Configured validation pipe');
  
  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('TrueConnect API')
    .setDescription('The TrueConnect Dating App API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  
  loggingService.debug('Configured Swagger documentation');
  
  // Global prefix for all routes with proper path rewriting
  app.setGlobalPrefix('api', {
    exclude: ['/'], // Exclude root path from prefix
  });
  
  // Add middleware to redirect root requests to their proper API routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Check if request is to the root path but has query params that match our API endpoints
    if (req.path === '/' && req.url !== '/') {
      // Extract the URL path including query parameters
      const urlWithParams = req.url;
      
      // Check for known API patterns in the query string and map them
      if (urlWithParams.includes('status=published') && urlWithParams.includes('upcoming=true')) {
        req.url = `/api/events/discover${urlWithParams}`;
      } else if (urlWithParams.includes('page=') && urlWithParams.includes('limit=10')) {
        // Handle conversations requests
        if (req.headers.accept?.includes('application/json')) {
          req.url = `/api/messages/conversations${urlWithParams}`;
        } else {
          req.url = `/api/communities${urlWithParams}`;
        }
      } else {
        // Map other root requests to their likely API endpoints based on headers
        if (req.headers['sec-ch-ua-mobile'] === '?0' && !req.headers['content-type']) {
          req.url = '/api/profiles/me';
        } else if (!req.headers['content-type'] || req.headers['content-type'].includes('application/json')) {
          req.url = '/api/matches';
        } else {
          req.url = '/api/notifications/unread-count';
        }
      }
    }
    next();
  });
  
  // Start the server
  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);
  loggingService.logApplicationStartup(port);
}

// Proper bootstrap error handling
bootstrap().catch(error => {
  console.error('Fatal error during bootstrap:', error);
  process.exit(1);
});
