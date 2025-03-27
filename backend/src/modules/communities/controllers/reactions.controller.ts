import { Controller, Get, Post, Delete, Body, Param, Request as NestRequest, UseGuards, Query } from '@nestjs/common';
import { Request as ExpressRequest } from '../../../types/express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReactionsService } from '../services/reactions.service';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionType } from '../entities/post-reaction.entity';

@Controller('reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  async createReaction(
    @NestRequest() req: ExpressRequest, 
    @Body() createReactionDto: CreateReactionDto
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.reactionsService.createReaction(userId, createReactionDto);
  }

  @Get(':type/:id')
  async getReactions(
    @Param('type') entityType: 'post' | 'comment',
    @Param('id') entityId: string,
  ) {
    return this.reactionsService.getReactions(entityId, entityType);
  }

  @Get('user/:type/:id')
  async getUserReaction(
    @NestRequest() req: ExpressRequest,
    @Param('type') entityType: 'post' | 'comment',
    @Param('id') entityId: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.reactionsService.getUserReaction(userId, entityId, entityType);
  }

  @Delete(':type/:id')
  async removeReaction(
    @NestRequest() req: ExpressRequest,
    @Param('type') entityType: 'post' | 'comment',
    @Param('id') entityId: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.reactionsService.removeReaction(userId, entityId, entityType);
  }
}
