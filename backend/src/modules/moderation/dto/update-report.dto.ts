import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportStatus, ModerationAction } from '../../../types/enums';

export class UpdateReportDto {
  @IsEnum(ReportStatus)
  @IsOptional()
  status?: ReportStatus;

  @IsEnum(ModerationAction)
  @IsOptional()
  action?: ModerationAction;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}
