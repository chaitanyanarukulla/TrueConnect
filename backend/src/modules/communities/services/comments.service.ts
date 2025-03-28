import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Comment, CommentStatus } from '../entities/comment.entity';
import { Post, PostType } from '../entities/post.entity';
import { CommunityMember, CommunityRole } from '../entities/community-member.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { LoggingService } from '../../logging/logging.service';
import { NotificationType, NotificationChannel } from '../../../types/enums';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    
    @InjectRepository(CommunityMember)
    private communityMemberRepository: Repository<CommunityMember>,
    
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private logger: LoggingService,
  ) {
    this.logger.setContext('CommentsService');
  }

  async createComment(userId: string, createCommentDto: CreateCommentDto): Promise<Comment> {
    // Check if user exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if post exists
    const post = await this.postRepository.findOne({
      where: { id: createCommentDto.postId },
      relations: ['community'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is a member of the community
    const membership = await this.communityMemberRepository.findOne({
      where: { userId, communityId: post.communityId, isActive: true },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member of the community to comment');
    }

    // If this is a reply, check if parent comment exists
    if (createCommentDto.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: createCommentDto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      // Check if parent comment belongs to the same post
      if (parentComment.postId !== createCommentDto.postId) {
        throw new ForbiddenException('Parent comment does not belong to the specified post');
      }

      // Increment reply count for parent comment
      parentComment.replyCount += 1;
      await this.commentRepository.save(parentComment);
    }

    // Create comment
    const comment = this.commentRepository.create({
      ...createCommentDto,
      authorId: userId,
      status: CommentStatus.PUBLISHED,
      reactionCount: 0,
      replyCount: 0,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Increment comment count for post
    post.commentCount += 1;
    await this.postRepository.save(post);
    
    // Send notification to the post author if not the same as comment author
    try {
      if (post.authorId !== userId) {
        // Determine an appropriate post title for the notification
        let postTitle = 'a post';
        if (post.type === PostType.LINK && post.linkTitle) {
          postTitle = post.linkTitle;
        } else if (post.content) {
          // Use first 30 chars of content as "title" for text posts
          postTitle = post.content.length > 30 
            ? post.content.substring(0, 27) + '...' 
            : post.content;
        }
        
        await this.createCommentNotification(userId, post.authorId, post.id, savedComment, postTitle);
      }
      
      // If it's a reply, also notify the parent comment author
      if (createCommentDto.parentId) {
        const parentComment = await this.commentRepository.findOne({
          where: { id: createCommentDto.parentId },
        });
        
        if (parentComment && parentComment.authorId !== userId) {
          await this.createCommentNotification(
            userId, 
            parentComment.authorId, 
            post.id, 
            savedComment, 
            'your comment', 
            true
          );
        }
      }
    } catch (error) {
      this.logger.error(`Failed to create comment notification: ${error.message}`, error.stack);
      // Continue execution even if notification creation fails
    }

    return savedComment;
  }

  async getComments(
    postId: string, 
    options?: { page?: number; limit?: number; parentId?: string | null; }
  ): Promise<{ data: Comment[]; meta: any }> {
    const { page = 1, limit = 20, parentId } = options || {};
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await this.postRepository.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Define where conditions based on whether we're fetching top-level comments or replies
    const where: any = {
      postId,
      status: CommentStatus.PUBLISHED,
    };

    // If parentId is explicitly null, get top-level comments
    // If parentId is specified, get replies to that comment
    if (parentId === null) {
      where.parentId = null;
    } else if (parentId) {
      where.parentId = parentId;
    }

    const [comments, total] = await this.commentRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      relations: ['author'],
      skip,
      take: limit,
    });

    return {
      data: comments,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getComment(commentId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, status: CommentStatus.PUBLISHED },
      relations: ['author', 'post'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async updateComment(commentId: string, userId: string, content: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['post'],
    });

    if (!comment || comment.status === CommentStatus.DELETED) {
      throw new NotFoundException('Comment not found');
    }

    // Only the author can edit their comment
    if (comment.authorId !== userId) {
      throw new ForbiddenException('You do not have permission to edit this comment');
    }

    // Update comment
    comment.content = content;
    comment.isEdited = true;
    
    return this.commentRepository.save(comment);
  }

  /**
   * Create a notification for a new comment
   */
  private async createCommentNotification(
    senderId: string,
    recipientId: string,
    postId: string,
    comment: Comment,
    postTitle: string,
    isReply: boolean = false
  ): Promise<void> {
    this.logger.debug(`Creating comment notification for user ${recipientId} from ${senderId}`);
    
    try {
      // Get sender details for personalized notification
      const sender = await this.usersService.findById(senderId);
      
      if (!sender) {
        this.logger.warn(`Could not find sender details for comment notification`);
        return;
      }
      
      // Prepare content preview - truncate if too long
      let contentPreview = comment.content || '';
      if (contentPreview.length > 50) {
        contentPreview = contentPreview.substring(0, 47) + '...';
      }
      
      // Select appropriate notification type and content
      const notificationType = isReply ? NotificationType.COMMUNITY_COMMENT : NotificationType.COMMUNITY_POST;
      const title = isReply 
        ? `${sender.name || 'Someone'} replied to your comment`
        : `${sender.name || 'Someone'} commented on ${postTitle}`;
      
      // Create notification
      await this.notificationsService.create({
        recipientId,
        senderId,
        type: notificationType,
        title,
        content: contentPreview,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        actionUrl: `/dashboard/communities/posts/${postId}?comment=${comment.id}`,
        data: {
          postId,
          commentId: comment.id,
          isReply,
          parentId: comment.parentId
        }
      });
      
      this.logger.debug(`Successfully created comment notification for user ${recipientId}`);
    } catch (error) {
      this.logger.error(`Failed to create comment notification: ${error.message}`, error.stack);
      // Let the error propagate to the caller which will handle it
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<{ success: boolean }> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['post', 'post.community'],
    });

    if (!comment || comment.status === CommentStatus.DELETED) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user is the author or a community admin/moderator
    const isAuthor = comment.authorId === userId;
    let hasModPermission = false;

    if (!isAuthor) {
      const membership = await this.communityMemberRepository.findOne({
        where: { 
          userId, 
          communityId: comment.post.communityId, 
          isActive: true,
          role: In([CommunityRole.ADMIN, CommunityRole.MODERATOR]), 
        },
      });

      hasModPermission = !!membership;
    }

    if (!isAuthor && !hasModPermission) {
      throw new ForbiddenException('You do not have permission to delete this comment');
    }

    // Soft delete by updating status
    comment.status = CommentStatus.DELETED;
    await this.commentRepository.save(comment);

    // Update counts
    if (comment.parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: comment.parentId },
      });
      
      if (parentComment) {
        parentComment.replyCount = Math.max(0, parentComment.replyCount - 1);
        await this.commentRepository.save(parentComment);
      }
    }

    const post = await this.postRepository.findOne({
      where: { id: comment.postId },
    });
    
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await this.postRepository.save(post);
    }

    return { success: true };
  }
}
