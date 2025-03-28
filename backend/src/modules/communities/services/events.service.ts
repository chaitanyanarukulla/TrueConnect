import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, Equal, MoreThanOrEqual, Between, Like, LessThanOrEqual } from 'typeorm';
import { Event, EventStatus, EventType } from '../entities/event.entity';
import { EventAttendee, AttendeeStatus } from '../entities/event-attendee.entity';
import { Community } from '../entities/community.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventDiscoveryOptionsDto } from '../dto/event-discovery-options.dto';
import { CommunityMember, CommunityRole } from '../entities/community-member.entity';
import { LoggingService } from '../../logging/logging.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { UsersService } from '../../users/users.service';
import { NotificationType, NotificationChannel } from '../../../types/enums';

@Injectable()
export class EventsService {
  constructor(
    private readonly logger: LoggingService,
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(EventAttendee)
    private eventAttendeesRepository: Repository<EventAttendee>,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
    @InjectRepository(CommunityMember)
    private communityMembersRepository: Repository<CommunityMember>,
  ) {}

  async create(userId: string, createEventDto: CreateEventDto): Promise<Event> {
    // Check if the community exists
    const community = await this.communitiesRepository.findOne({
      where: { id: createEventDto.communityId },
    });
    if (!community) {
      throw new NotFoundException(`Community with ID ${createEventDto.communityId} not found`);
    }

    // Check if the user is a member of the community
    const membership = await this.communityMembersRepository.findOne({
      where: { userId, communityId: createEventDto.communityId },
    });
    if (!membership) {
      throw new ForbiddenException('You must be a member of the community to create an event');
    }

    // Create the event
    const event = this.eventsRepository.create({
      ...createEventDto,
      creatorId: userId,
      attendeeCount: 0,
      status: createEventDto.status || EventStatus.DRAFT,
    });

    // Save the event
    const savedEvent = await this.eventsRepository.save(event);

    // Automatically add the creator as an attendee
    await this.eventAttendeesRepository.save({
      eventId: savedEvent.id,
      userId,
      status: AttendeeStatus.GOING,
      isOrganizer: true,
    });

    // Increment the attendee count
    await this.eventsRepository.update(
      { id: savedEvent.id },
      { attendeeCount: () => 'attendee_count + 1' }
    );

    // Send notifications if the event was created with PUBLISHED status
    if (savedEvent.status === EventStatus.PUBLISHED) {
      // Get the community details
      const communityDetails = await this.communitiesRepository.findOne({
        where: { id: savedEvent.communityId }
      });
      
      if (communityDetails) {
        // Get the updated event with creator relationship
        const eventWithRelations = await this.findOne(savedEvent.id);
        // Send notifications to community members
        await this.notifyCommunityMembers(eventWithRelations, userId, communityDetails);
      }
    }

    // Return the created event with updated attendee count
    return this.findOne(savedEvent.id);
  }

  async findAll(communityId: string, options?: { status?: EventStatus, upcoming?: boolean }): Promise<Event[]> {
    const query = this.eventsRepository.createQueryBuilder('event')
      .where('event.communityId = :communityId', { communityId })
      .leftJoinAndSelect('event.creator', 'creator')
      .select([
        'event',
        'creator.id',
        'creator.name',
        'creator.profilePicture',
      ]);

    // Filter by status if provided
    if (options?.status) {
      query.andWhere('event.status = :status', { status: options.status });
    }

    // Filter for upcoming events if requested
    if (options?.upcoming) {
      query.andWhere('event.startTime > :now', { now: new Date() });
    }

    // Order by start time
    query.orderBy('event.startTime', 'ASC');

    return query.getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: string, userId: string, updateEventDto: Partial<CreateEventDto>): Promise<Event> {
    const event = await this.findOne(id);
    this.logger.debug(`Updating event with ID ${id} by user ${userId}`);

    // Check if the user is the creator or has admin/moderator privileges
    if (event.creatorId !== userId) {
      const membership = await this.communityMembersRepository.findOne({
        where: { 
          userId, 
          communityId: event.communityId,
          role: In([CommunityRole.ADMIN, CommunityRole.MODERATOR])
        },
      });
      
      if (!membership) {
        throw new ForbiddenException('You do not have permission to update this event');
      }
    }

    // Track if this is a status change to PUBLISHED
    const isPublishing = event.status !== EventStatus.PUBLISHED && 
                        updateEventDto.status === EventStatus.PUBLISHED;
    
    // Track if this is a significant update to a published event
    const isSignificantUpdate = event.status === EventStatus.PUBLISHED && (
      updateEventDto.startTime !== undefined ||
      updateEventDto.endTime !== undefined ||
      updateEventDto.location !== undefined ||
      updateEventDto.title !== undefined
    );

    // Update the event
    await this.eventsRepository.update(id, updateEventDto);
    
    // Get the updated event with relationships
    const updatedEvent = await this.findOne(id);
    
    // Send notifications if needed
    if (isPublishing) {
      // If event status changed to PUBLISHED, notify community members
      const community = await this.communitiesRepository.findOne({
        where: { id: updatedEvent.communityId }
      });
      
      if (community) {
        await this.notifyCommunityMembers(updatedEvent, userId, community);
      }
    } else if (isSignificantUpdate) {
      // If important details changed for a published event, notify attendees
      await this.notifyEventUpdated(updatedEvent, userId);
    }
    
    return updatedEvent;
  }

