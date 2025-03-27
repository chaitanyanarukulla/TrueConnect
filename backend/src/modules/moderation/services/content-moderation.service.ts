import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { ContentModeration } from '../entities/content-moderation.entity';
import { CreateContentModerationDto } from '../dto/create-content-moderation.dto';
import { UpdateContentModerationDto } from '../dto/update-content-moderation.dto';
import { LoggingService } from '../../logging/logging.service';
import { ContentStatus, ModerationAction, ReportType, NotificationType } from '../../../types/enums';
import { User } from '../../users/entities/user.entity';
import { NotificationsService } from '../../notifications/notifications.service';

// Simulating content moderation AI service
// In a real implementation, this would be replaced with an actual AI service integration
interface ContentModerationResult {
  isApproved: boolean;
  issues: string[];
  confidence: number;
}

@Injectable()
export class ContentModerationService {
  constructor(
    @InjectRepository(ContentModeration)
    private readonly moderationRepository: Repository<ContentModeration>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggingService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.logger.setContext('ContentModerationService');
  }

  /**
   * Create a new content moderation entry
   */
  async create(createDto: CreateContentModerationDto): Promise<ContentModeration> {
    this.logger.debug(`Creating content moderation for ${createDto.contentType} with ID ${createDto.contentId}`, undefined, {
      contentCreatorId: createDto.contentCreatorId,
    });

    // Verify that content creator exists
    const contentCreator = await this.userRepository.findOne({
      where: { id: createDto.contentCreatorId }
    });

    if (!contentCreator) {
      this.logger.warn(`Content creator ${createDto.contentCreatorId} not found`);
      throw new NotFoundException(`User with ID ${createDto.contentCreatorId} not found`);
    }

    // Check if moderation already exists for this content
    const existingModeration = await this.moderationRepository.findOne({
      where: {
        contentId: createDto.contentId,
        contentType: createDto.contentType,
      }
    });

    if (existingModeration) {
      this.logger.debug(`Moderation already exists for ${createDto.contentType} with ID ${createDto.contentId}`);
      throw new BadRequestException(`Moderation already exists for this content`);
    }

    // Run automated content moderation if enabled
    const moderationResult = await this.performAutomatedModeration(createDto.content);
    
    // Create moderation entry
    const moderation = this.moderationRepository.create({
      ...createDto,
      status: moderationResult.isApproved ? ContentStatus.APPROVED : ContentStatus.FLAGGED,
      isAutomated: true,
      detectedIssues: moderationResult.issues.length > 0 ? moderationResult.issues : null,
      confidenceScore: moderationResult.confidence,
    });

    const savedModeration = await this.moderationRepository.save(moderation);
    this.logger.debug(`Content moderation ${savedModeration.id} created successfully`);

    // If content is flagged, notify moderators (implementation specific)
    if (!moderationResult.isApproved) {
      this.notifyModerators(savedModeration);
    }

    return savedModeration;
  }

