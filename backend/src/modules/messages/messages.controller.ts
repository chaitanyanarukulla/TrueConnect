import { Controller, Get, Post, Body, Param, UseGuards, Patch, Query, Delete, Request } from '@nestjs/common';
import { Request as ExpressRequest } from '../../types/express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';

@ApiTags('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('conversations')
  @ApiOperation({ summary: 'Create a new conversation' })
  @ApiResponse({ status: 201, description: 'Conversation created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async createConversation(@Request() req: ExpressRequest, @Body() createConversationDto: CreateConversationDto) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.createConversation(userId, createConversationDto);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for current user' })
  @ApiResponse({ status: 200, description: 'List of conversations.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getConversations(
    @Request() req: ExpressRequest,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.getConversations(userId, { page, limit });
  }

  @Get('conversations/:id')
  @ApiOperation({ summary: 'Get a conversation by ID' })
  @ApiResponse({ status: 200, description: 'Conversation details.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async getConversationById(@Request() req: ExpressRequest, @Param('id') id: string) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.getConversationById(userId, id);
  }

  @Post('conversations/:id')
  @ApiOperation({ summary: 'Send a message to a conversation' })
  @ApiResponse({ status: 201, description: 'Message sent successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async sendMessage(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() createMessageDto: CreateMessageDto
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.sendMessage(userId, id, createMessageDto);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages from a conversation' })
  @ApiResponse({ status: 200, description: 'List of messages.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getMessages(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20
  ) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.getMessages(userId, id, { page, limit });
  }

  @Patch('conversations/:id/read')
  @ApiOperation({ summary: 'Mark all messages in a conversation as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async markConversationAsRead(@Request() req: ExpressRequest, @Param('id') id: string) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.markConversationAsRead(userId, id);
  }

  @Delete('conversations/:id')
  @ApiOperation({ summary: 'Delete a conversation' })
  @ApiResponse({ status: 200, description: 'Conversation deleted.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 404, description: 'Conversation not found.' })
  @ApiParam({ name: 'id', description: 'Conversation ID' })
  async deleteConversation(@Request() req: ExpressRequest, @Param('id') id: string) {
    // Ensure we have a valid user ID
    const userId = req.user.id || req.user.sub;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.messagesService.deleteConversation(userId, id);
  }
}
