import { IsEnum, IsOptional, IsString, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { ContentStatus, ModerationAction } from '../../../types/enums';

export class UpdateContentModerationDto {
  @IsEnum(ContentStatus)
  @IsOptional()
  status?: ContentStatus;

  @IsEnum(ModerationAction)
  @IsOptional()
  action?: ModerationAction;

  @IsString()
  @IsOptional()
  moderationNotes?: string;

  @IsBoolean()
  @IsOptional()
  isAutomated?: boolean;

  @IsArray()
  @IsOptional()
  detectedIssues?: string[];

  @IsNumber()
  @IsOptional()
  confidenceScore?: number;
}