  async remove(id: string, userId: string): Promise<{ success: boolean }> {
    const event = await this.findOne(id);

    // Check if the user is the creator or has admin privileges
    if (event.creatorId !== userId) {
      const membership = await this.communityMembersRepository.findOne({
        where: { 
          userId, 
          communityId: event.communityId,
          role: CommunityRole.ADMIN
        },
      });
      
      if (!membership) {
        throw new ForbiddenException('You do not have permission to delete this event');
      }
    }

    await this.eventsRepository.remove(event);
    return { success: true };
  }

  async getAttendees(eventId: string): Promise<EventAttendee[]> {
    const event = await this.findOne(eventId);

    return this.eventAttendeesRepository.find({
      where: { eventId },
      relations: ['user'],
    });
  }

  async rsvp(eventId: string, userId: string, rsvpStatus: 'going' | 'maybe' | 'not_going'): Promise<EventAttendee> {
    const event = await this.findOne(eventId);

    // Check if the user is a member of the community
    const membership = await this.communityMembersRepository.findOne({
      where: { userId, communityId: event.communityId },
    });
    if (!membership) {
      throw new ForbiddenException('You must be a member of the community to RSVP to this event');
    }

    // Convert rsvpStatus to AttendeeStatus
    let attendeeStatus: AttendeeStatus;
    
    switch(rsvpStatus) {
      case 'going':
        attendeeStatus = AttendeeStatus.GOING;
        break;
      case 'maybe':
        attendeeStatus = AttendeeStatus.INTERESTED;
        break;
      case 'not_going':
        attendeeStatus = AttendeeStatus.NOT_GOING;
        break;
      default:
        attendeeStatus = AttendeeStatus.INTERESTED;
    }
    
    // Check if the user has already RSVP'd
    let attendee = await this.eventAttendeesRepository.findOne({
      where: { eventId, userId },
    });

    const oldStatus = attendee?.status;

    if (attendee) {
      // Update existing RSVP
      attendee.status = attendeeStatus;
      attendee = await this.eventAttendeesRepository.save(attendee);
    } else {
      // Create new RSVP
      attendee = await this.eventAttendeesRepository.save({
        eventId,
        userId,
        status: attendeeStatus,
        isOrganizer: false,
      });
    }

    // Update attendee count if status changed from/to 'going'
    if (oldStatus !== attendeeStatus) {
      if (oldStatus === AttendeeStatus.GOING && attendeeStatus !== AttendeeStatus.GOING) {
        // Decrement count if user was going but now isn't
        await this.eventsRepository.update(
          { id: eventId },
          { attendeeCount: () => 'attendee_count - 1' }
        );
      } else if (oldStatus !== AttendeeStatus.GOING && attendeeStatus === AttendeeStatus.GOING) {
        // Increment count if user wasn't going but now is
        await this.eventsRepository.update(
          { id: eventId },
          { attendeeCount: () => 'attendee_count + 1' }
        );
      }
    }

    return attendee;
  }

