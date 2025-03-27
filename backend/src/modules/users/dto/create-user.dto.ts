import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsEnum,
} from 'class-validator';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer-not-to-say',
}

export class CreateUserDto {
  @ApiProperty({
    example: true,
    description: 'User has accepted the terms and conditions',
    required: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  acceptTerms: boolean;
  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'hashedPassword',
    description: 'The hashed password (already processed by auth service)',
  })
  @IsString()
  @IsNotEmpty()
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

  @ApiProperty({
    example: 'profile-picture.jpg',
    description: 'Profile picture filename or URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the user is verified',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether the user has premium status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPremium?: boolean;
}
