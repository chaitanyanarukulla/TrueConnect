import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID, IsDateString, IsBoolean, IsNumber, IsArray } from 'class-validator';
import { EventType, EventStatus } from '../entities/event.entity';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(EventType)
  type: EventType;

  @IsEnum(EventStatus)
  @IsOptional()
  status?: EventStatus;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  virtualMeetingUrl?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsUUID()
  @IsNotEmpty()
  communityId: string;

  @IsNumber()
  @IsOptional()
  attendeeLimit?: number;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
