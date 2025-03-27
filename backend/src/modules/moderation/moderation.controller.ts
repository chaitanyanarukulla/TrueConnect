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
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './services/reports.service';
import { ContentModerationService } from './services/content-moderation.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { CreateContentModerationDto } from './dto/create-content-moderation.dto';
import { UpdateContentModerationDto } from './dto/update-content-moderation.dto';
import { ReportStatus, ContentStatus, ReportType } from '../../types/enums';
import { LoggingService } from '../logging/logging.service';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('moderation')
@UseGuards(JwtAuthGuard)
export class ModerationController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly contentModerationService: ContentModerationService,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('ModerationController');
  }

  // === Reports Endpoints ===

  @Post('reports')
  async createReport(
    @Body() createReportDto: CreateReportDto,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Creating report from user ${user.id}`);
    return this.reportsService.create(user.id, createReportDto);
  }

  @Get('reports')
  async findAllReports(
    @GetUser() user: User,
    @Query('status') status?: ReportStatus,
    @Query('type') type?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug(`Getting reports for user ${user.id}`);
    
    // TODO: Add role-based authorization for admin access to all reports
    // For now, regular users can only see their own reports
    
    // For user requesting their own reports
    return this.reportsService.findByReporter(user.id);
    
    // For admins (to be implemented with role-based auth)
    // return this.reportsService.findAll({ status, type, page, limit });
  }

  @Get('reports/:id')
  async findOneReport(@Param('id') id: string, @GetUser() user: User) {
    this.logger.debug(`Getting report ${id} for user ${user.id}`);
    
    const report = await this.reportsService.findOne(id);
    
    // Only allow users to see their own reports for now
    // TODO: Add role-based authorization for admin access
    if (report.reporterId !== user.id) {
      this.logger.warn(`Unauthorized attempt to access report ${id} by user ${user.id}`);
      throw new ForbiddenException(`You are not authorized to access this report`);
    }
    
    return report;
  }

  @Patch('reports/:id')
  async updateReport(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Updating report ${id} by user ${user.id}`);
    
    // TODO: Add role-based authorization for moderation actions
    // For now, we'll assume any update is admin action
    
    return this.reportsService.update(id, user.id, updateReportDto);
  }

  // === Content Moderation Endpoints ===

  @Post('content')
  async createContentModeration(
    @Body() createDto: CreateContentModerationDto,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Creating content moderation entry by user ${user.id}`);
    
    // TODO: Add role-based authorization for content moderation
    // Regular users shouldn't be able to create moderation entries directly
    
    return this.contentModerationService.create(createDto);
  }

  @Get('content')
  async findAllContentModerations(
    @GetUser() user: User,
    @Query('status') status?: ContentStatus,
    @Query('contentType') contentType?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug(`Getting content moderation entries for user ${user.id}`);
    
    // TODO: Add role-based authorization for admin access to all content moderations
    // For now, only return basic information for demonstration
    
    return this.contentModerationService.findAll({
      status,
      contentType,
      page,
      limit,
    });
  }

  @Get('content/:id')
  async findOneContentModeration(@Param('id') id: string, @GetUser() user: User) {
    this.logger.debug(`Getting content moderation ${id} for user ${user.id}`);
    
    const moderation = await this.contentModerationService.findOne(id);
    
    // TODO: Add role-based authorization for viewing detailed moderation entries
    
    return moderation;
  }

  @Patch('content/:id')
  async updateContentModeration(
    @Param('id') id: string,
    @Body() updateDto: UpdateContentModerationDto,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Updating content moderation ${id} by user ${user.id}`);
    
    // TODO: Add role-based authorization for moderation actions
    // For now, we'll assume any update is admin action
    
    return this.contentModerationService.update(id, user.id, updateDto);
  }

  // === Convenience Endpoints for Content-Specific Reports/Moderation ===

  @Get('for-content/:type/:id')
  async getContentReportsAndModeration(
    @Param('type') type: ReportType,
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    this.logger.debug(`Getting reports and moderation for ${type} with ID ${id}`);
    
    // Get reports for this content
    const reports = await this.reportsService.findByReportedItem(type, id);
    
    // Get moderation entry if exists
    const moderation = await this.contentModerationService.findByContent(type, id);
    
    return {
      reports,
      moderation,
    };
  }
}
