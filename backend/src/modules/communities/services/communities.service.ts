import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Community } from '../entities/community.entity';
import { CommunityMember } from '../entities/community-member.entity';
import { CommunityRole } from '../entities/community-member.entity';
import { UsersService } from '../../users/users.service';
import { CreateCommunityDto, CommunityCategory } from '../dto/create-community.dto';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(Community)
    private communityRepository: Repository<Community>,
    
    @InjectRepository(CommunityMember)
    private communityMemberRepository: Repository<CommunityMember>,
    
    private usersService: UsersService,
  ) {}

  async create(userId: string, createCommunityDto: CreateCommunityDto): Promise<Community> {
    // Check if user exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create community
    const community = this.communityRepository.create({
      ...createCommunityDto,
      creatorId: userId,
    });

    const savedCommunity = await this.communityRepository.save(community);

    // Add creator as admin member
    await this.communityMemberRepository.save({
      userId,
      communityId: savedCommunity.id,
      role: CommunityRole.ADMIN,
      isActive: true,
      notifications: true,
    });

    // Update member count
    savedCommunity.memberCount = 1;
    await this.communityRepository.save(savedCommunity);

    return savedCommunity;
  }

  async findAll(options?: { page?: number; limit?: number; filter?: string; category?: CommunityCategory }): Promise<{ data: Community[]; meta: any }> {
    const { page = 1, limit = 10, filter, category } = options || {};
    const skip = (page - 1) * limit;

    // Create query builder for more complex querying
    const queryBuilder = this.communityRepository.createQueryBuilder('community')
      .where('community.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('community.creator', 'creator'); // Eager load creator with a join

    // Optimize text search with LIKE for partial matches
    if (filter) {
      queryBuilder.andWhere('LOWER(community.name) LIKE LOWER(:filter)', { filter: `%${filter}%` });
    }

    if (category) {
      queryBuilder.andWhere('community.category = :category', { category });
    }

    // Add indexable order by
    queryBuilder.orderBy('community.createdAt', 'DESC');

    // Execute count query separately with optimized count
    const total = await queryBuilder.getCount();

    // Execute data query with pagination
    const communities = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data: communities,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: { id, isActive: true },
      relations: ['creator'],
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return community;
  }

  async update(id: string, userId: string, updateData: Partial<Community>): Promise<Community> {
    const community = await this.communityRepository.findOne({
      where: { id, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is admin
    const membership = await this.communityMemberRepository.findOne({
      where: { userId, communityId: id },
    });

    if (!membership || membership.role !== CommunityRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update this community');
    }

    // Update community
    const updatedCommunity = { ...community, ...updateData };
    return this.communityRepository.save(updatedCommunity);
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    const community = await this.communityRepository.findOne({
      where: { id, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is the creator
    if (community.creatorId !== userId) {
      throw new ForbiddenException('Only the creator can delete this community');
    }

    // Soft delete by setting isActive to false
    community.isActive = false;
    await this.communityRepository.save(community);

    return { success: true };
  }

  async join(communityId: string, userId: string): Promise<CommunityMember> {
    // Check if community exists
    const community = await this.communityRepository.findOne({
      where: { id: communityId, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is already a member
    const existingMembership = await this.communityMemberRepository.findOne({
      where: { userId, communityId },
    });

    if (existingMembership) {
      if (existingMembership.isActive) {
        throw new BadRequestException('You are already a member of this community');
      } else {
        // Reactivate membership
        existingMembership.isActive = true;
        return this.communityMemberRepository.save(existingMembership);
      }
    }

    // Create new membership
    const membership = this.communityMemberRepository.create({
      userId,
      communityId,
      role: CommunityRole.MEMBER,
      isActive: true,
      notifications: true,
    });

    const savedMembership = await this.communityMemberRepository.save(membership);

    // Update member count
    community.memberCount += 1;
    await this.communityRepository.save(community);

    return savedMembership;
  }

  async leave(communityId: string, userId: string): Promise<{ success: boolean }> {
    // Check if community exists
    const community = await this.communityRepository.findOne({
      where: { id: communityId, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is a member
    const membership = await this.communityMemberRepository.findOne({
      where: { userId, communityId, isActive: true },
    });

    if (!membership) {
      throw new BadRequestException('You are not a member of this community');
    }

    // Check if user is the creator
    if (community.creatorId === userId) {
      throw new BadRequestException('The creator cannot leave the community');
    }

    // Soft delete membership
    membership.isActive = false;
    await this.communityMemberRepository.save(membership);

    // Update member count
    community.memberCount -= 1;
    await this.communityRepository.save(community);

    return { success: true };
  }

  async getMembers(communityId: string, options?: { page?: number; limit?: number }): Promise<{ data: CommunityMember[]; meta: any }> {
    const { page = 1, limit = 20 } = options || {};
    const skip = (page - 1) * limit;

    // Check if community exists - using cached result if available
    const communityExists = await this.communityRepository.count({
      where: { id: communityId, isActive: true }
    });

    if (communityExists === 0) {
      throw new NotFoundException('Community not found');
    }

    // Use query builder for optimized loading
    const queryBuilder = this.communityMemberRepository.createQueryBuilder('member')
      .where('member.communityId = :communityId', { communityId })
      .andWhere('member.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('member.user', 'user')
      .orderBy('member.role', 'ASC')
      .addOrderBy('member.joinedAt', 'ASC');

    // Get total count with an optimized query
    const total = await queryBuilder.getCount();

    // Execute paginated query
    const members = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async updateMemberRole(communityId: string, memberId: string, userId: string, role: CommunityRole): Promise<CommunityMember> {
    // Check if community exists
    const community = await this.communityRepository.findOne({
      where: { id: communityId, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is admin
    const adminMembership = await this.communityMemberRepository.findOne({
      where: { userId, communityId, isActive: true },
    });

    if (!adminMembership || adminMembership.role !== CommunityRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to update member roles');
    }

    // Find the member to update
    const memberToUpdate = await this.communityMemberRepository.findOne({
      where: { id: memberId, communityId, isActive: true },
      relations: ['user'],
    });

    if (!memberToUpdate) {
      throw new NotFoundException('Member not found');
    }

    // Cannot change role of the creator
    if (memberToUpdate.userId === community.creatorId) {
      throw new BadRequestException('Cannot change the role of the community creator');
    }

    // Update the role
    memberToUpdate.role = role;
    return this.communityMemberRepository.save(memberToUpdate);
  }

  async getUserCommunities(userId: string, options?: { page?: number; limit?: number }): Promise<{ data: Community[]; meta: any }> {
    const { page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;

    // Check if user exists with optimized query
    const userExists = await this.usersService.countById(userId);
    if (!userExists) {
      throw new NotFoundException('User not found');
    }

    // Use a single efficient query with JOIN instead of two separate queries
    const queryBuilder = this.communityRepository.createQueryBuilder('community')
      .innerJoin('community.members', 'member', 'member.userId = :userId AND member.isActive = true', { userId })
      .leftJoinAndSelect('community.creator', 'creator')
      .where('community.isActive = :isActive', { isActive: true })
      .orderBy('community.updatedAt', 'DESC');

    // Get total for pagination with optimized count
    const total = await queryBuilder.getCount();

    // Early exit if no results
    if (total === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          pages: 0,
        },
      };
    }

    // Execute paginated query
    const communities = await queryBuilder
      .skip(skip)
      .take(limit)
      .getMany();

    return {
      data: communities,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
