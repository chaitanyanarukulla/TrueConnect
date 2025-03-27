import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationPreferencesService } from './preferences.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationType, NotificationStatus } from '../../types/enums';
import { LoggingService } from '../logging/logging.service';
import { User } from '../users/entities/user.entity';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly preferencesService: NotificationPreferencesService,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('NotificationsController');
  }

  @Get()
  async findAll(
    @GetUser() user: User,
    @Query('status') status?: NotificationStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug(`Getting notifications for user ${user.id}`, undefined, {
      status,
      page,
      limit,
    });

    return this.notificationsService.findAllForUser(user.id, {
      status,
      page,
      limit,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@GetUser() user: User) {
    this.logger.debug(`Getting unread count for user ${user.id}`);
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user: User) {
    this.logger.debug(`Getting notification ${id} for user ${user.id}`);
    return this.notificationsService.findOne(id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Updating notification ${id} for user ${user.id}`, undefined, {
      dto: updateNotificationDto,
    });

    return this.notificationsService.update(id, user.id, updateNotificationDto);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @GetUser() user: User) {
    this.logger.debug(`Marking notification ${id} as read for user ${user.id}`);
    
    return this.notificationsService.update(id, user.id, {
      status: NotificationStatus.READ,
    });
  }

  @Patch(':id/archive')
  async archive(@Param('id') id: string, @GetUser() user: User) {
    this.logger.debug(`Archiving notification ${id} for user ${user.id}`);
    
    return this.notificationsService.archive(id, user.id);
  }

  @Post('mark-all-read')
  async markAllAsRead(@GetUser() user: User) {
    this.logger.debug(`Marking all notifications as read for user ${user.id}`);
    
    return this.notificationsService.markAllAsRead(user.id);
  }

  // Admin only - create a notification for any user
  @Post('admin/create')
  @UseGuards(JwtAuthGuard) // TODO: Add RoleGuard for ADMIN role
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    this.logger.debug(`Admin creating notification`, undefined, {
      recipientId: createNotificationDto.recipientId,
      type: createNotificationDto.type,
    });
    
    return this.notificationsService.create(createNotificationDto);
  }

  // Notification Preferences endpoints

  @Get('preferences')
  async getPreferences(@GetUser() user: User) {
    this.logger.debug(`Getting notification preferences for user ${user.id}`);
    
    return this.preferencesService.findAllForUser(user.id);
  }

  @Get('preferences/:type')
  async getPreferenceByType(
    @Param('type') type: NotificationType,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Getting ${type} notification preference for user ${user.id}`);
    
    return this.preferencesService.findByUserAndType(user.id, type);
  }

  @Post('preferences')
  async createPreference(
    @Body() createDto: CreateNotificationPreferenceDto,
    @GetUser() user: User,
  ) {
    // Override userId with authenticated user's ID for security
    createDto.userId = user.id;
    
    this.logger.debug(`Creating notification preference for user ${user.id}`, undefined, {
      type: createDto.type,
    });
    
    return this.preferencesService.create(createDto);
  }

  @Patch('preferences/:id')
  async updatePreference(
    @Param('id') id: string,
    @Body() updateDto: UpdateNotificationPreferenceDto,
    @GetUser() user: User,
  ) {
    // First ensure the preference belongs to the user
    const preference = await this.preferencesService.findOne(id);
    
    if (preference.userId !== user.id) {
      this.logger.warn(`Unauthorized attempt to update preference ${id} by user ${user.id}`);
      throw new Error('Not authorized to update this preference');
    }
    
    this.logger.debug(`Updating notification preference ${id} for user ${user.id}`);
    
    return this.preferencesService.update(id, updateDto);
  }

  @Patch('preferences/type/:type')
  async updatePreferenceByType(
    @Param('type') type: NotificationType,
    @Body() updateDto: UpdateNotificationPreferenceDto,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Updating ${type} notification preference for user ${user.id}`);
    
    return this.preferencesService.updateByUserAndType(user.id, type, updateDto);
  }

  @Post('preferences/reset')
  async resetPreferences(@GetUser() user: User) {
    this.logger.debug(`Resetting notification preferences for user ${user.id}`);
    
    await this.preferencesService.resetToDefaults(user.id);
    return { message: 'Notification preferences reset to defaults' };
  }
}
