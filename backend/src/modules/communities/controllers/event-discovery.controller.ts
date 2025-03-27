import { Controller, Get, UseGuards, Query, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { EventsService } from '../services/events.service';
import { EventStatus, EventType } from '../entities/event.entity';
import { Request } from '../../../types/express';

@Controller('events/discover')
@UseGuards(JwtAuthGuard)
export class EventDiscoveryController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async discoverEvents(
    @Req() req: Request,
    @Query('status') status?: EventStatus,
    @Query('type') type?: EventType,
    @Query('tags') tags?: string,
    @Query('upcoming') upcoming?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    
    // Convert string parameters to appropriate types
    const isUpcoming = upcoming === 'true' || upcoming === '1';
    const parsedLimit = limit ? parseInt(String(limit), 10) : 10;
    const parsedPage = page ? parseInt(String(page), 10) : 1;
    
    // Parse tags if provided
    const tagArray = tags ? tags.split(',').map(tag => tag.trim()) : undefined;
    
    // Parse dates if provided
    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;
    
    return this.eventsService.discoverEvents(userId, {
      status,
      type,
      tags: tagArray,
      upcoming: isUpcoming,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      limit: parsedLimit,
      page: parsedPage,
    });
  }
}
