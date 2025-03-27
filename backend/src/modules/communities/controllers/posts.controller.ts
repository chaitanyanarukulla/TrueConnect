import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from '../../../types/express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PostsService } from '../services/posts.service';
import { CreatePostDto } from '../dto/create-post.dto';
import { Post as PostEntity, PostType } from '../entities/post.entity';

@ApiTags('posts')
@Controller('communities/:communityId/posts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully', type: PostEntity })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  async create(
    @Req() req: Request,
    @Param('communityId') communityId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    // Ensure the community ID in the URL matches the one in the DTO
    if (communityId !== createPostDto.communityId) {
      throw new ForbiddenException('Community ID mismatch');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.postsService.createPost(userId, createPostDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts for a community' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'filter', required: false, description: 'Filter posts by content' })
  async findAll(
    @Param('communityId') communityId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('filter') filter?: string,
  ) {
    return this.postsService.getPosts(communityId, { page, limit, filter });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific post' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully', type: PostEntity })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  async findOne(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully', type: PostEntity })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateData: Partial<PostEntity>,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.postsService.updatePost(id, userId, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.postsService.deletePost(id, userId);
  }

  @Patch(':id/pin')
  @ApiOperation({ summary: 'Pin or unpin a post' })
  @ApiResponse({ status: 200, description: 'Post pin status updated successfully', type: PostEntity })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  async pinPost(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('isPinned') isPinned: boolean,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.postsService.pinPost(id, userId, isPinned);
  }

  @Patch(':id/announcement')
  @ApiOperation({ summary: 'Mark a post as an announcement or remove announcement status' })
  @ApiResponse({ status: 200, description: 'Post announcement status updated successfully', type: PostEntity })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'id', description: 'ID of the post' })
  async markAsAnnouncement(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('isAnnouncement') isAnnouncement: boolean,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.postsService.markAsAnnouncement(id, userId, isAnnouncement);
  }
}
