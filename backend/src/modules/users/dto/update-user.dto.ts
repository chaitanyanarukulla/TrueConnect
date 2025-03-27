import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    example: true,
    description: 'Whether user has accepted terms and conditions',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  acceptedTerms?: boolean;
}
