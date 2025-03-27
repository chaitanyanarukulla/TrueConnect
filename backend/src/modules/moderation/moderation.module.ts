import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './services/reports.service';
import { ContentModerationService } from './services/content-moderation.service';
import { Report } from './entities/report.entity';
import { ContentModeration } from './entities/content-moderation.entity';
import { User } from '../users/entities/user.entity';
import { LoggingModule } from '../logging/logging.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ModerationController } from './moderation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, ContentModeration, User]),
    LoggingModule,
    NotificationsModule
  ],
  controllers: [ModerationController],
  providers: [ReportsService, ContentModerationService],
  exports: [ReportsService, ContentModerationService]
})
export class ModerationModule {}
