import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsUrl, IsBoolean, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostType } from '../entities/post.entity';

export class PollOption {
  @ApiProperty({ description: 'The option text' })
  @IsNotEmpty()
  @IsString()
  text: string;
}

export class CreatePostDto {
  @ApiProperty({ description: 'The post content', example: 'This is a new post about our community event!' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ 
    description: 'The type of post', 
    enum: PostType, 
    example: PostType.TEXT,
    default: PostType.TEXT
  })
  @IsEnum(PostType)
  @IsOptional()
  type?: PostType;

  @ApiPropertyOptional({ description: 'Media URLs associated with the post', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];

  @ApiPropertyOptional({ description: 'URL for link-type posts', example: 'https://example.com/article' })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Title for link-type posts', example: 'Interesting Article' })
  @IsOptional()
  @IsString()
  linkTitle?: string;

  @ApiPropertyOptional({ description: 'Description for link-type posts', example: 'This article discusses...' })
  @IsOptional()
  @IsString()
  linkDescription?: string;

  @ApiPropertyOptional({ description: 'Image URL for link-type posts', example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  linkImageUrl?: string;

  @ApiPropertyOptional({ description: 'Tags for the post', type: [String], example: ['event', 'announcement'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Whether the post is an announcement', example: false })
  @IsOptional()
  @IsBoolean()
  isAnnouncement?: boolean;

  @ApiPropertyOptional({ description: 'Whether the post should be pinned', example: false })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ 
    description: 'Poll options for poll-type posts', 
    type: [PollOption],
    example: [{ text: 'Option 1' }, { text: 'Option 2' }]
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PollOption)
  pollOptions?: PollOption[];

  @ApiProperty({ description: 'ID of the community', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID()
  communityId: string;
}
