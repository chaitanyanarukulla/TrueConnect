import { IsNotEmpty, IsString, IsUUID, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The ID of the conversation to send the message to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  conversationId: string;

  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello! How are you today?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'The type of message',
    enum: ['text', 'image', 'location'],
    default: 'text',
  })
  @IsOptional()
  @IsString()
  @IsIn(['text', 'image', 'location'])
  messageType?: string = 'text';

  @ApiPropertyOptional({
    description: 'URL to an attachment (image, etc.)',
    example: 'https://example.com/images/photo.jpg',
  })
  @IsOptional()
  @IsString()
  attachmentUrl?: string;
}
