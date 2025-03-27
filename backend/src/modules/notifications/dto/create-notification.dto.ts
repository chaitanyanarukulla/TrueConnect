import { IsString, IsEnum, IsOptional, IsArray, IsUrl, IsUUID, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationChannel } from '../../../types/enums';

export class CreateNotificationDto {
  @IsUUID()
  recipientId: string;

  @IsUUID()
  @IsOptional()
  senderId?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  channels?: NotificationChannel[];

  @IsUrl()
  @IsOptional()
  actionUrl?: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;
}
