import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual, Between, Like, LessThanOrEqual } from 'typeorm';
import { Event, EventStatus, EventType } from '../entities/event.entity';
import { EventAttendee, AttendeeStatus } from '../entities/event-attendee.entity';
import { Community } from '../entities/community.entity';
import { CreateEventDto } from '../dto/create-event.dto';
import { CommunityMember, CommunityRole } from '../entities/community-member.entity';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
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
        'creator.firstName',
        'creator.lastName',
        'creator.profilePhoto',
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

    await this.eventsRepository.update(id, updateEventDto);
    return this.findOne(id);
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
    return this.findOne(id);
  }

  async cancelEvent(id: string, userId: string): Promise<Event> {
    const event = await this.findOne(id);

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
    return this.findOne(id);
  }

  /**
   * Discover events based on user preferences and filters
   */
  async discoverEvents(
    userId: string, 
    options: {
      status?: EventStatus;
      type?: EventType;
      tags?: string[];
      upcoming?: boolean;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      page?: number;
    }
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
    
    // Build query
    const query = this.eventsRepository.createQueryBuilder('event')
      .leftJoinAndSelect('event.creator', 'creator')
      .leftJoinAndSelect('event.community', 'community')
      .select([
        'event',
        'creator.id',
        'creator.firstName',
        'creator.lastName',
        'creator.profilePhoto',
        'community.id',
        'community.name',
        'community.imageUrl',
      ]);
    
    // Filter by event status
    if (options.status) {
      query.andWhere('event.status = :status', { status: options.status });
    } else {
      // By default, only show published events
      query.andWhere('event.status = :status', { status: EventStatus.PUBLISHED });
    }
    
    // Filter by event type
    if (options.type) {
      query.andWhere('event.type = :type', { type: options.type });
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
    
    // Filter by tags (if provided)
    if (options.tags && options.tags.length > 0) {
      // For each tag, check if it's in the event's tags array
      options.tags.forEach((tag, index) => {
        query.andWhere(`event.tags LIKE :tag${index}`, { [`tag${index}`]: `%${tag}%` });
      });
    }
    
    // Sort by relevance: 
    // 1. Events from communities the user is a member of
    // 2. Recent and upcoming events
    query.addSelect(
      `CASE WHEN event.communityId IN (:...userCommunityIds) THEN 1 ELSE 0 END`,
      'relevance'
    )
    .setParameter('userCommunityIds', userCommunityIds.length > 0 ? userCommunityIds : ['']) // Handle empty array case
    .orderBy('relevance', 'DESC')
    .addOrderBy('event.startTime', 'ASC');
    
    // Apply pagination
    query.skip(skip).take(limit);
    
    // Get total count for pagination metadata
    const totalCount = await query.getCount();
    
    // Execute query
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
  }
}
