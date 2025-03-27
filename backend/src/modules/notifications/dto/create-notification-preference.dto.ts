import { IsBoolean, IsEnum, IsOptional, IsArray, IsUUID } from 'class-validator';
import { NotificationType, NotificationChannel } from '../../../types/enums';

export class CreateNotificationPreferenceDto {
  @IsUUID()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean = true;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  channels?: NotificationChannel[] = [NotificationChannel.IN_APP];

  @IsBoolean()
  @IsOptional()
  realTime?: boolean = true;

  @IsBoolean()
  @IsOptional()
  includeInDigest?: boolean = true;
}
