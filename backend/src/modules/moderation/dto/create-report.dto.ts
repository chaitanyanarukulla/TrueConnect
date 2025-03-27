import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportType, ReportReason } from '../../../types/enums';

export class CreateReportDto {
  @IsUUID()
  @IsNotEmpty()
  reportedId: string;

  @IsEnum(ReportType)
  @IsNotEmpty()
  type: ReportType;

  @IsEnum(ReportReason)
  @IsNotEmpty()
  reason: ReportReason;

  @IsString()
  @IsOptional()
  description?: string;
}
