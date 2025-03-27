import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { MatchesModule } from './modules/matches/matches.module';
import { MessagesModule } from './modules/messages/messages.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ModerationModule } from './modules/moderation/moderation.module';
import { HealthModule } from './health/health.module';
import { LoggingModule } from './modules/logging/logging.module';
import { LoggingMiddleware } from './modules/logging/logging.middleware';

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    // Logging module
    LoggingModule,
    
    // Database connection
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'trueconnect.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Enable temporarily to create schema
      logging: true,
      retryAttempts: 5,
      retryDelay: 1000,
      enableWAL: false, // Disable WAL mode for better compatibility
      busyErrorRetry: 1000,
      // SQLite-specific options
      extra: {
        // Improve concurrency handling
        timeout: 30000,
        // Force SQLite to use simple transactions
        mode: 'IMMEDIATE'
      }
    }),
    
    // Application modules
    UsersModule,
    AuthModule,
    ProfilesModule,
    MatchesModule,
    MessagesModule,
    CommunitiesModule,
    NotificationsModule,
    ModerationModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply logging middleware to all routes
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
