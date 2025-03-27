import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  NotFoundException,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  Post,
  Request
} from '@nestjs/common';
import { Request as ExpressRequest } from '../../types/express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfilesService } from '../profiles/profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns the current user profile' })
  async getCurrentProfile(@Request() req: ExpressRequest) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.profilesService.getProfileByUserId(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a profile by ID' })
  @ApiResponse({ status: 200, description: 'Returns the requested profile' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Param('id') id: string) {
    const profile = await this.profilesService.getProfileById(id);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req: ExpressRequest, @Body() updateProfileDto: UpdateProfileDto) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.profilesService.updateProfile(userId, updateProfileDto);
  }

  @Post('me/photo')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiResponse({ status: 200, description: 'Photo uploaded successfully' })
  async uploadProfilePhoto(@Request() req: ExpressRequest, @UploadedFile() file: any) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.profilesService.uploadProfilePhoto(userId, file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a profile by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden access' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async updateProfileById(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    // Check if user is admin or updating their own profile
    if (userId !== id && req.user.role !== 'admin') {
      throw new ForbiddenException('You are not authorized to update this profile');
    }

    return this.profilesService.updateProfile(id, updateProfileDto);
  }
}
