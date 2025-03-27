import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Equal } from 'typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from './entities/conversation.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UsersService } from '../users/users.service';
import { MatchesService } from '../matches/matches.service';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly usersService: UsersService,
    private readonly matchesService: MatchesService,
    private readonly logger: LoggingService
  ) {
    this.logger.setContext('MessagesService');
  }

  async createConversation(userId: string, createConversationDto: CreateConversationDto) {
    const { recipientId, matchId, initialMessage } = createConversationDto;
    
    this.logger.log(`Creating conversation between user ${userId} and ${recipientId}`, undefined, {
      userId,
      recipientId,
      hasMatchId: !!matchId,
      hasInitialMessage: !!initialMessage
    });

    // Check if users exist
    this.logger.debug(`Verifying both users exist`);
    const currentUser = await this.usersService.findById(userId);
    const recipient = await this.usersService.findById(recipientId);

    if (!recipient) {
      this.logger.warn(`Recipient ${recipientId} not found when creating conversation`);
      throw new NotFoundException('Recipient not found');
    }

    // Check if match exists if provided
    if (matchId) {
      this.logger.debug(`Verifying match ${matchId} exists and involves both users`);
      const match = await this.matchesService.findById(matchId);
      if (!match) {
        this.logger.warn(`Match ${matchId} not found when creating conversation`);
        throw new NotFoundException('Match not found');
      }

      // Verify that the match involves both users
      if (
        (match.userId !== userId && match.targetUserId !== userId) ||
        (match.userId !== recipientId && match.targetUserId !== recipientId)
      ) {
        this.logger.warn(`Match ${matchId} does not involve both users ${userId} and ${recipientId}`);
        throw new ForbiddenException('Match does not involve both users');
      }
    }

    // Check if conversation already exists
    this.logger.debug(`Checking if conversation already exists`);
    const existingConversation = await this.conversationRepository.findOne({
      where: [
        { user1Id: userId, user2Id: recipientId },
        { user1Id: recipientId, user2Id: userId }
      ]
    });

    if (existingConversation) {
      this.logger.debug(`Conversation already exists with ID ${existingConversation.id}`);
      return existingConversation;
    }

    // Create new conversation
    this.logger.debug(`Creating new conversation`);
    const conversation = this.conversationRepository.create({
      user1Id: userId,
      user2Id: recipientId,
      matchId
    });

    const savedConversation = await this.conversationRepository.save(conversation);
    this.logger.debug(`Created conversation with ID ${savedConversation.id}`);

    // Add initial message if provided
    if (initialMessage) {
      this.logger.debug(`Adding initial message to conversation ${savedConversation.id}`);
      await this.messageRepository.save({
        conversationId: savedConversation.id,
        senderId: userId,
        content: initialMessage,
        messageType: 'text'
      });

      // Update last message time
      savedConversation.lastMessageAt = new Date();
      await this.conversationRepository.save(savedConversation);
      this.logger.debug(`Updated conversation last message time`);
    }

    this.logger.log(`Successfully created conversation ${savedConversation.id} between users ${userId} and ${recipientId}`);
    return savedConversation;
  }

  async getConversations(userId: string, paginationOptions: { page: number; limit: number }) {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;
    
    this.logger.debug(`Getting conversations for user ${userId} (page: ${page}, limit: ${limit})`);
    const startTime = process.hrtime();

    const [conversations, total] = await this.conversationRepository.findAndCount({
      where: [
        { user1Id: userId },
        { user2Id: userId }
      ],
      relations: ['user1', 'user2', 'match'],
      order: { lastMessageAt: 'DESC', createdAt: 'DESC' },
      skip,
      take: limit
    });
    
    this.logger.debug(`Found ${conversations.length} conversations for user ${userId}`);

    // Get last message and unread count for each conversation
    this.logger.debug(`Fetching details for ${conversations.length} conversations`);
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conversation) => {
        const lastMessage = await this.messageRepository.findOne({
          where: { conversationId: conversation.id },
          order: { createdAt: 'DESC' }
        });

        const unreadCount = await this.messageRepository.count({
          where: {
            conversationId: conversation.id,
            senderId: Not(Equal(userId)),
            isRead: false
          }
        });

        // Get other user (not current user)
        const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1;

        return {
          ...conversation,
          lastMessage,
          unreadCount,
          otherUser
        };
      })
    );
    
    const endTime = process.hrtime(startTime);
    const duration = Math.round((endTime[0] * 1e9 + endTime[1]) / 1e6);
    
    this.logger.debug(`Returning ${conversationsWithDetails.length} conversations with details in ${duration}ms`);

    return {
      data: conversationsWithDetails,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getConversationById(userId: string, conversationId: string) {
    this.logger.debug(`Getting conversation ${conversationId} for user ${userId}`);
    
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['user1', 'user2', 'match']
    });

    if (!conversation) {
      this.logger.warn(`Conversation ${conversationId} not found`);
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      this.logger.warn(`User ${userId} attempted to access conversation ${conversationId} without permission`);
      throw new ForbiddenException('You do not have access to this conversation');
    }

    this.logger.debug(`Fetching last message and unread count for conversation ${conversationId}`);
    // Get last message and unread count
    const lastMessage = await this.messageRepository.findOne({
      where: { conversationId },
      order: { createdAt: 'DESC' }
    });

    const unreadCount = await this.messageRepository.count({
      where: {
        conversationId,
        senderId: Not(Equal(userId)),
        isRead: false
      }
    });

    // Get other user (not current user)
    const otherUser = conversation.user1Id === userId ? conversation.user2 : conversation.user1;
    
    this.logger.debug(`Successfully retrieved conversation ${conversationId} with ${unreadCount} unread messages`);

    return {
      ...conversation,
      lastMessage,
      unreadCount,
      otherUser
    };
  }

  async sendMessage(userId: string, conversationId: string, createMessageDto: CreateMessageDto) {
    const { content, messageType, attachmentUrl } = createMessageDto;
    
    this.logger.log(`User ${userId} sending message to conversation ${conversationId}`, undefined, {
      messageType: messageType || 'text',
      hasAttachment: !!attachmentUrl,
      contentLength: content?.length || 0
    });

    // Check if conversation exists
    this.logger.debug(`Verifying conversation ${conversationId} exists`);
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      this.logger.warn(`Conversation ${conversationId} not found when sending message`);
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      this.logger.warn(`User ${userId} attempted to send message to conversation ${conversationId} they're not part of`);
      throw new ForbiddenException('You are not part of this conversation');
    }

    // Create message
    this.logger.debug(`Creating new message in conversation ${conversationId}`);
    const message = this.messageRepository.create({
      conversationId,
      senderId: userId,
      content,
      messageType: messageType || 'text',
      attachmentUrl
    });

    const savedMessage = await this.messageRepository.save(message);
    this.logger.debug(`Created message with ID ${savedMessage.id}`);

    // Update conversation last message time
    conversation.lastMessageAt = new Date();
    await this.conversationRepository.save(conversation);
    this.logger.debug(`Updated conversation last message time`);

    this.logger.log(`Successfully sent message ${savedMessage.id} to conversation ${conversationId}`);
    return savedMessage;
  }

  async getMessages(
    userId: string,
    conversationId: string,
    paginationOptions: { page: number; limit: number }
  ) {
    const { page, limit } = paginationOptions;
    const skip = (page - 1) * limit;
    
    this.logger.debug(`Getting messages for conversation ${conversationId}, user ${userId} (page: ${page}, limit: ${limit})`);
    const startTime = process.hrtime();

    // Check if conversation exists
    this.logger.debug(`Verifying conversation ${conversationId} exists`);
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      this.logger.warn(`Conversation ${conversationId} not found when fetching messages`);
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      this.logger.warn(`User ${userId} attempted to access messages for conversation ${conversationId} without permission`);
      throw new ForbiddenException('You do not have access to this conversation');
    }

    this.logger.debug(`Fetching messages with pagination`);
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
      relations: ['sender']
    });
    
    const endTime = process.hrtime(startTime);
    const duration = Math.round((endTime[0] * 1e9 + endTime[1]) / 1e6);
    
    this.logger.debug(`Retrieved ${messages.length} messages for conversation ${conversationId} in ${duration}ms`);

    return {
      data: messages.reverse(), // Return in chronological order
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async markConversationAsRead(userId: string, conversationId: string) {
    this.logger.log(`Marking conversation ${conversationId} as read for user ${userId}`);
    
    // Check if conversation exists
    this.logger.debug(`Verifying conversation ${conversationId} exists`);
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      this.logger.warn(`Conversation ${conversationId} not found when marking as read`);
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      this.logger.warn(`User ${userId} attempted to mark conversation ${conversationId} as read without permission`);
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // Mark all unread messages sent by the other user as read
    this.logger.debug(`Updating unread messages to read status`);
    const result = await this.messageRepository.update(
      {
        conversationId,
        senderId: Not(Equal(userId)),
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
    
    this.logger.debug(`Marked ${result.affected} messages as read in conversation ${conversationId}`);

    return {
      success: true,
      markedAsRead: result.affected
    };
  }

  async deleteConversation(userId: string, conversationId: string) {
    this.logger.log(`Soft-deleting conversation ${conversationId} for user ${userId}`);
    
    // Check if conversation exists
    this.logger.debug(`Verifying conversation ${conversationId} exists`);
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId }
    });

    if (!conversation) {
      this.logger.warn(`Conversation ${conversationId} not found when attempting to delete`);
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is part of the conversation
    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      this.logger.warn(`User ${userId} attempted to delete conversation ${conversationId} without permission`);
      throw new ForbiddenException('You do not have access to this conversation');
    }

    // Soft delete the conversation
    this.logger.debug(`Performing soft-delete on conversation ${conversationId}`);
    conversation.isActive = false;
    await this.conversationRepository.save(conversation);
    
    this.logger.log(`Successfully soft-deleted conversation ${conversationId}`);

    return {
      success: true
    };
  }
}
