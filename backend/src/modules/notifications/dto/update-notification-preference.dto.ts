import { IsBoolean, IsEnum, IsOptional, IsArray } from 'class-validator';
import { NotificationType, NotificationChannel } from '../../../types/enums';

export class UpdateNotificationPreferenceDto {
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  channels?: NotificationChannel[];

  @IsBoolean()
  @IsOptional()
  realTime?: boolean;

  @IsBoolean()
  @IsOptional()
  includeInDigest?: boolean;
}
