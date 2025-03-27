import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { User } from '../users/entities/user.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { LoggingService } from '../logging/logging.service';
import { NotificationType, NotificationStatus, NotificationChannel } from '../../types/enums';

@Injectable()
export class NotificationsService {
  private notificationsGateway: any; // Will be set by NotificationsModule

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('NotificationsService');
  }

  /**
   * Set the notifications gateway - called from module
   * This is used to avoid circular dependency issues
   */
  setNotificationsGateway(gateway: any) {
    this.notificationsGateway = gateway;
  }

  /**
   * Create a new notification
   */
  async create(createNotificationDto: CreateNotificationDto): Promise<Notification | null> {
    this.logger.debug(`Creating notification for user ${createNotificationDto.recipientId}`, undefined, {
      type: createNotificationDto.type,
      hasSender: !!createNotificationDto.senderId
    });

    // Verify that recipient exists
    const recipient = await this.userRepository.findOne({
      where: { id: createNotificationDto.recipientId }
    });

    if (!recipient) {
      this.logger.warn(`Recipient ${createNotificationDto.recipientId} not found`);
      throw new NotFoundException(`Recipient with ID ${createNotificationDto.recipientId} not found`);
    }

    // Verify sender if provided
    if (createNotificationDto.senderId) {
      const sender = await this.userRepository.findOne({
        where: { id: createNotificationDto.senderId }
      });
      
      if (!sender) {
        this.logger.warn(`Sender ${createNotificationDto.senderId} not found`);
        throw new NotFoundException(`Sender with ID ${createNotificationDto.senderId} not found`);
      }
    }

    // Get user's notification preferences
    const preferences = await this.preferenceRepository.findOne({
      where: {
        userId: createNotificationDto.recipientId,
        type: createNotificationDto.type
      }
    });

    // If user has disabled this notification type, log and return early
    if (preferences && !preferences.enabled) {
      this.logger.debug(`Notification skipped - user ${createNotificationDto.recipientId} has disabled ${createNotificationDto.type} notifications`);
      return null;
    }

    // Determine channels to use (user preference or default)
    const channels = preferences?.channels || createNotificationDto.channels || [NotificationChannel.IN_APP];

    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      channels,
      status: NotificationStatus.UNREAD,
    });

    const savedNotification = await this.notificationRepository.save(notification);
    this.logger.debug(`Notification ${savedNotification.id} created successfully`);

    // Send notification via appropriate channels
    await this.sendViaChannels(savedNotification, channels);

    // Send real-time notification via WebSocket if available
    if (this.notificationsGateway) {
      try {
        this.notificationsGateway.notifyNewNotification(
          notification.recipientId,
          savedNotification
        );
        this.logger.debug(`Real-time notification sent via WebSocket to user ${notification.recipientId}`);
      } catch (error) {
        this.logger.error(`Failed to send real-time notification via WebSocket: ${error.message}`, error);
        // Continue even if WebSocket notification fails
      }
    }

    return savedNotification;
  }

  /**
   * Get all notifications for a user
   */
  async findAllForUser(
    userId: string,
    options: {
      status?: NotificationStatus;
      page?: number;
      limit?: number;
    } = {}
  ) {
    this.logger.debug(`Getting notifications for user ${userId}`, undefined, options);
    
    const { status, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const whereClause: FindOptionsWhere<Notification> = { recipientId: userId };
    if (status) {
      whereClause.status = status;
    }

    const [notifications, total] = await this.notificationRepository.findAndCount({
      where: whereClause,
      relations: ['sender'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    this.logger.debug(`Found ${notifications.length} notifications for user ${userId}`);

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get a single notification
   */
  async findOne(id: string, userId: string): Promise<Notification> {
    this.logger.debug(`Getting notification ${id} for user ${userId}`);
    
    const notification = await this.notificationRepository.findOne({
      where: { id, recipientId: userId },
      relations: ['sender'],
    });

    if (!notification) {
      this.logger.warn(`Notification ${id} not found for user ${userId}`);
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    return notification;
  }

  /**
   * Update a notification (typically to mark as read/archived)
   */
  async update(
    id: string,
    userId: string,
    updateNotificationDto: UpdateNotificationDto
  ): Promise<Notification> {
    this.logger.debug(`Updating notification ${id} for user ${userId}`, undefined, {
      updatedFields: Object.keys(updateNotificationDto)
    });
    
    const notification = await this.findOne(id, userId);

    if (updateNotificationDto.status) {
      notification.status = updateNotificationDto.status;
      
      // Set readAt if being marked as read
      if (updateNotificationDto.status === NotificationStatus.READ && !notification.readAt) {
        notification.readAt = new Date();
      }
    }

    await this.notificationRepository.save(notification);
    this.logger.debug(`Notification ${id} updated successfully`);

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    this.logger.debug(`Marking all notifications as read for user ${userId}`);
    
    const result = await this.notificationRepository.update(
      { recipientId: userId, status: NotificationStatus.UNREAD },
      { status: NotificationStatus.READ, readAt: new Date() }
    );

    this.logger.debug(`Marked ${result.affected} notifications as read for user ${userId}`);

    return { count: result.affected || 0 };
  }

  /**
   * Archive a notification
   */
  async archive(id: string, userId: string): Promise<Notification> {
    this.logger.debug(`Archiving notification ${id} for user ${userId}`);
    
    return this.update(id, userId, { status: NotificationStatus.ARCHIVED });
  }

  /**
   * Delete a notification (admin only)
   */
  async remove(id: string): Promise<void> {
    this.logger.debug(`Deleting notification ${id}`);
    
    const notification = await this.notificationRepository.findOne({
      where: { id }
    });

    if (!notification) {
      this.logger.warn(`Notification ${id} not found for deletion`);
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.notificationRepository.remove(notification);
    this.logger.debug(`Notification ${id} deleted successfully`);
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    this.logger.debug(`Getting unread notification count for user ${userId}`);
    
    const count = await this.notificationRepository.count({
      where: {
        recipientId: userId,
        status: NotificationStatus.UNREAD
      }
    });

    return { count };
  }

  /**
   * Send notification via appropriate channels
   * @private
   */
  private async sendViaChannels(
    notification: Notification,
    channels: NotificationChannel[]
  ): Promise<void> {
    this.logger.debug(`Sending notification ${notification.id} via channels: ${channels.join(', ')}`);
    
    const notificationInfo = {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      content: notification.content,
      data: notification.data,
      actionUrl: notification.actionUrl,
    };

    // Send through each channel
    for (const channel of channels) {
      try {
        switch (channel) {
          case NotificationChannel.IN_APP:
            // Already handled by creating the notification
            break;
            
          case NotificationChannel.EMAIL:
            // TODO: Integrate with email service
            this.logger.debug(`Would send email notification to user ${notification.recipientId}`);
            break;
            
          case NotificationChannel.PUSH:
            // TODO: Integrate with push notification service
            this.logger.debug(`Would send push notification to user ${notification.recipientId}`);
            break;
            
          case NotificationChannel.SMS:
            // TODO: Integrate with SMS service
            this.logger.debug(`Would send SMS notification to user ${notification.recipientId}`);
            break;
            
          default:
            this.logger.warn(`Unknown notification channel: ${channel}`);
        }
      } catch (error) {
        this.logger.error(`Failed to send notification ${notification.id} via ${channel}`, error);
        // Continue with other channels even if one fails
      }
    }
  }
}
