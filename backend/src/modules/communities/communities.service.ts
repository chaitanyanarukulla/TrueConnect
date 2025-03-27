import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { Community } from './entities/community.entity';
import { CommunityMember } from './entities/community-member.entity';
import { CommunityRole } from './entities/community-member.entity';
import { UsersService } from '../users/users.service';
import { CreateCommunityDto, CommunityCategory } from './dto/create-community.dto';

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
    try {
      // Check if user exists
      const user = await this.usersService.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Create community with safe defaults for any missing properties
      const communityData = {
        ...createCommunityDto,
        creatorId: userId,
        tags: createCommunityDto.tags || [],
        settings: createCommunityDto.settings || {},
      };

      // Create community entity
      const community = this.communityRepository.create(communityData);

      // Save community with error handling
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
    } catch (error) {
      // Log the detailed error
      console.error('Error creating community:', error);
      
      // Handle specific types of errors
      if (error instanceof NotFoundException) {
        throw error; // Re-throw the Not Found exception
      }
      
      // Convert database/validation errors to more meaningful messages
      if (error.code === '23505') { // Postgres unique violation
        throw new BadRequestException('A community with this name already exists');
      }
      
      if (error.name === 'ValidationError') {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }
      
      // If it's another type of error, throw a more descriptive error
      throw new BadRequestException(`Failed to create community: ${error.message}`);
    }
  }

  async findAll(options?: { page?: number; limit?: number; filter?: string; category?: CommunityCategory }): Promise<{ data: Community[]; meta: any }> {
    const { page = 1, limit = 10, filter, category } = options || {};
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Community> = {
      isActive: true,
    };

    if (filter) {
      where.name = filter;
    }

    if (category) {
      where.category = category;
    }

    const [communities, total] = await this.communityRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['creator'],
    });

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

    // Check if community exists
    const community = await this.communityRepository.findOne({
      where: { id: communityId, isActive: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const [members, total] = await this.communityMemberRepository.findAndCount({
      where: { communityId, isActive: true },
      relations: ['user'],
      order: { role: 'ASC', joinedAt: 'ASC' },
      skip,
      take: limit,
    });

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

    // Check if user exists
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Find all active memberships
    const memberships = await this.communityMemberRepository.find({
      where: { userId, isActive: true },
      select: ['communityId'],
    });

    const communityIds = memberships.map(m => m.communityId);

    if (communityIds.length === 0) {
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

    const [communities, total] = await this.communityRepository.findAndCount({
      where: { id: In(communityIds), isActive: true },
      relations: ['creator'],
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

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
