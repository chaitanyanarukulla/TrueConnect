import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { Request } from '../../../types/express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommunitiesService } from '../communities.service';
import { CreateCommunityDto } from '../dto/create-community.dto';
import { Community } from '../entities/community.entity';
import { CommunityRole } from '../../../types/enums';
import { CommunityCategory } from '../dto/create-community.dto';

@ApiTags('communities')
@Controller('communities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new community' })
  @ApiResponse({ status: 201, description: 'Community created successfully', type: Community })
  async create(req: Request, @Body() createCommunityDto: CreateCommunityDto) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.communitiesService.create(userId, createCommunityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all communities' })
  @ApiResponse({ status: 200, description: 'Communities retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter by name' })
  @ApiQuery({ name: 'category', required: false, description: 'Filter by category' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: string,
    @Query('category') category?: CommunityCategory,
  ) {
    return this.communitiesService.findAll({ page, limit, filter, category: category as CommunityCategory });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get communities the user is a member of' })
  @ApiResponse({ status: 200, description: 'User communities retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10)' })
  async findUserCommunities(
    req: Request,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.communitiesService.getUserCommunities(userId, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific community' })
  @ApiResponse({ status: 200, description: 'Community retrieved successfully', type: Community })
  @ApiParam({ name: 'id', description: 'ID of the community' })
  async findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a community' })
  @ApiResponse({ status: 200, description: 'Community updated successfully', type: Community })
  @ApiParam({ name: 'id', description: 'ID of the community' })
  async update(
    req: Request,
    @Param('id') id: string,
    @Body() updateData: Partial<Community>,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.communitiesService.update(id, userId, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a community' })
  @ApiResponse({ status: 200, description: 'Community deleted successfully' })
  @ApiParam({ name: 'id', description: 'ID of the community' })
  async remove(
    req: Request,
    @Param('id') id: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.communitiesService.remove(id, userId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a community' })
  @ApiResponse({ status: 200, description: 'Joined community successfully' })
  @ApiParam({ name: 'id', description: 'ID of the community' })
  async join(
    req: Request,
    @Param('id') id: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.communitiesService.join(id, userId);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a community' })
  @ApiResponse({ status: 200, description: 'Left community successfully' })
  @ApiParam({ name: 'id', description: 'ID of the community' })
  async leave(
    req: Request,
    @Param('id') id: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.communitiesService.leave(id, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of a community' })
  @ApiResponse({ status: 200, description: 'Community members retrieved successfully' })
  @ApiParam({ name: 'id', description: 'ID of the community' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  async getMembers(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.communitiesService.getMembers(id, { page, limit });
  }

  @Patch(':id/members/:memberId/role')
  @ApiOperation({ summary: 'Update a member role' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiParam({ name: 'id', description: 'ID of the community' })
  @ApiParam({ name: 'memberId', description: 'ID of the member' })
  async updateMemberRole(
    req: Request,
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body('role') role: CommunityRole,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.communitiesService.updateMemberRole(id, memberId, userId, role as CommunityRole);
  }
}
