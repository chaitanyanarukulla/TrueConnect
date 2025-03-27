import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EventsService } from '../services/events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventStatus } from '../entities/event.entity';
import { Request } from '../../../types/express';

@Controller('communities/:communityId/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async create(@Req() req: Request, @Param('communityId') communityId: string, @Body() createEventDto: CreateEventDto) {
    // Make sure the communityId in the URL matches the one in the DTO
    if (communityId !== createEventDto.communityId) {
      throw new ForbiddenException('Community ID mismatch');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.create(userId, createEventDto);
  }

  @Get()
  async findAll(
    @Param('communityId') communityId: string,
    @Query('status') status?: EventStatus,
    @Query('upcoming') upcoming?: string,
  ) {
    // Convert string to boolean
    const isUpcoming = upcoming === 'true' || upcoming === '1';
    
    return this.eventsService.findAll(communityId, { 
      status, 
      upcoming: isUpcoming
    });
  }

  @Get(':id')
  async findOne(@Param('communityId') communityId: string, @Param('id') id: string) {
    const event = await this.eventsService.findOne(id);
    
    // Verify the event belongs to the specified community
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    return event;
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Param('communityId') communityId: string,
    @Param('id') id: string,
    @Body() updateEventDto: Partial<CreateEventDto>
  ) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    // If communityId is provided in the update, verify it matches the URL
    if (updateEventDto.communityId && updateEventDto.communityId !== communityId) {
      throw new ForbiddenException('Cannot change community for an event');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.update(id, userId, updateEventDto);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('communityId') communityId: string, @Param('id') id: string) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.remove(id, userId);
  }

  @Get(':id/attendees')
  async getAttendees(@Param('communityId') communityId: string, @Param('id') id: string) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    return this.eventsService.getAttendees(id);
  }

  @Post(':id/rsvp')
  async rsvp(
    @Req() req: Request,
    @Param('communityId') communityId: string,
    @Param('id') id: string,
    @Body() body: { status: 'going' | 'maybe' | 'not_going' }
  ) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.rsvp(id, userId, body.status);
  }

  @Delete(':id/rsvp')
  async cancelRsvp(@Req() req: Request, @Param('communityId') communityId: string, @Param('id') id: string) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.cancelRsvp(id, userId);
  }

  @Get(':id/rsvp')
  async getUserRsvp(@Req() req: Request, @Param('communityId') communityId: string, @Param('id') id: string) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.getUserRsvp(id, userId);
  }

  @Patch(':id/publish')
  async publishEvent(@Req() req: Request, @Param('communityId') communityId: string, @Param('id') id: string) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.publishEvent(id, userId);
  }

  @Patch(':id/cancel')
  async cancelEvent(@Req() req: Request, @Param('communityId') communityId: string, @Param('id') id: string) {
    // Ensure the event exists and belongs to the community
    const event = await this.eventsService.findOne(id);
    if (event.communityId !== communityId) {
      throw new ForbiddenException('Event does not belong to the specified community');
    }
    
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    return this.eventsService.cancelEvent(id, userId);
  }
}
