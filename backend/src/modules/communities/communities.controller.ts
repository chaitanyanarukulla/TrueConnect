import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto, CommunityCategory } from './dto/create-community.dto';
import { CommunityRole } from './entities/community-member.entity';

@ApiTags('communities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new community' })
  @ApiResponse({ status: 201, description: 'Community created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async create(@Request() req: ExpressRequest & { user: JwtPayload }, @Body() createCommunityDto: CreateCommunityDto) {
    return this.communitiesService.create(req.user.sub, createCommunityDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all communities' })
  @ApiResponse({ status: 200, description: 'List of communities.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'filter', required: false, type: String, description: 'Filter by name' })
  @ApiQuery({ 
    name: 'category', 
    required: false, 
    enum: CommunityCategory, 
    description: 'Filter by category' 
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('filter') filter?: string,
    @Query('category') categoryParam?: string,
  ) {
    // Convert string to enum value if it exists and is valid
    const category = categoryParam ? 
      (Object.values(CommunityCategory).includes(categoryParam as CommunityCategory) ? 
        categoryParam as CommunityCategory : 
        undefined) : 
      undefined;
      
    return this.communitiesService.findAll({ page, limit, filter, category });
  }

  @Get('my')
  @ApiOperation({ summary: 'Get communities the current user is a member of' })
  @ApiResponse({ status: 200, description: 'List of user\'s communities.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getMyCommunities(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.communitiesService.getUserCommunities(req.user.sub, { page, limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a community by ID' })
  @ApiResponse({ status: 200, description: 'Community details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Community not found.' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  async findOne(@Param('id') id: string) {
    return this.communitiesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a community' })
  @ApiResponse({ status: 200, description: 'Community updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Community not found.' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  async update(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
    @Body() updateCommunityDto: Partial<CreateCommunityDto>,
  ) {
    return this.communitiesService.update(id, req.user.sub, updateCommunityDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a community' })
  @ApiResponse({ status: 200, description: 'Community deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Community not found.' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  async remove(@Request() req: ExpressRequest & { user: JwtPayload }, @Param('id') id: string) {
    return this.communitiesService.remove(id, req.user.sub);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a community' })
  @ApiResponse({ status: 200, description: 'Joined community successfully.' })
  @ApiResponse({ status: 400, description: 'Already a member.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Community not found.' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  async join(@Request() req: ExpressRequest & { user: JwtPayload }, @Param('id') id: string) {
    return this.communitiesService.join(id, req.user.sub);
  }

  @Post(':id/leave')
  @ApiOperation({ summary: 'Leave a community' })
  @ApiResponse({ status: 200, description: 'Left community successfully.' })
  @ApiResponse({ status: 400, description: 'Not a member or is creator.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Community not found.' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  async leave(@Request() req: ExpressRequest & { user: JwtPayload }, @Param('id') id: string) {
    return this.communitiesService.leave(id, req.user.sub);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get community members' })
  @ApiResponse({ status: 200, description: 'List of community members.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Community not found.' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getMembers(
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.communitiesService.getMembers(id, { page, limit });
  }

  @Patch(':id/members/:memberId/role')
  @ApiOperation({ summary: 'Update a member\'s role in the community' })
  @ApiResponse({ status: 200, description: 'Member role updated successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input or cannot change creator\'s role.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires admin role.' })
  @ApiResponse({ status: 404, description: 'Community or member not found.' })
  @ApiParam({ name: 'id', description: 'Community ID' })
  @ApiParam({ name: 'memberId', description: 'Member ID' })
  async updateMemberRole(
    @Request() req: ExpressRequest & { user: JwtPayload },
    @Param('id') id: string,
    @Param('memberId') memberId: string,
    @Body('role') role: CommunityRole,
  ) {
    return this.communitiesService.updateMemberRole(id, memberId, req.user.sub, role);
  }
}
