import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostReaction } from '../entities/post-reaction.entity';
import { ReactionType } from '../../../types/enums';
import { CommentReaction } from '../entities/comment-reaction.entity';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { CreateReactionDto } from '../dto/create-reaction.dto';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(PostReaction)
    private postReactionRepository: Repository<PostReaction>,
    @InjectRepository(CommentReaction)
    private commentReactionRepository: Repository<CommentReaction>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  async createReaction(userId: string, createReactionDto: CreateReactionDto) {
    const { entityId, entityType, type } = createReactionDto;

    // Check if the entity exists
    if (entityType === 'post') {
      const post = await this.postRepository.findOne({
        where: { id: entityId },
      });
      if (!post) {
        throw new NotFoundException(`Post with ID ${entityId} not found`);
      }

      // Check if user has already reacted to this post
      const existingReaction = await this.postReactionRepository.findOne({
        where: { userId, postId: entityId },
      });

      if (existingReaction) {
        // If reaction type is the same, remove it (toggle off)
        if (existingReaction.type === type) {
          await this.postReactionRepository.remove(existingReaction);
          
          // Update post reaction count
          await this.postRepository.update(
            { id: entityId },
            { reactionCount: () => 'reaction_count - 1' }
          );
          
          return { 
            success: true, 
            message: 'Reaction removed', 
            reaction: null 
          };
        }
        
        // If reaction type is different, update it
        existingReaction.type = type;
        return { 
          success: true, 
          message: 'Reaction updated', 
          reaction: await this.postReactionRepository.save(existingReaction) 
        };
      }

      // Create new reaction
      const reaction = this.postReactionRepository.create({
        userId,
        postId: entityId,
        type,
      });
      
      // Update post reaction count
      await this.postRepository.update(
        { id: entityId },
        { reactionCount: () => 'reaction_count + 1' }
      );

      return { 
        success: true, 
        message: 'Reaction created', 
        reaction: await this.postReactionRepository.save(reaction) 
      };
    } else if (entityType === 'comment') {
      const comment = await this.commentRepository.findOne({
        where: { id: entityId },
      });
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${entityId} not found`);
      }

      // Check if user has already reacted to this comment
      const existingReaction = await this.commentReactionRepository.findOne({
        where: { userId, commentId: entityId },
      });

      if (existingReaction) {
        // If reaction type is the same, remove it (toggle off)
        if (existingReaction.type === type) {
          await this.commentReactionRepository.remove(existingReaction);
          return { 
            success: true, 
            message: 'Reaction removed', 
            reaction: null 
          };
        }
        
        // If reaction type is different, update it
        existingReaction.type = type;
        return { 
          success: true, 
          message: 'Reaction updated', 
          reaction: await this.commentReactionRepository.save(existingReaction) 
        };
      }

      // Create new reaction
      const reaction = this.commentReactionRepository.create({
        userId,
        commentId: entityId,
        type,
      });
      
      return { 
        success: true, 
        message: 'Reaction created', 
        reaction: await this.commentReactionRepository.save(reaction) 
      };
    }
  }

  async getReactions(entityId: string, entityType: 'post' | 'comment') {
    if (entityType === 'post') {
      const post = await this.postRepository.findOne({
        where: { id: entityId },
      });
      if (!post) {
        throw new NotFoundException(`Post with ID ${entityId} not found`);
      }

      const reactions = await this.postReactionRepository.find({
        where: { postId: entityId },
        relations: ['user'],
      });

      return this.groupReactionsByType(reactions);
    } else if (entityType === 'comment') {
      const comment = await this.commentRepository.findOne({
        where: { id: entityId },
      });
      if (!comment) {
        throw new NotFoundException(`Comment with ID ${entityId} not found`);
      }

      const reactions = await this.commentReactionRepository.find({
        where: { commentId: entityId },
        relations: ['user'],
      });

      return this.groupReactionsByType(reactions);
    }
  }

  async getUserReaction(userId: string, entityId: string, entityType: 'post' | 'comment') {
    if (entityType === 'post') {
      return this.postReactionRepository.findOne({
        where: { userId, postId: entityId },
      });
    } else if (entityType === 'comment') {
      return this.commentReactionRepository.findOne({
        where: { userId, commentId: entityId },
      });
    }
  }

  async removeReaction(userId: string, entityId: string, entityType: 'post' | 'comment') {
    if (entityType === 'post') {
      const reaction = await this.postReactionRepository.findOne({
        where: { userId, postId: entityId },
      });
      
      if (!reaction) {
        throw new NotFoundException(`Reaction not found`);
      }
      
      await this.postReactionRepository.remove(reaction);
      
      // Update post reaction count
      await this.postRepository.update(
        { id: entityId },
        { reactionCount: () => 'reaction_count - 1' }
      );
      
      return { success: true, message: 'Reaction removed' };
    } else if (entityType === 'comment') {
      const reaction = await this.commentReactionRepository.findOne({
        where: { userId, commentId: entityId },
      });
      
      if (!reaction) {
        throw new NotFoundException(`Reaction not found`);
      }
      
      await this.commentReactionRepository.remove(reaction);
      return { success: true, message: 'Reaction removed' };
    }
  }

  private groupReactionsByType(reactions: (PostReaction | CommentReaction)[]) {
    const summary = {
      total: reactions.length,
      types: {} as Record<ReactionType, number>,
      recentUsers: [] as Array<{ id: string; name: string; type: ReactionType }>,
    };

    // Count reactions by type
    reactions.forEach(reaction => {
      const type = reaction.type;
      if (!summary.types[type]) {
        summary.types[type] = 0;
      }
      summary.types[type]++;
    });

    // Get the most recent users (limited to 5)
    summary.recentUsers = reactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(reaction => ({
        id: reaction.user.id,
        name: reaction.user.name || 'User',
        type: reaction.type,
      }));

    return {
      summary,
      reactions,
    };
  }
}
