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
    
    // Database connection - Using SQLite for development
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'trueconnect.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Auto-create database schema
      dropSchema: false, // Keep existing data
      logging: true,
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
