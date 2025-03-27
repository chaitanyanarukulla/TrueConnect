import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationPreferencesService } from './preferences.service';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { GatewayConnectProvider } from './providers/gateway-connect.provider';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { User } from '../users/entities/user.entity';
import { LoggingModule } from '../logging/logging.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationPreference, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET', 'trulySecretKey'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '15m'),
        },
      }),
    }),
    LoggingModule,
    AuthModule,
    UsersModule
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService, 
    NotificationPreferencesService,
    NotificationsGateway,
    GatewayConnectProvider
  ],
  exports: [
    NotificationsService, 
    NotificationPreferencesService,
    NotificationsGateway
  ]
})
export class NotificationsModule {}
