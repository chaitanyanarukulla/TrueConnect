import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({
    description: 'User ID of the recipient',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  recipientId: string;

  @ApiPropertyOptional({
    description: 'Match ID if the conversation is related to a match',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  matchId?: string;

  @ApiPropertyOptional({
    description: 'Initial message content to send',
    example: 'Hey there! I noticed we matched. How are you doing?',
  })
  @IsOptional()
  initialMessage?: string;
}
