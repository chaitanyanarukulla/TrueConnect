import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Request
} from '@nestjs/common';
import { Request as ExpressRequest } from '../../types/express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { Match } from './entities/match.entity';

@ApiTags('matches')
@Controller('matches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a match (like or pass)' })
  @ApiResponse({ status: 201, description: 'Match action created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMatch(@Request() req: ExpressRequest, @Body() createMatchDto: CreateMatchDto): Promise<Match> {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.matchesService.createMatch(userId, createMatchDto);
  }

  @Get('potential')
  @ApiOperation({ summary: 'Get potential matches for the current user' })
  @ApiResponse({ status: 200, description: 'Returns a list of potential matches' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit the number of results' })
  async getPotentialMatches(
    @Request() req: ExpressRequest,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.matchesService.getPotentialMatches(userId, limit);
  }

  @Get()
  @ApiOperation({ summary: 'Get all matches for the current user' })
  @ApiResponse({ status: 200, description: 'Returns all matches' })
  async getUserMatches(@Request() req: ExpressRequest) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.matchesService.getUserMatches(userId);
  }
}
