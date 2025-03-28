import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from '../users/users.service';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly logger: LoggingService
  ) {
    this.logger.setContext('ProfilesService');
  }

  async getProfileById(id: string) {
    this.logger.debug(`Getting profile by ID: ${id}`);
    
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      this.logger.warn(`User with ID ${id} not found`);
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    this.logger.debug(`Retrieved profile for user ${id}`);
    return this.transformUserToProfile(user);
  }

  async getProfileByUserId(userId: string) {
    this.logger.debug(`Getting profile by user ID: ${userId}`);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`User with ID ${userId} not found`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.logger.debug(`Retrieved profile for user ${userId}`);
    return this.transformUserToProfile(user);
  }

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    this.logger.log(`Updating profile for user ${userId}`, undefined, {
      fields: Object.keys(updateProfileDto)
    });
    
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`User with ID ${userId} not found during profile update`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Update only the provided fields using type-safe approach
    const updateKeys = Object.keys(updateProfileDto) as Array<keyof UpdateProfileDto>;
    updateKeys.forEach((key) => {
      if (updateProfileDto[key] !== undefined && key in user) {
        this.logger.debug(`Updating field: ${key}`);
        // Type assertion to handle property access safely
        (user as any)[key] = updateProfileDto[key];
      }
    });

    await this.userRepository.save(user);
    this.logger.log(`Successfully updated profile for user ${userId}`);

    return this.transformUserToProfile(user);
  }

  async uploadProfilePhoto(userId: string, file: any) {
    this.logger.log(`Uploading profile photo for user ${userId}`);
    
    if (!file) {
      this.logger.warn(`No file uploaded for user ${userId}`);
      throw new BadRequestException('No file uploaded');
    }

    this.logger.debug(`Validating uploaded file: ${file.originalname}`, undefined, {
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    });

    // Validate file type
    const acceptedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!acceptedMimeTypes.includes(file.mimetype)) {
      this.logger.warn(`Invalid file type: ${file.mimetype}`);
      throw new BadRequestException('File type not supported. Please upload a JPEG, PNG, or GIF image.');
    }

    // Validate file size (max 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.logger.warn(`File size too large: ${file.size} bytes`);
      throw new BadRequestException('File size too large. Maximum allowed size is 5MB.');
    }

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      this.logger.warn(`User with ID ${userId} not found during photo upload`);
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // For now we'll simulate storing the photo URL
    // In a real implementation this would upload to S3 or similar service
    const photoUrl = `https://example.com/photos/${userId}/${file.originalname}`;
    this.logger.debug(`Generated photo URL: ${photoUrl}`);

    // Update user profile picture
    user.profilePicture = photoUrl;
    await this.userRepository.save(user);
    
    this.logger.log(`Successfully uploaded profile photo for user ${userId}`);

    return {
      success: true,
      photoUrl
    };
  }

  // Helper method to transform user entity to profile response
  private transformUserToProfile(user: User): any {
    this.logger.debug(`Transforming user entity to profile for user ${user.id}`);
    
    // Create a sanitized profile object without sensitive information
    const profile = {
      id: user.id,
      name: user.name,
      email: user.email,
      birthdate: user.birthdate,
      gender: user.gender,
      location: user.location,
      bio: user.bio,
      profilePicture: user.profilePicture,
      interests: user.interests || [],
      preferences: user.preferences || {},
      socialMedia: user.socialMedia || {},
      lookingFor: user.lookingFor || '',
      occupation: user.occupation || '',
      education: user.education || '',
      relationshipType: user.relationshipType || '',
      lifestyle: user.lifestyle || {
        smoking: '',
        drinking: '',
        diet: '',
        exercise: ''
      },
      personality: user.personality || [],
      values: user.values || [],
      privacySettings: user.privacySettings || {
        showLocation: true,
        showAge: true,
        showLastActive: true,
        showOnlineStatus: true
      },
      isVerified: user.isVerified,
      isPremium: user.isPremium,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return profile;
  }
}