  /**
   * Find all moderation entries with optional filtering
   */
  async findAll(
    options: {
      status?: ContentStatus;
      contentType?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { status, contentType, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const whereClause: FindOptionsWhere<ContentModeration> = {};
    if (status) {
      whereClause.status = status;
    }

    if (contentType) {
      whereClause.contentType = contentType as any;
    }

    const [moderations, total] = await this.moderationRepository.findAndCount({
      where: whereClause,
      relations: ['contentCreator', 'moderatedBy'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    this.logger.debug(`Found ${moderations.length} moderation entries`, undefined, {
      status,
      contentType,
      page,
      limit
    });

    return {
      data: moderations,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find a single moderation entry by ID
   */
  async findOne(id: string): Promise<ContentModeration> {
    this.logger.debug(`Finding moderation entry with ID ${id}`);

    const moderation = await this.moderationRepository.findOne({
      where: { id },
      relations: ['contentCreator', 'moderatedBy'],
    });

    if (!moderation) {
      this.logger.warn(`Moderation entry ${id} not found`);
      throw new NotFoundException(`Moderation entry with ID ${id} not found`);
    }

    return moderation;
  }

  /**
   * Find moderation entry by content
   */
  async findByContent(contentType: ReportType, contentId: string): Promise<ContentModeration | null> {
    this.logger.debug(`Finding moderation for ${contentType} with ID ${contentId}`);

    const moderation = await this.moderationRepository.findOne({
      where: {
        contentType,
        contentId,
      },
      relations: ['contentCreator', 'moderatedBy'],
    });

    return moderation;
  }

  /**
   * Update a moderation entry (typically by a moderator)
   */
  async update(
    id: string, 
    moderatorId: string,
    updateDto: UpdateContentModerationDto
  ): Promise<ContentModeration> {
    this.logger.debug(`Updating moderation ${id} by moderator ${moderatorId}`, undefined, {
      updates: Object.keys(updateDto)
    });

    // Get moderation entry
    const moderation = await this.findOne(id);

    // Verify moderator exists
    const moderator = await this.userRepository.findOne({
      where: { id: moderatorId }
    });

    if (!moderator) {
      this.logger.warn(`Moderator ${moderatorId} not found`);
      throw new NotFoundException(`Moderator with ID ${moderatorId} not found`);
    }

    // Apply updates
    if (updateDto.status) {
      moderation.status = updateDto.status;
      
      // Set reviewedAt when a human moderator approves/rejects
      if (updateDto.status === ContentStatus.APPROVED || 
          updateDto.status === ContentStatus.REJECTED) {
        moderation.reviewedAt = new Date();
      }
    }

    if (updateDto.action) {
      moderation.action = updateDto.action;
    }

    if (updateDto.moderationNotes) {
      moderation.moderationNotes = updateDto.moderationNotes;
    }

    if (updateDto.isAutomated !== undefined) {
      moderation.isAutomated = updateDto.isAutomated;
    }

    if (updateDto.detectedIssues) {
      moderation.detectedIssues = updateDto.detectedIssues;
    }

    if (updateDto.confidenceScore !== undefined) {
      moderation.confidenceScore = updateDto.confidenceScore;
    }

    // Set moderator
    moderation.moderatedById = moderatorId;

    const updatedModeration = await this.moderationRepository.save(moderation);
    this.logger.debug(`Moderation ${id} updated successfully`);

    // Notify content creator if content is rejected
    if (updateDto.status === ContentStatus.REJECTED) {
      this.notifyContentCreator(updatedModeration);
    }

    return updatedModeration;
  }

  /**
   * Delete a moderation entry (admin only)
   */
  async remove(id: string): Promise<void> {
    this.logger.debug(`Deleting moderation entry ${id}`);

    const moderation = await this.findOne(id);
    await this.moderationRepository.remove(moderation);
    
    this.logger.debug(`Moderation entry ${id} deleted successfully`);
  }

  /**
   * Simulated automated content moderation
   * In a real implementation, this would call an external AI service
   */
  private async performAutomatedModeration(content: string): Promise<ContentModerationResult> {
    this.logger.debug(`Performing automated content moderation`);
    
    // This is a simplified simulation of an AI moderation service
    const forbiddenPatterns = [
      'offensive',
      'hate',
      'violent',
      'explicit',
      'harassment',
      'spam',
      'illegal',
    ];

    const issues: string[] = [];
    let confidence = 0.95; // Default high confidence

    // Check content for forbidden patterns
    const contentLower = content.toLowerCase();
    for (const pattern of forbiddenPatterns) {
      if (contentLower.includes(pattern)) {
        issues.push(`Potentially ${pattern} content detected`);
        confidence = Math.max(0.75, confidence - 0.05); // Reduce confidence with each issue
      }
    }

    return {
      isApproved: issues.length === 0,
      issues,
      confidence
    };
  }

  /**
   * Notify moderators about flagged content
   */
  private async notifyModerators(moderation: ContentModeration): Promise<void> {
    // In a real implementation, this would query for users with moderator roles
    // For now, we'll skip the actual notification sending
    this.logger.debug(`Would notify moderators about flagged content ${moderation.id}`);
  }

  /**
   * Notify content creator about rejected content
   */
  private async notifyContentCreator(moderation: ContentModeration): Promise<void> {
    try {
      await this.notificationsService.create({
        recipientId: moderation.contentCreatorId,
        type: NotificationType.SYSTEM,
        title: 'Your content has been removed',
        content: `Your ${moderation.contentType} has been reviewed and removed by our moderation team.`,
        data: {
          moderationId: moderation.id,
          contentType: moderation.contentType,
          contentId: moderation.contentId,
          reason: moderation.moderationNotes || 'Content policy violation',
        },
      });

      this.logger.debug(`Notification sent to user ${moderation.contentCreatorId} for rejected content ${moderation.id}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to content creator ${moderation.contentCreatorId}`, error);
      // Non-fatal error, continue even if notification fails
    }
  }
}
