import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../messages.service';
import { UsersService } from '../../users/users.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { LoggingService } from '../../logging/logging.service';
import { WsLoggingInterceptor } from '../../logging/ws-logging.interceptor';

interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}

@UseInterceptors(WsLoggingInterceptor)
@WebSocketGateway({
  cors: {
    origin: '*', // In production, you'd want to restrict this
    credentials: true,
  },
  namespace: 'messages',
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  // Store connected clients with their user info
  private connectedClients: Map<string, string> = new Map();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext('MessagesGateway');
  }
  
  afterInit(server: Server) {
    this.loggingService.log('WebSocket Gateway initialized', 'MessagesGateway');
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.loggingService.debug(`Client attempting to connect: ${client.id}`);
    
    try {
      // Extract and verify JWT token from handshake
      const token = client.handshake.auth.token || 
                    client.handshake.headers.authorization?.split(' ')[1];
                    
      if (!token) {
        this.loggingService.warn(`WebSocket connection rejected: no token provided`, 'MessagesGateway', { clientId: client.id });
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token) as JwtPayload;
      if (!payload) {
        this.loggingService.warn(`WebSocket connection rejected: invalid token`, 'MessagesGateway', { clientId: client.id });
        client.disconnect();
        return;
      }

      // Store user information on socket
      client.user = payload;
      
      // Extract user ID - use id or fallback to sub for backwards compatibility
      const userId = payload.id || payload.sub;
      this.connectedClients.set(client.id, userId);
      
      this.loggingService.debug(`Client connected: ${client.id}`, 'MessagesGateway', { userId });

      // Join room for user's conversations
      const conversations = await this.messagesService.getConversations(userId, { page: 1, limit: 100 });
      conversations.data.forEach(conversation => {
        client.join(`conversation_${conversation.id}`);
        this.loggingService.debug(`User joined conversation room: ${conversation.id}`, 'MessagesGateway', { 
          userId, 
          clientId: client.id,
          conversationId: conversation.id
        });
      });

      // Notify about user's online status
      this.server.emit('user_status', { userId, status: 'online' });
      this.loggingService.debug(`User status updated to online`, 'MessagesGateway', { userId });
    } catch (error) {
      this.loggingService.error(`Error during WebSocket connection: ${error.message}`, error.stack, 'MessagesGateway');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      this.server.emit('user_status', { userId, status: 'offline' });
      this.connectedClients.delete(client.id);
      this.loggingService.debug(`Client disconnected: ${client.id}`, 'MessagesGateway', { userId });
    } else {
      this.loggingService.debug(`Unknown client disconnected: ${client.id}`, 'MessagesGateway');
    }
  }

  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.user?.id || client.user?.sub;
    const room = `conversation_${data.conversationId}`;
    
    client.join(room);
    this.loggingService.debug(`User joined conversation manually`, 'MessagesGateway', { 
      userId,
      clientId: client.id, 
      conversationId: data.conversationId,
      room 
    });
    
    return { status: 'ok' };
  }

  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.user?.id || client.user?.sub;
    const room = `conversation_${data.conversationId}`;
    
    client.leave(room);
    this.loggingService.debug(`User left conversation`, 'MessagesGateway', { 
      userId,
      clientId: client.id, 
      conversationId: data.conversationId,
      room 
    });
    
    return { status: 'ok' };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string; messageType?: string; attachmentUrl?: string },
  ) {
    try {
      const userId = client.user.id || client.user.sub;
      const { conversationId, content, messageType, attachmentUrl } = data;
      const room = `conversation_${conversationId}`;

      this.loggingService.debug(`Processing new message`, 'MessagesGateway.send_message', {
        userId,
        conversationId,
        messageType: messageType || 'text',
        hasAttachment: !!attachmentUrl
      });

      // Create message via service
      const messageDto: CreateMessageDto = {
        conversationId,
        content,
        messageType: messageType || 'text',
        attachmentUrl,
      };

      const message = await this.messagesService.sendMessage(userId, conversationId, messageDto);

      // Emit message to conversation room
      this.server.to(room).emit('new_message', {
        ...message,
        sender: { id: userId },
      });

      this.loggingService.debug(`Message sent successfully`, 'MessagesGateway.send_message', {
        userId,
        conversationId,
        messageId: message.id,
        room
      });

      return { status: 'ok', messageId: message.id };
    } catch (error) {
      this.loggingService.error(
        `Error sending message: ${error.message}`, 
        error.stack, 
        'MessagesGateway.send_message'
      );
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.user.id || client.user.sub;
    const room = `conversation_${data.conversationId}`;
    
    // Log typing events at verbose level to avoid log noise
    this.loggingService.verbose(`User typing status change`, 'MessagesGateway.typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping
    });
    
    // Emit typing status to conversation room
    this.server.to(room).emit('typing_status', {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });

    return { status: 'ok' };
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const userId = client.user.id || client.user.sub;
      const room = `conversation_${data.conversationId}`;
      
      this.loggingService.debug(`Marking conversation as read`, 'MessagesGateway.mark_read', {
        userId,
        conversationId: data.conversationId
      });
      
      const result = await this.messagesService.markConversationAsRead(userId, data.conversationId);
      
      // Notify conversation members that messages were read
      this.server.to(room).emit('messages_read', {
        userId,
        conversationId: data.conversationId,
        timestamp: new Date(),
      });

      this.loggingService.debug(`Conversation marked as read`, 'MessagesGateway.mark_read', {
        userId,
        conversationId: data.conversationId,
        messagesRead: result.markedAsRead || 0
      });

      return { status: 'ok', ...result };
    } catch (error) {
      this.loggingService.error(
        `Error marking conversation as read: ${error.message}`, 
        error.stack, 
        'MessagesGateway.mark_read'
      );
      return { status: 'error', message: error.message };
    }
  }

  // Method to be called from message service when a new message is created
  // (for messages created outside of WebSocket, e.g., via REST API)
  public notifyNewMessage(conversationId: string, message: any) {
    const room = `conversation_${conversationId}`;
    this.server.to(room).emit('new_message', message);
    
    this.loggingService.debug(`Notified room of new message from API`, 'MessagesGateway', {
      conversationId,
      messageId: message.id,
      senderId: message.senderId,
      room
    });
  }
}
