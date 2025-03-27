import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ReportType } from '../../../types/enums';

export class CreateContentModerationDto {
  @IsUUID()
  @IsNotEmpty()
  contentId: string;

  @IsEnum(ReportType)
  @IsNotEmpty()
  contentType: ReportType;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsUUID()
  @IsNotEmpty()
  contentCreatorId: string;

  @IsString()
  @IsOptional()
  moderationNotes?: string;
}
