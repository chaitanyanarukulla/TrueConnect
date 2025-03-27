import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { User } from '../users/entities/user.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UsersService } from '../users/users.service';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly logger: LoggingService,
  ) {
    this.logger.setContext('MatchesService');
  }

  /**
   * Find a match by ID
   */
  async findById(id: string): Promise<Match> {
    this.logger.debug(`Finding match by ID: ${id}`);
    
    const match = await this.matchRepository.findOne({ where: { id } });
    if (!match) {
      this.logger.warn(`Match with ID ${id} not found`);
      throw new NotFoundException(`Match with ID ${id} not found`);
    }
    
    this.logger.debug(`Found match with ID: ${id}`);
    return match;
  }

  /**
   * Create a new match entry (like or pass)
   */
  async createMatch(userId: string, createMatchDto: CreateMatchDto): Promise<Match> {
    const { targetUserId, action, isSuperLike } = createMatchDto;
    
    this.logger.log(`Creating match: User ${userId} ${action} User ${targetUserId}`, undefined, {
      action,
      isSuperLike: !!isSuperLike,
      userId,
      targetUserId
    });

    // Check if users exist
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });

    if (!user || !targetUser) {
      this.logger.warn(`User not found in createMatch. User: ${!!user}, TargetUser: ${!!targetUser}`);
      throw new NotFoundException('User not found');
    }

    // Check if there's already an interaction in this direction
    const existingMatch = await this.matchRepository.findOne({
      where: { userId, targetUserId },
    });

    if (existingMatch) {
      this.logger.warn(`Match action already exists between ${userId} and ${targetUserId}`);
      throw new BadRequestException('Match action already exists');
    }

    // Calculate compatibility score
    this.logger.debug(`Calculating compatibility score between ${userId} and ${targetUserId}`);
    const compatibilityScore = await this.calculateCompatibilityScore(userId, targetUserId);
    this.logger.debug(`Compatibility score: ${compatibilityScore.overall}%`, undefined, compatibilityScore);

    // Create new match with PENDING or REJECTED status based on action
    const status = action === 'like' ? MatchStatus.PENDING : MatchStatus.REJECTED;

    const match = this.matchRepository.create({
      userId,
      targetUserId,
      status,
      isSuperLike: action === 'like' ? !!isSuperLike : false,
      compatibilityScore,
    });

    await this.matchRepository.save(match);
    this.logger.debug(`Match created with ID: ${match.id}`);

    // Check if there's a match in the other direction
    if (action === 'like') {
      this.logger.debug(`Checking for reverse match from ${targetUserId} to ${userId}`);
      const reverseMatch = await this.matchRepository.findOne({
        where: { userId: targetUserId, targetUserId: userId, status: MatchStatus.PENDING },
      });

      // If there's a pending match in the other direction, update both to MATCHED
      if (reverseMatch) {
        this.logger.log(`Mutual match found between ${userId} and ${targetUserId}!`);
        reverseMatch.status = MatchStatus.MATCHED;
        match.status = MatchStatus.MATCHED;

        await this.matchRepository.save(reverseMatch);
        await this.matchRepository.save(match);

        // Here we would also trigger some notification logic
        // this.notificationsService.createMatchNotification(userId, targetUserId);
        this.logger.log(`Both matches updated to MATCHED status`);
      }
    }

    return match;
  }

  /**
   * Get potential matches for a user
   */
  async getPotentialMatches(userId: string, limit: number = 10): Promise<User[]> {
    this.logger.log(`Finding potential matches for user ${userId} with limit ${limit}`);
    const startTime = process.hrtime();
    
    // Find user to get their preferences
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      this.logger.warn(`User ${userId} not found when getting potential matches`);
      throw new NotFoundException('User not found');
    }

    // Get IDs of users that have already been interacted with
    this.logger.debug(`Getting users already interacted with by ${userId}`);
    const interactedWith = await this.matchRepository.find({
      where: { userId },
      select: ['targetUserId'],
    });

    const interactedWithIds = interactedWith.map(match => match.targetUserId);
    // Add the user's own ID to exclude
    interactedWithIds.push(userId);
    
    this.logger.debug(`Found ${interactedWithIds.length - 1} previous interactions`);

    // Build query for potential matches based on preferences
    this.logger.debug(`Finding potential matches excluding ${interactedWithIds.length} users`);
    const potentialMatches = await this.userRepository.find({
      where: {
        id: Not(In(interactedWithIds)),
        isActive: true,
        // Add additional filters based on user preferences
      },
      take: limit,
    });
    
    this.logger.debug(`Found ${potentialMatches.length} potential matches before scoring`);

    // Sort by compatibility
    this.logger.debug(`Calculating compatibility scores for ${potentialMatches.length} users`);
    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (match) => {
        const score = await this.calculateCompatibilityScore(userId, match.id);
        return { match, score: score.overall };
      })
    );

    matchesWithScores.sort((a, b) => b.score - a.score);
    
    const endTime = process.hrtime(startTime);
    const duration = Math.round((endTime[0] * 1e9 + endTime[1]) / 1e6);
    
    this.logger.log(`Returning ${matchesWithScores.length} potential matches in ${duration}ms`);
    return matchesWithScores.map(item => item.match);
  }

  /**
   * Get matches for a user (mutual matches)
   */
  async getUserMatches(userId: string): Promise<any[]> {
    this.logger.log(`Getting matches for user ${userId}`);
    
    // Find all matches where the user has participated and the status is MATCHED
    const matches = await this.matchRepository.find({
      where: [
        { userId, status: MatchStatus.MATCHED },
        { targetUserId: userId, status: MatchStatus.MATCHED },
      ],
      relations: ['user', 'targetUser'],
    });
    
    this.logger.debug(`Found ${matches.length} matches for user ${userId}`);

    // Format the response to include the other user's details
    const formattedMatches = matches.map(match => {
      const otherUser = match.userId === userId ? match.targetUser : match.user;
      
      return {
        matchId: match.id,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
        user: this.usersService.sanitizeUser(otherUser),
        compatibilityScore: match.compatibilityScore,
        isSuperLike: match.isSuperLike,
        isRead: match.isRead,
      };
    });
    
    this.logger.debug(`Returning ${formattedMatches.length} formatted matches`);
    return formattedMatches;
  }

  /**
   * Calculate compatibility score between two users
   * This is a simplified version - a real implementation would be more sophisticated
   */
  private async calculateCompatibilityScore(
    userId: string,
    targetUserId: string,
  ): Promise<{ overall: number; interests: number; preferences: number; location: number }> {
    this.logger.debug(`Calculating compatibility between users ${userId} and ${targetUserId}`);
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });

    if (!user || !targetUser) {
      this.logger.warn(`User not found in compatibility calculation`);
      throw new NotFoundException('User not found');
    }

    // Calculate interest overlap
    const userInterests = user.interests || [];
    const targetInterests = targetUser.interests || [];
    const commonInterests = userInterests.filter(interest => 
      targetInterests.includes(interest)
    );
    
    this.logger.debug(`Interest overlap: ${commonInterests.length} common interests out of ${userInterests.length}`);
    
    const interestScore = userInterests.length ? 
      (commonInterests.length / Math.max(1, userInterests.length)) * 100 : 0;

    // Calculate location proximity
    // This is simplified - a real implementation would use geolocation
    const locationScore = user.location === targetUser.location ? 100 : 50;
    this.logger.debug(`Location score: ${locationScore} (same location: ${user.location === targetUser.location})`);

    // Calculate preference match
    // This is simplified - a real implementation would consider age, gender preferences, etc.
    const preferenceScore = 70; // Default score
    this.logger.debug(`Preference score: ${preferenceScore} (default)`);

    // Calculate overall score
    const overall = Math.round((interestScore + locationScore + preferenceScore) / 3);
    
    const result = {
      overall,
      interests: Math.round(interestScore),
      preferences: preferenceScore,
      location: locationScore,
    };
    
    this.logger.debug(`Final compatibility score: ${overall}%`);
    return result;
  }
}
