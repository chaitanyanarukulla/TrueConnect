import { Controller, Get, UseGuards, Query, Req, ParseBoolPipe, DefaultValuePipe, ParseIntPipe, ParseEnumPipe, BadRequestException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EventsService } from '../services/events.service';
import { EventStatus, EventType } from '../entities/event.entity';
import { Request } from '../../../types/express';
import { CommunityCategory } from '../../../types/enums';
import { EventDiscoveryOptionsDto, LocationQueryParams } from '../dto/event-discovery-options.dto';
import { LoggingService } from '../../logging/logging.service';

/**
 * Controller for event discovery features
 */
@Controller('events/discover')
@UseGuards(JwtAuthGuard)
export class EventDiscoveryController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly logger: LoggingService
  ) {}

  /**
   * Get events with various filtering, sorting, and search options
   */
  @Get()
  async discoverEvents(
    @Req() req: Request,
    @Query('status') status?: EventStatus,
    @Query('type') type?: EventType,
    @Query('category') category?: CommunityCategory,
    @Query('tags') tags?: string,
    @Query('upcoming', new DefaultValuePipe('true')) upcoming?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('search') search?: string,
    @Query('sort', new DefaultValuePipe('date')) sort?: string,
    @Query('lat') latitude?: string,
    @Query('lng') longitude?: string,
    @Query('distance') distance?: string,
    @Query('isAttending', new DefaultValuePipe('false')) isAttending?: string,
    @Query('myCommunitiesOnly', new DefaultValuePipe('false')) myCommunitiesOnly?: string,
    @Query('relevance', new DefaultValuePipe('true')) relevance?: string,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    // Parse boolean parameters
    const isUpcoming = upcoming === 'true' || upcoming === '1';
    const isAttendingEvents = isAttending === 'true' || isAttending === '1';
    const showMyCommunities = myCommunitiesOnly === 'true' || myCommunitiesOnly === '1';
    const useRelevanceBoost = relevance === 'true' || relevance === '1';
    
    // Parse tags if provided
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    
    // Parse dates if provided
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    
    // Parse location data if provided
    let locationData;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const dist = distance ? parseFloat(distance) : 10; // Default 10km radius
      
      if (isNaN(lat) || isNaN(lng) || isNaN(dist)) {
        throw new BadRequestException('Invalid location parameters');
      }
      
      locationData = { lat, lng, distance: dist };
    }
    
    // Validate sort parameter
    const validSortOptions = ['date', 'popularity', 'distance', 'relevance'];
    if (sort && !validSortOptions.includes(sort)) {
      throw new BadRequestException('Invalid sort parameter. Valid options: date, popularity, distance, relevance');
    }
    
    // Prepare complete options for event discovery
    const discoveryOptions: EventDiscoveryOptionsDto = {
      // Basic filters
      status,
      type,
      category,
      tags: tagArray,
      upcoming: isUpcoming,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      
      // Pagination
      limit,
      page,
      
      // Search and sorting
      search,
      sort,
      
      // Location based
      location: locationData,
      
      // User-specific filters
      isAttending: isAttendingEvents,
      myCommunitiesOnly: showMyCommunities,
      useRelevanceRanking: useRelevanceBoost
    };
    
    this.logger.log(`Discovering events with options: ${JSON.stringify(discoveryOptions, null, 2)}`);
    
    // Call the service with all options
    const result = await this.eventsService.discoverEvents(userId, discoveryOptions);
    
    // Add additional metadata to the response if needed
    return {
      ...result,
      meta: {
        ...result.meta,
        filters: {
          upcoming: isUpcoming,
          locationBased: !!locationData,
          userFiltered: isAttendingEvents || showMyCommunities
        }
      }
    };
  }
}
