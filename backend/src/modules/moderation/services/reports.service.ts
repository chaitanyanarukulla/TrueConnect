import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Report } from '../entities/report.entity';
import { CreateReportDto } from '../dto/create-report.dto';
import { UpdateReportDto } from '../dto/update-report.dto';
import { LoggingService } from '../../logging/logging.service';
import { ReportStatus, ModerationAction } from '../../../types/enums';
import { User } from '../../users/entities/user.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../../types/enums';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: LoggingService,
    private readonly notificationsService: NotificationsService,
  ) {
    this.logger.setContext('ReportsService');
  }

  /**
   * Create a new report
   */
  async create(reporterId: string, createReportDto: CreateReportDto): Promise<Report> {
    this.logger.debug(`Creating report from user ${reporterId}`, undefined, {
      type: createReportDto.type,
      reportedId: createReportDto.reportedId,
    });

    // Verify that reporter exists
    const reporter = await this.userRepository.findOne({
      where: { id: reporterId }
    });

    if (!reporter) {
      this.logger.warn(`Reporter ${reporterId} not found`);
      throw new NotFoundException(`User with ID ${reporterId} not found`);
    }

    // Create report
    const report = this.reportRepository.create({
      ...createReportDto,
      reporterId,
      status: ReportStatus.PENDING,
    });

    const savedReport = await this.reportRepository.save(report);
    this.logger.debug(`Report ${savedReport.id} created successfully`);

    // Notify administrators about new report (this would be implementation-specific)
    // In a real-world scenario, you might want to notify admins based on report type
    // For now, we'll skip the actual notification sending

    return savedReport;
  }

  /**
   * Find all reports with optional filtering
   */
  async findAll(
    options: {
      status?: ReportStatus;
      type?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { status, type, page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const whereClause: FindOptionsWhere<Report> = {};
    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.type = type as any;
    }

    const [reports, total] = await this.reportRepository.findAndCount({
      where: whereClause,
      relations: ['reporter', 'handledBy'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    this.logger.debug(`Found ${reports.length} reports`, undefined, {
      status,
      type,
      page,
      limit
    });

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Find a single report by ID
   */
  async findOne(id: string): Promise<Report> {
    this.logger.debug(`Finding report with ID ${id}`);

    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'handledBy'],
    });

    if (!report) {
      this.logger.warn(`Report ${id} not found`);
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return report;
  }

  /**
   * Update a report (typically by a moderator or admin)
   */
  async update(
    id: string, 
    adminId: string,
    updateReportDto: UpdateReportDto
  ): Promise<Report> {
    this.logger.debug(`Updating report ${id} by admin ${adminId}`, undefined, {
      updates: Object.keys(updateReportDto)
    });

    // Get report
    const report = await this.findOne(id);

    // If report is already resolved, prevent further updates
    if (report.status === ReportStatus.RESOLVED || report.status === ReportStatus.REJECTED) {
      this.logger.warn(`Attempted to update already handled report ${id}`);
      throw new ForbiddenException(`Report ${id} has already been handled and cannot be updated`);
    }

    // Verify admin exists
    const admin = await this.userRepository.findOne({
      where: { id: adminId }
    });

    if (!admin) {
      this.logger.warn(`Admin ${adminId} not found`);
      throw new NotFoundException(`Admin with ID ${adminId} not found`);
    }

    // Update report
    if (updateReportDto.status) {
      report.status = updateReportDto.status;
      
      // If resolving or rejecting, set the resolvedAt date
      if (updateReportDto.status === ReportStatus.RESOLVED || 
          updateReportDto.status === ReportStatus.REJECTED) {
        report.resolvedAt = new Date();
      }
    }

    if (updateReportDto.action) {
      report.action = updateReportDto.action;
    }

    if (updateReportDto.adminNotes) {
      report.adminNotes = updateReportDto.adminNotes;
    }

    // Set handler
    report.handledById = adminId;

    const updatedReport = await this.reportRepository.save(report);
    this.logger.debug(`Report ${id} updated successfully`);

    // Notify the reporter about the resolution if resolved
    if (updateReportDto.status === ReportStatus.RESOLVED) {
      this.notifyReporter(updatedReport);
    }

    return updatedReport;
  }

  /**
   * Get reports by reported item
   */
  async findByReportedItem(type: string, reportedId: string): Promise<Report[]> {
    this.logger.debug(`Finding reports for ${type} with ID ${reportedId}`);

    const reports = await this.reportRepository.find({
      where: {
        type: type as any,
        reportedId,
      },
      relations: ['reporter', 'handledBy'],
      order: { createdAt: 'DESC' },
    });

    return reports;
  }

  /**
   * Get reports by reporter
   */
  async findByReporter(reporterId: string): Promise<Report[]> {
    this.logger.debug(`Finding reports made by user ${reporterId}`);

    const reports = await this.reportRepository.find({
      where: { reporterId },
      relations: ['handledBy'],
      order: { createdAt: 'DESC' },
    });

    return reports;
  }

  /**
   * Delete a report (admin only)
   */
  async remove(id: string): Promise<void> {
    this.logger.debug(`Deleting report ${id}`);

    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
    
    this.logger.debug(`Report ${id} deleted successfully`);
  }

  /**
   * Private helper to notify reporter about report resolution
   */
  private async notifyReporter(report: Report): Promise<void> {
    try {
      await this.notificationsService.create({
        recipientId: report.reporterId,
        type: NotificationType.SYSTEM,
        title: 'Your report has been resolved',
        content: `The ${report.type} you reported has been reviewed by our moderation team.`,
        data: {
          reportId: report.id,
          reportType: report.type,
          reportedId: report.reportedId,
        },
      });

      this.logger.debug(`Notification sent to user ${report.reporterId} for resolved report ${report.id}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to reporter ${report.reporterId}`, error);
      // Non-fatal error, continue even if notification fails
    }
  }
}
