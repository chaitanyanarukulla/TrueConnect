import { IsString, IsOptional, IsBoolean, IsArray, Length, IsObject, ValidateNested, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CommunityCategory {
  DATING = 'dating',
  FRIENDSHIP = 'friendship',
  INTEREST = 'interest',
  LOCATION = 'location',
  ACTIVITY = 'activity',
  SUPPORT = 'support',
  OTHER = 'other',
}

export class CommunitySettings {
  @ApiProperty({
    description: 'Whether new members need approval',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  requiresApproval?: boolean;

  @ApiProperty({
    description: 'Whether posts need approval',
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  postsRequireApproval?: boolean;

  @ApiProperty({
    description: 'Whether community allows events',
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  allowEvents?: boolean;
}

export class CreateCommunityDto {
  @ApiProperty({
    description: 'Name of the community',
    maxLength: 100,
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    description: 'Description of the community',
    maxLength: 255,
  })
  @IsString()
  @Length(10, 255)
  description: string;

  @ApiProperty({
    description: 'Image URL for the community profile',
    required: false,
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    description: 'Cover image URL for the community header',
    required: false,
  })
  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @ApiProperty({
    description: 'Whether the community is private or public',
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @ApiProperty({
    description: 'Category of the community',
    required: false,
    enum: CommunityCategory,
    enumName: 'CommunityCategory',
  })
  @IsOptional()
  @IsEnum(CommunityCategory, {
    message: 'Category must be one of: dating, friendship, interest, location, activity, support, other',
  })
  category?: CommunityCategory;

  @ApiProperty({
    description: 'Tags associated with the community',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Additional community settings',
    required: false,
    type: CommunitySettings,
  })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CommunitySettings)
  settings?: CommunitySettings;
}
