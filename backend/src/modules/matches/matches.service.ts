import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Match, MatchStatus } from './entities/match.entity';
import { User } from '../users/entities/user.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { UsersService } from '../users/users.service';
import { LoggingService } from '../logging/logging.service';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType, NotificationChannel } from '../../types/enums';

// Define an interface for user lifestyle attributes
interface Lifestyle {
  smoking?: string;
  drinking?: string;
  diet?: string;
  exercise?: string;
}

// Define an interface for the extended compatibility score
interface CompatibilityScore {
  overall: number;
  interests: number;
  preferences: number;
  location: number;
  lifestyle: number;
  values: number;
  personality: number;
  relationshipGoals: number;
}

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchRepository: Repository<Match>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly logger: LoggingService,
    private readonly notificationsService: NotificationsService,
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

        // Create match notifications for both users
        await this.createMatchNotifications(userId, targetUserId, match.id);
        this.logger.log(`Both matches updated to MATCHED status`);
      }
    }

    return match;
  }

  /**
   * Get potential matches for a user with enhanced filtering based on profile data
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
    
    // Enhanced filtering based on user preferences
    const whereClause: any = {
      id: Not(In(interactedWithIds)),
      isActive: true,
    };
    
    // Apply gender preferences if defined
    const userPreferences = user.preferences;
    if (userPreferences?.genderPreferences && userPreferences.genderPreferences.length > 0) {
      this.logger.debug(`Applying gender preferences filter: ${userPreferences.genderPreferences.join(', ')}`);
      whereClause.gender = In(userPreferences.genderPreferences);
    }
    
    // Could add more filters based on relationship type, location, etc.
    
    const potentialMatches = await this.userRepository.find({
      where: whereClause,
      take: limit * 3, // Get more matches than needed for better sorting after scoring
    });
    
    this.logger.debug(`Found ${potentialMatches.length} potential matches before scoring`);

    // Sort by compatibility with enhanced scoring
    this.logger.debug(`Calculating enhanced compatibility scores for ${potentialMatches.length} users`);
    const matchesWithScores = await Promise.all(
      potentialMatches.map(async (match) => {
        const score = await this.calculateCompatibilityScore(userId, match.id);
        return { match, score: score.overall };
      })
    );

    matchesWithScores.sort((a, b) => b.score - a.score);
    
    // Take the top matches after scoring
    const topMatches = matchesWithScores.slice(0, limit);
    
    const endTime = process.hrtime(startTime);
    const duration = Math.round((endTime[0] * 1e9 + endTime[1]) / 1e6);
    
    this.logger.log(`Returning ${topMatches.length} potential matches in ${duration}ms`);
    return topMatches.map(item => item.match);
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
   * Create match notifications for both users
   */
  private async createMatchNotifications(userId: string, targetUserId: string, matchId: string): Promise<void> {
    this.logger.debug(`Creating match notifications for users ${userId} and ${targetUserId}`);
    
    try {
      // Get user details for personalized notifications
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const targetUser = await this.userRepository.findOne({ where: { id: targetUserId } });
      
      if (!user || !targetUser) {
        this.logger.warn(`Could not find user details for match notification`);
        return;
      }
      
      // Create notification for first user
      await this.notificationsService.create({
        recipientId: userId,
        senderId: targetUserId,
        type: NotificationType.MATCH,
        title: 'New Match!',
        content: `You and ${targetUser.name || 'someone'} have matched! Start a conversation now.`,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        actionUrl: `/dashboard/matches/${matchId}`,
        data: {
          matchId,
          userId: targetUserId
        }
      });
      
      // Create notification for second user
      await this.notificationsService.create({
        recipientId: targetUserId,
        senderId: userId,
        type: NotificationType.MATCH,
        title: 'New Match!',
        content: `You and ${user.name || 'someone'} have matched! Start a conversation now.`,
        channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
        actionUrl: `/dashboard/matches/${matchId}`,
        data: {
          matchId,
          userId
        }
      });
      
      this.logger.debug(`Successfully created match notifications for both users`);
    } catch (error) {
      this.logger.error(`Failed to create match notifications: ${error.message}`, error.stack);
      // Continue execution even if notification creation fails
      // We don't want to break the match process if notifications fail
    }
  }

  /**
   * Calculate compatibility score between two users
   * Enhanced version using additional profile attributes
   */
  private async calculateCompatibilityScore(
    userId: string,
    targetUserId: string,
  ): Promise<CompatibilityScore> {
    this.logger.debug(`Calculating enhanced compatibility between users ${userId} and ${targetUserId}`);
    
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

    // Calculate preference match (age, gender, distance)
    let preferenceScore = 70; // Default score
    
    // Age preferences
    const userAge = this.calculateAge(user.birthdate);
    const targetAge = this.calculateAge(targetUser.birthdate);
    
    const userPreferences = user.preferences || {};
    const targetPreferences = targetUser.preferences || {};
    
    let ageMatch = true;
    
    if (userPreferences.ageRange) {
      if (targetAge < userPreferences.ageRange.min || targetAge > userPreferences.ageRange.max) {
        ageMatch = false;
      }
    }
    
    if (targetPreferences.ageRange) {
      if (userAge < targetPreferences.ageRange.min || userAge > targetPreferences.ageRange.max) {
        ageMatch = false;
      }
    }
    
    // Gender preferences
    let genderMatch = true;
    
    if (userPreferences.genderPreferences && userPreferences.genderPreferences.length > 0) {
      if (!userPreferences.genderPreferences.includes(targetUser.gender)) {
        genderMatch = false;
      }
    }
    
    if (targetPreferences.genderPreferences && targetPreferences.genderPreferences.length > 0) {
      if (!targetPreferences.genderPreferences.includes(user.gender)) {
        genderMatch = false;
      }
    }
    
    // Adjust preference score based on matches
    if (!ageMatch) preferenceScore -= 30;
    if (!genderMatch) preferenceScore -= 40;
    
    preferenceScore = Math.max(0, Math.min(100, preferenceScore));
    this.logger.debug(`Preference score: ${preferenceScore} (ageMatch: ${ageMatch}, genderMatch: ${genderMatch})`);

    // Calculate lifestyle compatibility
    let lifestyleScore = 70; // Default score
    
    // Extract lifestyle attributes if they exist
    const userLifestyle: Lifestyle = user.lifestyle || {};
    const targetLifestyle: Lifestyle = targetUser.lifestyle || {};
    
    // Now we have real lifestyle data to compare
    if (Object.keys(userLifestyle).length > 0 && Object.keys(targetLifestyle).length > 0) {
      // Compare lifestyle attributes
      let lifestyleMatches = 0;
      let lifestyleTotal = 0;
      
      if (userLifestyle.smoking && targetLifestyle.smoking) {
        lifestyleTotal++;
        if (userLifestyle.smoking === targetLifestyle.smoking) {
          lifestyleMatches++;
        } else if (
          (userLifestyle.smoking === 'non-smoker' && targetLifestyle.smoking === 'occasional') ||
          (userLifestyle.smoking === 'occasional' && targetLifestyle.smoking === 'non-smoker')
        ) {
          lifestyleMatches += 0.5;
        }
      }
      
      if (userLifestyle.drinking && targetLifestyle.drinking) {
        lifestyleTotal++;
        if (userLifestyle.drinking === targetLifestyle.drinking) {
          lifestyleMatches++;
        } else if (
          (userLifestyle.drinking === 'non-drinker' && targetLifestyle.drinking === 'social') ||
          (userLifestyle.drinking === 'social' && targetLifestyle.drinking === 'non-drinker')
        ) {
          lifestyleMatches += 0.5;
        }
      }
      
      if (userLifestyle.diet && targetLifestyle.diet) {
        lifestyleTotal++;
        if (userLifestyle.diet === targetLifestyle.diet) {
          lifestyleMatches++;
        } else if (
          (userLifestyle.diet === 'vegetarian' && targetLifestyle.diet === 'vegan') ||
          (userLifestyle.diet === 'vegan' && targetLifestyle.diet === 'vegetarian')
        ) {
          lifestyleMatches += 0.5;
        }
      }
      
      if (userLifestyle.exercise && targetLifestyle.exercise) {
        lifestyleTotal++;
        if (userLifestyle.exercise === targetLifestyle.exercise) {
          lifestyleMatches++;
        } else if (
          Math.abs(
            this.getExerciseLevel(userLifestyle.exercise) - 
            this.getExerciseLevel(targetLifestyle.exercise)
          ) <= 1
        ) {
          lifestyleMatches += 0.5;
        }
      }
      
      if (lifestyleTotal > 0) {
        lifestyleScore = (lifestyleMatches / lifestyleTotal) * 100;
      }
    }
    this.logger.debug(`Lifestyle score: ${lifestyleScore}`);

    // Calculate personality compatibility using actual personality traits
    let personalityScore = 50; // Default score
    
    // Compare personality traits if available
    const userPersonality = user.personality || [];
    const targetPersonality = targetUser.personality || [];
    
    if (userPersonality.length > 0 && targetPersonality.length > 0) {
      // Find common personality traits
      const commonTraits = userPersonality.filter(trait => 
        targetPersonality.includes(trait)
      );
      
      // Calculate score based on overlap
      personalityScore = (commonTraits.length / Math.max(userPersonality.length, 1)) * 100;
    }
    
    this.logger.debug(`Personality score: ${personalityScore}`);

    // Calculate values compatibility using actual values
    let valuesScore = 50; // Default score
    
    // Compare core values if available
    const userValues = user.values || [];
    const targetValues = targetUser.values || [];
    
    if (userValues.length > 0 && targetValues.length > 0) {
      // Find common values
      const commonValues = userValues.filter(value => 
        targetValues.includes(value)
      );
      
      // Calculate score based on overlap
      valuesScore = (commonValues.length / Math.max(userValues.length, 1)) * 100;
    }
    
    this.logger.debug(`Values score: ${valuesScore}`);

    // Calculate relationship goals compatibility
    let relationshipGoalsScore = 50; // Default score
    
    // Compare relationship types if available
    const userRelationshipType = user.relationshipType || '';
    const targetRelationshipType = targetUser.relationshipType || '';
    
    if (userRelationshipType && targetRelationshipType) {
      // Direct match gets highest score
      if (userRelationshipType === targetRelationshipType) {
        relationshipGoalsScore = 100;
      } else {
        // Compatible combinations get medium scores
        const compatiblePairs = [
          ['long-term', 'marriage'],
          ['casual', 'friendship']
        ];
        
        const arePairsCompatible = compatiblePairs.some(pair => 
          (pair.includes(userRelationshipType) && pair.includes(targetRelationshipType))
        );
        
        relationshipGoalsScore = arePairsCompatible ? 70 : 30;
      }
    }
    
    this.logger.debug(`Relationship goals score: ${relationshipGoalsScore}`);

    // Calculate overall score with weighted components
    const weights = {
      interests: 0.15,
      preferences: 0.25,
      location: 0.1,
      lifestyle: 0.15,
      personality: 0.15,
      values: 0.1,
      relationshipGoals: 0.1
    };
    
    const overall = Math.round(
      interestScore * weights.interests +
      preferenceScore * weights.preferences +
      locationScore * weights.location +
      lifestyleScore * weights.lifestyle +
      personalityScore * weights.personality +
      valuesScore * weights.values +
      relationshipGoalsScore * weights.relationshipGoals
    );
    
    const result: CompatibilityScore = {
      overall,
      interests: Math.round(interestScore),
      preferences: Math.round(preferenceScore),
      location: Math.round(locationScore),
      lifestyle: Math.round(lifestyleScore),
      personality: Math.round(personalityScore),
      values: Math.round(valuesScore),
      relationshipGoals: Math.round(relationshipGoalsScore)
    };
    
    this.logger.debug(`Final enhanced compatibility score: ${overall}%`, undefined, result);
    return result;
  }
  
  /**
   * Helper method to calculate age from birthdate
   */
  private calculateAge(birthdate: Date | string): number {
    if (!birthdate) return 0;
    
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
  
  /**
   * Helper method to convert exercise string to numeric level
   */
  private getExerciseLevel(exercise: string): number {
    const levels: Record<string, number> = {
      'rarely': 0,
      'sometimes': 1,
      'regularly': 2,
      'daily': 3
    };
    
    return levels[exercise] || 0;
  }
}
