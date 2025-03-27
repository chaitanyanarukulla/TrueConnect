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
import { UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { NotificationsService } from '../notifications.service';
import { JwtPayload } from '../../auth/interfaces/jwt-payload.interface';
import { LoggingService } from '../../logging/logging.service';
import { WsLoggingInterceptor } from '../../logging/ws-logging.interceptor';
import { NotificationStatus } from '../../../types/enums';

interface AuthenticatedSocket extends Socket {
  user: JwtPayload;
}

@UseInterceptors(WsLoggingInterceptor)
@WebSocketGateway({
  cors: {
    origin: '*', // In production, you'd want to restrict this
    credentials: true,
  },
  namespace: 'notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer()
  server: Server;

  // Store connected clients with their user info
  private connectedClients: Map<string, string> = new Map();

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly loggingService: LoggingService,
  ) {
    this.loggingService.setContext('NotificationsGateway');
  }
  
  afterInit(server: Server) {
    this.loggingService.log('Notifications WebSocket Gateway initialized', 'NotificationsGateway');
  }

  async handleConnection(client: AuthenticatedSocket) {
    this.loggingService.debug(`Client attempting to connect: ${client.id}`);
    
    try {
      // Extract and verify JWT token from handshake
      const token = client.handshake.auth.token || 
                    client.handshake.headers.authorization?.split(' ')[1];
                    
      if (!token) {
        this.loggingService.warn(`WebSocket connection rejected: no token provided`, 'NotificationsGateway', { clientId: client.id });
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token) as JwtPayload;
      if (!payload) {
        this.loggingService.warn(`WebSocket connection rejected: invalid token`, 'NotificationsGateway', { clientId: client.id });
        client.disconnect();
        return;
      }

      // Store user information on socket
      client.user = payload;
      
      // Extract user ID - use id or fallback to sub for backwards compatibility
      const userId = payload.id || payload.sub;
      this.connectedClients.set(client.id, userId);
      
      this.loggingService.debug(`Client connected: ${client.id}`, 'NotificationsGateway', { userId });

      // Join user's personal notification room
      const room = `user_${userId}`;
      client.join(room);
      
      this.loggingService.debug(`User joined notification room: ${room}`, 'NotificationsGateway', { 
        userId, 
        clientId: client.id,
        room
      });

      // Send unread notification count on connection
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      client.emit('unread_count', unreadCount);
      
      this.loggingService.debug(`Sent unread notification count to user`, 'NotificationsGateway', { 
        userId, 
        count: unreadCount.count 
      });
      
    } catch (error) {
      this.loggingService.error(`Error during WebSocket connection: ${error.message}`, error.stack, 'NotificationsGateway');
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.connectedClients.get(client.id);
    if (userId) {
      this.connectedClients.delete(client.id);
      this.loggingService.debug(`Client disconnected: ${client.id}`, 'NotificationsGateway', { userId });
    } else {
      this.loggingService.debug(`Unknown client disconnected: ${client.id}`, 'NotificationsGateway');
    }
  }

  @SubscribeMessage('mark_as_read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const userId = client.user.id || client.user.sub;
      const { notificationId } = data;

      this.loggingService.debug(`Marking notification as read`, 'NotificationsGateway.mark_as_read', {
        userId,
        notificationId
      });
      
      const result = await this.notificationsService.update(
        notificationId, 
        userId, 
        { status: NotificationStatus.READ }
      );
      
      // Get updated unread count
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      
      // Send updated unread count to the user
      const room = `user_${userId}`;
      this.server.to(room).emit('unread_count', unreadCount);

      this.loggingService.debug(`Notification marked as read`, 'NotificationsGateway.mark_as_read', {
        userId,
        notificationId,
        unreadCount: unreadCount.count
      });

      return { status: 'ok', notification: result };
    } catch (error) {
      this.loggingService.error(
        `Error marking notification as read: ${error.message}`, 
        error.stack, 
        'NotificationsGateway.mark_as_read'
      );
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('mark_all_as_read')
  async handleMarkAllAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const userId = client.user.id || client.user.sub;

      this.loggingService.debug(`Marking all notifications as read`, 'NotificationsGateway.mark_all_as_read', {
        userId
      });
      
      const result = await this.notificationsService.markAllAsRead(userId);
      
      // Send updated unread count to the user
      const room = `user_${userId}`;
      this.server.to(room).emit('unread_count', { count: 0 });

      this.loggingService.debug(`All notifications marked as read`, 'NotificationsGateway.mark_all_as_read', {
        userId,
        count: result.count
      });

      return { status: 'ok', ...result };
    } catch (error) {
      this.loggingService.error(
        `Error marking all notifications as read: ${error.message}`, 
        error.stack, 
        'NotificationsGateway.mark_all_as_read'
      );
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage('archive_notification')
  async handleArchiveNotification(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    try {
      const userId = client.user.id || client.user.sub;
      const { notificationId } = data;

      this.loggingService.debug(`Archiving notification`, 'NotificationsGateway.archive_notification', {
        userId,
        notificationId
      });
      
      const result = await this.notificationsService.archive(notificationId, userId);
      
      // Get updated unread count if the notification was unread
      if (result.status === NotificationStatus.ARCHIVED) {
        const unreadCount = await this.notificationsService.getUnreadCount(userId);
        
        // Send updated unread count to the user
        const room = `user_${userId}`;
        this.server.to(room).emit('unread_count', unreadCount);
      }

      this.loggingService.debug(`Notification archived`, 'NotificationsGateway.archive_notification', {
        userId,
        notificationId
      });

      return { status: 'ok', notification: result };
    } catch (error) {
      this.loggingService.error(
        `Error archiving notification: ${error.message}`, 
        error.stack, 
        'NotificationsGateway.archive_notification'
      );
      return { status: 'error', message: error.message };
    }
  }

  /**
   * Method to be called from notification service when a new notification is created
   * This will push the notification to connected clients in real-time
   */
  public notifyNewNotification(userId: string, notification: any) {
    const room = `user_${userId}`;
    
    // Send the notification to the user's room
    this.server.to(room).emit('new_notification', notification);
    
    // Also update the unread count
    this.notificationsService.getUnreadCount(userId)
      .then(unreadCount => {
        this.server.to(room).emit('unread_count', unreadCount);
      })
      .catch(error => {
        this.loggingService.error(
          `Error getting unread count: ${error.message}`, 
          error.stack, 
          'NotificationsGateway.notifyNewNotification'
        );
      });
    
    this.loggingService.debug(`Sent new notification to user`, 'NotificationsGateway', {
      userId,
      notificationId: notification.id,
      type: notification.type,
      room
    });
  }
}
