import { IsNotEmpty, IsString, IsOptional, IsArray, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ description: 'The comment content', example: 'This is a great post!' })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({ description: 'ID of the post being commented on', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID()
  postId: string;

  @ApiPropertyOptional({ description: 'ID of the parent comment (for replies)', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Media URLs associated with the comment', type: [String] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  mediaUrls?: string[];
}
