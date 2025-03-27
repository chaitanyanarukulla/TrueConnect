import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsDateString,
  IsEnum,
  Matches,
  IsOptional,
} from 'class-validator';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer-not-to-say',
}

export class RegisterDto {
  @ApiProperty({
    example: true,
    description: 'User has accepted the terms and conditions',
    required: true,
  })
  @IsNotEmpty()
  acceptTerms: boolean;
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'StrongP@ss123',
    description: 'User password (min 8 chars, must include upper, lower, number, special)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must include uppercase, lowercase, number and special character',
    },
  )
  password: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Date of birth in ISO format',
  })
  @IsDateString()
  @IsNotEmpty()
  birthdate: string;

  @ApiProperty({
    enum: Gender,
    example: 'male',
    description: 'User gender identity',
  })
  @IsEnum(Gender)
  @IsNotEmpty()
  gender: string;

  @ApiProperty({
    example: 'New York, NY',
    description: 'User location',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    example: 'I love hiking and photography',
    description: 'Brief bio about the user',
    required: false,
  })
  @IsString()
  @IsOptional()
  bio?: string;
}
