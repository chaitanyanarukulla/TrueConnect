import { IsEnum, IsOptional } from 'class-validator';
import { NotificationStatus } from '../../../types/enums';

export class UpdateNotificationDto {
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;
}
