import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationPreference } from './entities/notification-preference.entity';
import { User } from '../users/entities/user.entity';
import { CreateNotificationPreferenceDto } from './dto/create-notification-preference.dto';
import { UpdateNotificationPreferenceDto } from './dto/update-notification-preference.dto';
import { LoggingService } from '../logging/logging.service';
import { NotificationType } from '../../types/enums';

@Injectable()
export class NotificationPreferencesService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('NotificationPreferencesService');
  }

  /**
   * Create a new notification preference
   */
  async create(createDto: CreateNotificationPreferenceDto): Promise<NotificationPreference> {
    this.logger.debug(`Creating notification preference for user ${createDto.userId}`, undefined, {
      type: createDto.type
    });

    // Verify that user exists
    const user = await this.userRepository.findOne({
      where: { id: createDto.userId }
    });

    if (!user) {
      this.logger.warn(`User ${createDto.userId} not found`);
      throw new NotFoundException(`User with ID ${createDto.userId} not found`);
    }

    // Check if preference already exists
    const existingPreference = await this.preferenceRepository.findOne({
      where: {
        userId: createDto.userId,
        type: createDto.type
      }
    });

    if (existingPreference) {
      this.logger.debug(`Preference already exists, updating instead`);
      // Update existing preference instead of creating a new one
      return this.update(existingPreference.id, {
        enabled: createDto.enabled,
        channels: createDto.channels,
        realTime: createDto.realTime,
        includeInDigest: createDto.includeInDigest
      });
    }

    // Create new preference
    const preference = this.preferenceRepository.create(createDto);
    const savedPreference = await this.preferenceRepository.save(preference);
    
    this.logger.debug(`Notification preference created successfully for type ${createDto.type}`);
    return savedPreference;
  }

  /**
   * Get all notification preferences for a user
   */
  async findAllForUser(userId: string): Promise<NotificationPreference[]> {
    this.logger.debug(`Getting all notification preferences for user ${userId}`);
    
    const preferences = await this.preferenceRepository.find({
      where: { userId },
      order: { type: 'ASC' }
    });
    
    this.logger.debug(`Found ${preferences.length} notification preferences for user ${userId}`);
    return preferences;
  }

  /**
   * Get a specific notification preference
   */
  async findOne(id: string): Promise<NotificationPreference> {
    this.logger.debug(`Getting notification preference with id ${id}`);
    
    const preference = await this.preferenceRepository.findOne({
      where: { id }
    });

    if (!preference) {
      this.logger.warn(`Notification preference ${id} not found`);
      throw new NotFoundException(`Notification preference with ID ${id} not found`);
    }

    return preference;
  }

  /**
   * Get a specific notification preference by user and type
   */
  async findByUserAndType(
    userId: string,
    type: NotificationType
  ): Promise<NotificationPreference> {
    this.logger.debug(`Getting notification preference for user ${userId} and type ${type}`);
    
    const preference = await this.preferenceRepository.findOne({
      where: { userId, type }
    });

    if (!preference) {
      this.logger.debug(`Notification preference not found, will create default`);
      // Create default preference if not found
      return this.create({
        userId,
        type,
        enabled: true,
        channels: undefined, // Will use default from entity
        realTime: true,
        includeInDigest: true
      });
    }

    return preference;
  }

  /**
   * Update a notification preference
   */
  async update(
    id: string,
    updateDto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreference> {
    this.logger.debug(`Updating notification preference ${id}`, undefined, {
      updatedFields: Object.keys(updateDto)
    });
    
    const preference = await this.findOne(id);
    
    // Apply updates
    if (updateDto.enabled !== undefined) {
      preference.enabled = updateDto.enabled;
    }
    
    if (updateDto.channels !== undefined) {
      preference.channels = updateDto.channels;
    }
    
    if (updateDto.realTime !== undefined) {
      preference.realTime = updateDto.realTime;
    }
    
    if (updateDto.includeInDigest !== undefined) {
      preference.includeInDigest = updateDto.includeInDigest;
    }

    await this.preferenceRepository.save(preference);
    
    this.logger.debug(`Notification preference ${id} updated successfully`);
    return preference;
  }

  /**
   * Update a notification preference by user and type
   */
  async updateByUserAndType(
    userId: string,
    type: NotificationType,
    updateDto: UpdateNotificationPreferenceDto
  ): Promise<NotificationPreference> {
    this.logger.debug(`Updating notification preference for user ${userId} and type ${type}`);
    
    // Get or create preference
    const preference = await this.findByUserAndType(userId, type);
    
    // Update using the ID
    return this.update(preference.id, updateDto);
  }

  /**
   * Reset a user's notification preferences to defaults
   */
  async resetToDefaults(userId: string): Promise<void> {
    this.logger.debug(`Resetting notification preferences to defaults for user ${userId}`);
    
    await this.preferenceRepository.delete({ userId });
    
    this.logger.debug(`Notification preferences reset successfully for user ${userId}`);
  }
}
