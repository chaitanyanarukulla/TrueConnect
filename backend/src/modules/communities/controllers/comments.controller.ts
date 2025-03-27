import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from '../../../types/express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CommentsService } from '../services/comments.service';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { Comment } from '../entities/comment.entity';

@ApiTags('comments')
@Controller('communities/:communityId/posts/:postId/comments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new comment on a post' })
  @ApiResponse({ status: 201, description: 'Comment created successfully', type: Comment })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  async create(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    // Ensure the post ID in the URL matches the one in the DTO
    if (postId !== createCommentDto.postId) {
      throw new ForbiddenException('Post ID mismatch');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.commentsService.createComment(userId, createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all comments for a post' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  @ApiQuery({ name: 'parentId', required: false, description: 'Filter by parent comment ID (for replies)' })
  async findAll(
    @Param('postId') postId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('parentId') parentId?: string,
  ) {
    return this.commentsService.getComments(postId, { 
      page, 
      limit, 
      parentId: parentId === 'null' ? null : parentId 
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment' })
  @ApiResponse({ status: 200, description: 'Comment retrieved successfully', type: Comment })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiParam({ name: 'id', description: 'ID of the comment' })
  async findOne(@Param('id') id: string) {
    return this.commentsService.getComment(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully', type: Comment })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiParam({ name: 'id', description: 'ID of the comment' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body('content') content: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.commentsService.updateComment(id, userId, content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiParam({ name: 'id', description: 'ID of the comment' })
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.commentsService.deleteComment(id, userId);
  }

  @Get(':id/replies')
  @ApiOperation({ summary: 'Get replies to a specific comment' })
  @ApiResponse({ status: 200, description: 'Replies retrieved successfully' })
  @ApiParam({ name: 'communityId', description: 'ID of the community' })
  @ApiParam({ name: 'postId', description: 'ID of the post' })
  @ApiParam({ name: 'id', description: 'ID of the parent comment' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
  async getReplies(
    @Param('postId') postId: string,
    @Param('id') parentId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.commentsService.getComments(postId, { page, limit, parentId });
  }
}
