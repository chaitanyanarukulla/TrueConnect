import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Post, PostStatus, PostType } from '../entities/post.entity';
import { Community } from '../entities/community.entity';
import { CommunityMember, CommunityRole } from '../entities/community-member.entity';
import { CreatePostDto } from '../dto/create-post.dto';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    
    @InjectRepository(CommunityMember)
    private communityMemberRepository: Repository<CommunityMember>,
    
    private usersService: UsersService,
  ) {}

  async createPost(userId: string, createPostDto: CreatePostDto): Promise<Post> {
    // Check if user exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if community exists
    const community = await this.communityRepository.findOne({
      where: { id: createPostDto.communityId, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is a member of the community
    const membership = await this.communityMemberRepository.findOne({
      where: { userId, communityId: createPostDto.communityId, isActive: true },
    });

    if (!membership) {
      throw new ForbiddenException('You must be a member of the community to create posts');
    }

    // Validate post type-specific fields
    if (createPostDto.type === PostType.LINK && !createPostDto.linkUrl) {
      throw new BadRequestException('Link URL is required for link posts');
    }

    if (createPostDto.type === PostType.POLL && (!createPostDto.pollOptions || createPostDto.pollOptions.length < 2)) {
      throw new BadRequestException('Poll posts require at least 2 options');
    }

    // Create post
    const post = this.postRepository.create({
      ...createPostDto,
      authorId: userId,
      status: PostStatus.PUBLISHED,
      viewCount: 0,
      commentCount: 0,
      reactionCount: 0,
      shareCount: 0,
    });

    return this.postRepository.save(post);
  }

  async getPosts(
    communityId: string, 
    options?: { page?: number; limit?: number; filter?: string; }
  ): Promise<{ data: Post[]; meta: any }> {
    const { page = 1, limit = 20, filter } = options || {};
    const skip = (page - 1) * limit;

    // Check if community exists
    const community = await this.communityRepository.findOne({
      where: { id: communityId, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const where: FindOptionsWhere<Post> = {
      communityId,
      status: PostStatus.PUBLISHED,
    };

    if (filter) {
      where.content = filter;
    }

    const [posts, total] = await this.postRepository.findAndCount({
      where,
      order: {
        isPinned: 'DESC',
        createdAt: 'DESC',
      },
      relations: ['author'],
      skip,
      take: limit,
    });

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPost(postId: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId, status: PostStatus.PUBLISHED },
      relations: ['author', 'community'],
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment view count
    post.viewCount += 1;
    await this.postRepository.save(post);

    return post;
  }

  async updatePost(postId: string, userId: string, updateData: Partial<Post>): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['community'],
    });

    if (!post || post.status === PostStatus.DELETED) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is the author or a community admin
    if (post.authorId !== userId) {
      const membership = await this.communityMemberRepository.findOne({
        where: { userId, communityId: post.communityId, isActive: true },
      });

      if (!membership || membership.role !== CommunityRole.ADMIN) {
        throw new ForbiddenException('You do not have permission to update this post');
      }
    }

    // Remove fields that cannot be updated
    const safeUpdateData = { ...updateData };
    delete safeUpdateData.id;
    delete safeUpdateData.authorId;
    delete safeUpdateData.communityId;
    delete safeUpdateData.createdAt;
    delete safeUpdateData.viewCount;
    delete safeUpdateData.commentCount;
    delete safeUpdateData.reactionCount;
    delete safeUpdateData.shareCount;

    // Update post
    const updatedPost = { ...post, ...safeUpdateData };
    return this.postRepository.save(updatedPost);
  }

  async deletePost(postId: string, userId: string): Promise<{ success: boolean }> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['community'],
    });

    if (!post || post.status === PostStatus.DELETED) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is the author or a community admin
    if (post.authorId !== userId) {
      const membership = await this.communityMemberRepository.findOne({
        where: { userId, communityId: post.communityId, isActive: true },
      });

      if (!membership || membership.role !== CommunityRole.ADMIN) {
        throw new ForbiddenException('You do not have permission to delete this post');
      }
    }

    // Soft delete by updating status
    post.status = PostStatus.DELETED;
    await this.postRepository.save(post);

    return { success: true };
  }

  async pinPost(postId: string, userId: string, isPinned: boolean): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['community'],
    });

    if (!post || post.status === PostStatus.DELETED) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is a community admin
    const membership = await this.communityMemberRepository.findOne({
      where: { userId, communityId: post.communityId, isActive: true },
    });

    if (!membership || membership.role !== CommunityRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to pin/unpin posts');
    }

    // Update pin status
    post.isPinned = isPinned;
    return this.postRepository.save(post);
  }

  async markAsAnnouncement(postId: string, userId: string, isAnnouncement: boolean): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['community'],
    });

    if (!post || post.status === PostStatus.DELETED) {
      throw new NotFoundException('Post not found');
    }

    // Check if user is a community admin
    const membership = await this.communityMemberRepository.findOne({
      where: { userId, communityId: post.communityId, isActive: true },
    });

    if (!membership || membership.role !== CommunityRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to mark posts as announcements');
    }

    // Update announcement status
    post.isAnnouncement = isAnnouncement;
    return this.postRepository.save(post);
  }
}
