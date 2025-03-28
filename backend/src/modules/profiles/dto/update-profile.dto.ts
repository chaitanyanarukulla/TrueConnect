import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsUrl, MaxLength, IsEnum } from 'class-validator';

// Gender enum to match the user entity
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer-not-to-say',
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ description: 'User bio', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional({ description: 'User location' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: 'User gender', enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ description: 'User interests', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({ description: 'User preferences for dating' })
  @IsOptional()
  preferences?: {
    ageRange?: { min: number; max: number };
    distance?: number;
    genderPreferences?: Gender[];
  };

  @ApiPropertyOptional({ description: 'Social media links' })
  @IsOptional()
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    other?: string;
  };

  @ApiPropertyOptional({ description: 'User looking for (relationship goals)' })
  @IsOptional()
  @IsString()
  lookingFor?: string;
  
  @ApiPropertyOptional({ description: 'Relationship type' })
  @IsOptional()
  @IsString()
  relationshipType?: string;

  @ApiPropertyOptional({ description: 'User occupation' })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({ description: 'User education' })
  @IsOptional()
  @IsString()
  education?: string;
  
  @ApiPropertyOptional({ description: 'User lifestyle preferences' })
  @IsOptional()
  lifestyle?: {
    smoking?: string;
    drinking?: string;
    diet?: string;
    exercise?: string;
  };
  
  @ApiPropertyOptional({ description: 'User personality traits', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  personality?: string[];
  
  @ApiPropertyOptional({ description: 'User core values', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  values?: string[];

  @ApiPropertyOptional({ description: 'User profile visibility settings' })
  @IsOptional()
  privacySettings?: {
    showLocation?: boolean;
    showAge?: boolean;
    showLastActive?: boolean;
    showOnlineStatus?: boolean;
  };
  
  @ApiPropertyOptional({ description: 'User religion/spirituality' })
  @IsOptional()
  @IsString()
  religion?: string;
  
  @ApiPropertyOptional({ description: 'Importance of religion in user\'s life' })
  @IsOptional()
  @IsString()
  religiousImportance?: string;
  
  @ApiPropertyOptional({ description: 'Languages spoken by user', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
  
  @ApiPropertyOptional({ description: 'User\'s preference regarding children' })
  @IsOptional()
  @IsString()
  wantChildren?: string;
  
  @ApiPropertyOptional({ description: 'User\'s pet preferences', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  petPreferences?: string[];
  
  @ApiPropertyOptional({ description: 'User\'s communication style' })
  @IsOptional()
  @IsString()
  communicationStyle?: string;
  
  @ApiPropertyOptional({ description: 'User\'s love languages', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  loveLanguages?: string[];
}
