import { IsUUID, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MatchAction {
  LIKE = 'like',
  PASS = 'pass',
}

export class CreateMatchDto {
  @ApiProperty({
    description: 'The ID of the user to match with',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  targetUserId: string;

  @ApiProperty({
    description: 'The action to take (like or pass)',
    enum: MatchAction,
    example: 'like',
  })
  @IsEnum(MatchAction)
  action: MatchAction;

  @ApiPropertyOptional({
    description: 'Whether this is a super like',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isSuperLike?: boolean;
}