  async cancelRsvp(eventId: string, userId: string): Promise<{ success: boolean }> {
    const attendee = await this.eventAttendeesRepository.findOne({
      where: { eventId, userId },
    });

    if (!attendee) {
      throw new NotFoundException('RSVP not found');
    }

    // If the user was going, decrement the attendee count
    if (attendee.status === AttendeeStatus.GOING) {
      await this.eventsRepository.update(
        { id: eventId },
        { attendeeCount: () => 'attendee_count - 1' }
      );
    }

    await this.eventAttendeesRepository.remove(attendee);
    return { success: true };
  }

  async getUserRsvp(eventId: string, userId: string): Promise<EventAttendee | null> {
    return this.eventAttendeesRepository.findOne({
      where: { eventId, userId },
    });
  }

  async publishEvent(id: string, userId: string): Promise<Event> {
    const event = await this.findOne(id);
    this.logger.debug(`Publishing event with ID ${id} by user ${userId}`);

    // Check if the user is the creator or has admin/moderator privileges
    if (event.creatorId !== userId) {
      const membership = await this.communityMembersRepository.findOne({
        where: { 
          userId, 
          communityId: event.communityId,
          role: In([CommunityRole.ADMIN, CommunityRole.MODERATOR])
        },
      });
      
      if (!membership) {
        throw new ForbiddenException('You do not have permission to publish this event');
      }
    }

    await this.eventsRepository.update(id, { status: EventStatus.PUBLISHED });
    
    // Get the updated event with relationships
    const updatedEvent = await this.findOne(id);
    
    // Get the community details
    const community = await this.communitiesRepository.findOne({
      where: { id: updatedEvent.communityId }
    });
    
    if (community) {
      // Send notifications to community members
      await this.notifyCommunityMembers(updatedEvent, userId, community);
    }
    
    return updatedEvent;
  }

  async cancelEvent(id: string, userId: string): Promise<Event> {
    const event = await this.findOne(id);
    this.logger.debug(`Cancelling event with ID ${id} by user ${userId}`);

    // Check if the user is the creator or has admin/moderator privileges
    if (event.creatorId !== userId) {
      const membership = await this.communityMembersRepository.findOne({
        where: { 
          userId, 
          communityId: event.communityId,
          role: In([CommunityRole.ADMIN, CommunityRole.MODERATOR])
        },
      });
      
      if (!membership) {
        throw new ForbiddenException('You do not have permission to cancel this event');
      }
    }

    await this.eventsRepository.update(id, { status: EventStatus.CANCELLED });
    
    // Get updated event
    const updatedEvent = await this.findOne(id);
    
    // Notify attendees about cancellation
    await this.notifyEventCancellation(updatedEvent, userId);
    
    return updatedEvent;
  }

  /**
   * Discover events based on user preferences and filters
   */
  /**
   * Notify community members about a new event
   */
  /**
   * Notify attendees about event cancellation
   */
  private async notifyEventCancellation(event: Event, cancelledByUserId: string): Promise<void> {
    this.logger.debug(`Sending cancellation notifications for event ${event.id}`);
    
    try {
      // Get all attendees who had RSVP'd as going or interested
      const attendees = await this.eventAttendeesRepository.find({
        where: { 
          eventId: event.id,
          status: In([AttendeeStatus.GOING, AttendeeStatus.INTERESTED])
        },
      });
      
      if (!attendees || attendees.length === 0) {
        this.logger.debug(`No attendees to notify for cancelled event ${event.id}`);
        return;
      }
      
      // Get the user who cancelled the event
      const canceller = await this.usersService.findById(cancelledByUserId);
      const cancellerName = canceller?.name || 'An organizer';
      
      // Create notification for each attendee
      for (const attendee of attendees) {
        // Skip notifying the user who cancelled the event
        if (attendee.userId === cancelledByUserId) continue;
        
        await this.notificationsService.create({
          recipientId: attendee.userId,
          senderId: cancelledByUserId,
          type: NotificationType.EVENT_CANCELLED,
          title: 'Event Cancelled',
          content: `${cancellerName} has cancelled the event "${event.title}"`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
          actionUrl: `/dashboard/communities/${event.communityId}/events`,
          data: {
            eventId: event.id,
            communityId: event.communityId,
            eventTitle: event.title
          }
        });
      }
      
      this.logger.debug(`Successfully sent ${attendees.length} cancellation notifications`);
    } catch (error) {
      this.logger.error(`Failed to send cancellation notifications: ${error.message}`, error.stack);
      // Continue execution even if notification sending fails
    }
  }

  /**
   * Notify attendees about event updates
   */
  private async notifyEventUpdated(event: Event, updatedByUserId: string): Promise<void> {
    this.logger.debug(`Sending update notifications for event ${event.id}`);
    
    try {
      // Get all attendees who had RSVP'd as going or interested
      const attendees = await this.eventAttendeesRepository.find({
        where: { 
          eventId: event.id,
          status: In([AttendeeStatus.GOING, AttendeeStatus.INTERESTED])
        },
      });
      
      if (!attendees || attendees.length === 0) {
        this.logger.debug(`No attendees to notify for updated event ${event.id}`);
        return;
      }
      
      // Get the user who updated the event
      const updater = await this.usersService.findById(updatedByUserId);
      const updaterName = updater?.name || 'An organizer';
      
      // Format event date for notification
      let dateStr = '';
      if (event.startTime) {
        const date = new Date(event.startTime);
        dateStr = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Create notification for each attendee
      for (const attendee of attendees) {
        // Skip notifying the user who updated the event
        if (attendee.userId === updatedByUserId) continue;
        
        await this.notificationsService.create({
          recipientId: attendee.userId,
          senderId: updatedByUserId,
          type: NotificationType.EVENT_UPDATE,
          title: 'Event Updated',
          content: `${updaterName} has updated the event "${event.title}" ${dateStr ? `on ${dateStr}` : ''}`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
          actionUrl: `/dashboard/communities/${event.communityId}/events/${event.id}`,
          data: {
            eventId: event.id,
            communityId: event.communityId,
            eventTitle: event.title,
            startTime: event.startTime
          }
        });
      }
      
      this.logger.debug(`Successfully sent ${attendees.length} update notifications`);
    } catch (error) {
      this.logger.error(`Failed to send event update notifications: ${error.message}`, error.stack);
      // Continue execution even if notification sending fails
    }
  }

  private async notifyCommunityMembers(event: Event, creatorId: string, community: Community): Promise<void> {
    this.logger.debug(`Sending event notifications to community members for event ${event.id}`);
    
    try {
      // Get all community members except the creator
      const members = await this.communityMembersRepository.find({
        where: { 
          communityId: community.id,
          userId: Not(Equal(creatorId))
        },
      });
      
      if (!members || members.length === 0) {
        this.logger.debug(`No members to notify for event ${event.id}`);
        return;
      }
      
      // Format event date for notification
      let dateStr = '';
      if (event.startTime) {
        const date = new Date(event.startTime);
        dateStr = date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Get creator details
      const creator = event.creator;
      const creatorName = creator ? creator.name || 'Someone' : 'Someone';
      
      // Create notification for each member
      for (const member of members) {
        await this.notificationsService.create({
          recipientId: member.userId,
          senderId: creatorId,
          type: NotificationType.EVENT_INVITE,
          title: `New Event in ${community.name}`,
          content: `${creatorName} has created an event: "${event.title}" ${dateStr ? `on ${dateStr}` : ''}`,
          channels: [NotificationChannel.IN_APP, NotificationChannel.PUSH],
          actionUrl: `/dashboard/communities/${community.id}/events/${event.id}`,
          data: {
            eventId: event.id,
            communityId: community.id,
            eventTitle: event.title,
            startTime: event.startTime
          }
        });
      }
      
      this.logger.debug(`Successfully sent ${members.length} event notifications`);
    } catch (error) {
      this.logger.error(`Failed to send event notifications: ${error.message}`, error.stack);
      // Let the error propagate to the caller which will handle it
    }
  }

  async discoverEvents(
    userId: string,
    options: EventDiscoveryOptionsDto
  ) {
    this.logger.log(`Discovering events for user ${userId} with options: ${JSON.stringify(options)}`);
    
    // Default values
    const limit = options.limit || 10;
    const page = options.page || 1;
    const skip = (page - 1) * limit;
    
      // Get communities that the user is a member of
      const userMemberships = await this.communityMembersRepository.find({
        where: { userId },
        select: ['communityId'],
      });
      
      const userCommunityIds = userMemberships.map(m => m.communityId);
      
      // Check if we need to filter by events the user is attending
      let attendingEventIds: string[] = [];
      if (options.isAttending) {
        const attendances = await this.eventAttendeesRepository.find({
          where: { 
            userId,
            status: In([AttendeeStatus.GOING, AttendeeStatus.INTERESTED])
          },
          select: ['eventId']
        });
        attendingEventIds = attendances.map(a => a.eventId);
        
        if (attendingEventIds.length === 0) {
          // Early return if user is not attending any events but requested only attending events
          return {
            data: [],
            meta: {
              total: 0,
              page: options.page || 1,
              limit: options.limit || 10,
              pages: 0,
            }
          };
        }
      }
      
      // Build query
      const query = this.eventsRepository.createQueryBuilder('event')
        .leftJoinAndSelect('event.creator', 'creator')
        .leftJoinAndSelect('event.community', 'community');
    
    // Filter by event status
    if (options.status) {
      query.andWhere('event.status = :status', { status: options.status });
    } else {
      // By default, only show published events
      query.andWhere('event.status = :status', { status: EventStatus.PUBLISHED });
    }
    
    // Select fields for the query
    query.select([
      'event.id', 'event.title', 'event.description', 'event.type', 'event.status',
      'event.startTime', 'event.endTime', 'event.location', 'event.virtualMeetingUrl',
      'event.imageUrl', 'event.communityId', 'event.creatorId', 'event.attendeeLimit',
      'event.attendeeCount', 'event.isPrivate', 'event.settings', 'event.tags',
      'event.createdAt', 'event.updatedAt',
      'creator.id', 'creator.name', 'creator.profilePicture',
      'community.id', 'community.name', 'community.imageUrl', 'community.category'
    ]);
    
    // Apply filters
    
    // Filter by event type
    if (options.type) {
      query.andWhere('event.type = :type', { type: options.type });
    }
    
    // Filter by community category
    if (options.category) {
      query.andWhere('community.category = :category', { category: options.category });
    }
    
    // Filter by user's communities
    if (options.myCommunitiesOnly && userCommunityIds.length > 0) {
      query.andWhere('event.communityId IN (:...userCommunityIds)', { userCommunityIds });
    }
    
    // Filter by events user is attending
    if (options.isAttending && attendingEventIds.length > 0) {
      query.andWhere('event.id IN (:...attendingEventIds)', { attendingEventIds });
    }
    
    // Filter by date range
    if (options.upcoming) {
      query.andWhere('event.startTime > :now', { now: new Date() });
    }
    
    if (options.startDate) {
      query.andWhere('event.startTime >= :startDate', { startDate: options.startDate });
    }
    
    if (options.endDate) {
      query.andWhere('event.startTime <= :endDate', { endDate: options.endDate });
    }
    
    // Location-based filtering
    if (options.location) {
      // For a real implementation, we would use PostgreSQL PostGIS or a similar extension
      // to perform proper geospatial queries. For SQLite, we'll do approximate filtering.
      // This is a simplification and would need to be replaced with real geospatial queries.
      this.logger.debug(`Applying location filter: lat=${options.location.lat}, lng=${options.location.lng}, distance=${options.location.distance}km`);
      
      // For a prototype, we'll just filter by events that have coordinates within a bounding box
      // In a real implementation, we would use ST_DWithin or similar geospatial function
      
      // WARNING: This is a simplified implementation and doesn't handle the curvature of the earth.
      // For proper distance calculations, use a proper geospatial database extension.
      const lat = options.location.lat;
      const lng = options.location.lng;
      const distance = options.location.distance; // in kilometers
      
      // Filter by location field (if it contains lat/lng in some format)
      // This is a very simplified approach and would need to be replaced with real geospatial queries
      query.andWhere(`(event.location LIKE '%latitude%' OR event.location LIKE '%lat%' OR event.location LIKE '%lng%' OR event.location LIKE '%longitude%')`);
    }
    
    // Search functionality
    if (options.search && options.search.trim()) {
      const searchTerm = options.search.trim();
      query.andWhere(`(
        event.title LIKE :search 
        OR event.description LIKE :search
        OR event.location LIKE :search
        OR community.name LIKE :search
      )`, { search: `%${searchTerm}%` });
    }
    
    // Filter by tags (if provided)
    if (options.tags && options.tags.length > 0) {
      // For each tag, check if it's in the event's tags array
      options.tags.forEach((tag, index) => {
        query.andWhere(`event.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
      });
    }
    
    try {
      // Create a simpler count query
      const countQuery = this.eventsRepository.createQueryBuilder('event');
      
      // Apply the same filters but without joins
      if (options.status) {
        countQuery.andWhere('event.status = :status', { status: options.status });
      } else {
        countQuery.andWhere('event.status = :status', { status: EventStatus.PUBLISHED });
      }
      
      if (options.type) {
        countQuery.andWhere('event.type = :type', { type: options.type });
      }
      
      if (options.upcoming) {
        countQuery.andWhere('event.startTime > :now', { now: new Date() });
      }
      
      if (options.startDate) {
        countQuery.andWhere('event.startTime >= :startDate', { startDate: options.startDate });
      }
      
      if (options.endDate) {
        countQuery.andWhere('event.startTime <= :endDate', { endDate: options.endDate });
      }
      
      if (options.tags && options.tags.length > 0) {
        options.tags.forEach((tag, index) => {
          countQuery.andWhere(`event.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
        });
      }
      
      // Apply the same filters to the count query for location, search, and user-specific filters
      if (options.location) {
        countQuery.andWhere(`(event.location LIKE '%latitude%' OR event.location LIKE '%lat%' OR event.location LIKE '%lng%' OR event.location LIKE '%longitude%')`);
      }
      
      if (options.search && options.search.trim()) {
        const searchTerm = options.search.trim();
        countQuery.andWhere(`(
          event.title LIKE :search 
          OR event.description LIKE :search
          OR event.location LIKE :search
        )`, { search: `%${searchTerm}%` });
      }
      
      if (options.myCommunitiesOnly && userCommunityIds.length > 0) {
        countQuery.andWhere('event.communityId IN (:...userCommunityIds)', { userCommunityIds });
      }
      
      if (options.isAttending && attendingEventIds.length > 0) {
        countQuery.andWhere('event.id IN (:...attendingEventIds)', { attendingEventIds });
      }
      
      if (options.category) {
        // For this to work, we need to join with the community table in the count query
        countQuery.leftJoin('event.community', 'community_count')
          .andWhere('community_count.category = :category', { category: options.category });
      }
      
      const totalCount = await countQuery.getCount();
      
      // Apply sorting based on the sort parameter
      switch (options.sort) {
        case 'popularity':
          // Sort by attendee count (descending) and then by start time
          query.orderBy('event.attendeeCount', 'DESC')
               .addOrderBy('event.startTime', 'ASC');
          break;
          
        case 'distance':
          // For a real implementation with geospatial data, would order by distance
          // Since we don't have actual coordinates, fall back to date sorting
          query.orderBy('event.startTime', 'ASC');
          break;
          
        case 'relevance':
          // For relevance sorting, we'd use factors like:
          // - User interests match event tags
          // - User's friends are attending
          // - Events in communities user is active in
          // For now, we'll use a simple proxy of popularity and recency
          query.orderBy('event.attendeeCount', 'DESC')
               .addOrderBy('event.createdAt', 'DESC');
          break;
          
        case 'date':
        default:
          // Default sort by start time (ascending)
          query.orderBy('event.startTime', 'ASC');
      }
      
      // Apply pagination
      query.skip(skip).take(limit);
      
      // Execute query - get all events with a simplified approach to avoid SQLite limitations
      const events = await query.getMany();
      
      return {
        data: events,
        meta: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        }
      };
    } catch (error) {
      this.logger.error(`Error discovering events: ${error.message}`, error.stack);
      throw new Error(`Failed to discover events: ${error.message}`);
    }
  }
}
