import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { getAuthToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

interface MessageType {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  messageType: string;
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
}

interface ConversationType {
  id: string;
  user1Id: string;
  user2Id: string;
  matchId?: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastMessage?: MessageType;
  unreadCount?: number;
  otherUser?: any;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

class MessageService {
  private socket: Socket | null = null;
  private messageCallbacks: Map<string, (message: MessageType) => void> = new Map();
  private typingCallbacks: Map<string, (data: { userId: string; isTyping: boolean }) => void> = new Map();
  private readCallbacks: Map<string, (data: { userId: string; timestamp: string }) => void> = new Map();
  private statusCallbacks: Map<string, (data: { userId: string; status: string }) => void> = new Map();

  // Connect to WebSocket server
  connect() {
    if (this.socket) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      console.error('Cannot connect to WebSocket: No authentication token');
      return;
    }

    this.socket = io(`${SOCKET_URL}/messages`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  // Disconnect from WebSocket server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Set up WebSocket event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to messaging WebSocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from messaging WebSocket');
    });

    this.socket.on('new_message', (message: MessageType) => {
      const callback = this.messageCallbacks.get(message.conversationId);
      if (callback) {
        callback(message);
      }
    });

    this.socket.on('typing_status', (data: { userId: string; conversationId: string; isTyping: boolean }) => {
      const callback = this.typingCallbacks.get(data.conversationId);
      if (callback) {
        callback({ userId: data.userId, isTyping: data.isTyping });
      }
    });

    this.socket.on('messages_read', (data: { userId: string; conversationId: string; timestamp: string }) => {
      const callback = this.readCallbacks.get(data.conversationId);
      if (callback) {
        callback({ userId: data.userId, timestamp: data.timestamp });
      }
    });

    this.socket.on('user_status', (data: { userId: string; status: string }) => {
      const callback = this.statusCallbacks.get(data.userId);
      if (callback) {
        callback(data);
      }
    });
  }

  // Join a specific conversation room
  joinConversation(conversationId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  // Send typing indicator
  sendTypingStatus(conversationId: string, isTyping: boolean) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('typing', { conversationId, isTyping });
    }
  }

  // Register callback for new messages in a conversation
  onNewMessage(conversationId: string, callback: (message: MessageType) => void) {
    this.messageCallbacks.set(conversationId, callback);
  }

  // Register callback for typing status in a conversation
  onTypingStatus(conversationId: string, callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.typingCallbacks.set(conversationId, callback);
  }

  // Register callback for read status in a conversation
  onMessagesRead(conversationId: string, callback: (data: { userId: string; timestamp: string }) => void) {
    this.readCallbacks.set(conversationId, callback);
  }

  // Register callback for user status changes
  onUserStatus(userId: string, callback: (data: { userId: string; status: string }) => void) {
    this.statusCallbacks.set(userId, callback);
  }

  // Remove a message callback
  removeMessageCallback(conversationId: string) {
    this.messageCallbacks.delete(conversationId);
  }

  // Remove a typing callback
  removeTypingCallback(conversationId: string) {
    this.typingCallbacks.delete(conversationId);
  }

  // Remove a read callback
  removeReadCallback(conversationId: string) {
    this.readCallbacks.delete(conversationId);
  }

  // Remove a status callback
  removeStatusCallback(userId: string) {
    this.statusCallbacks.delete(userId);
  }

  // Get all conversations for the current user
  async getConversations(page = 1, limit = 10): Promise<PaginatedResponse<ConversationType>> {
    const response = await axios.get(`${API_URL}/messages/conversations`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  }

  // Get a single conversation by ID
  async getConversation(conversationId: string): Promise<ConversationType> {
    const response = await axios.get(`${API_URL}/messages/conversations/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  }

  // Create a new conversation
  async createConversation(recipientId: string, matchId?: string, initialMessage?: string): Promise<ConversationType> {
    const response = await axios.post(
      `${API_URL}/messages/conversations`,
      {
        recipientId,
        matchId,
        initialMessage,
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  }

  // Get messages from a conversation
  async getMessages(conversationId: string, page = 1, limit = 20): Promise<PaginatedResponse<MessageType>> {
    const response = await axios.get(`${API_URL}/messages/conversations/${conversationId}/messages`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  }

  // Send a message via REST API
  async sendMessage(conversationId: string, content: string, messageType = 'text', attachmentUrl?: string): Promise<MessageType> {
    const response = await axios.post(
      `${API_URL}/messages/conversations/${conversationId}`,
      {
        conversationId,
        content,
        messageType,
        attachmentUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return response.data;
  }

  // Send a message via WebSocket
  sendMessageSocket(conversationId: string, content: string, messageType = 'text', attachmentUrl?: string): Promise<{ status: string; messageId?: string }> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.socket.connected) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit(
        'send_message',
        {
          conversationId,
          content,
          messageType,
          attachmentUrl,
        },
        (response: { status: string; messageId?: string; message?: string }) => {
          if (response.status === 'ok') {
            resolve(response);
          } else {
            reject(new Error(response.message || 'Failed to send message'));
          }
        }
      );
    });
  }

  // Mark all messages in a conversation as read
  async markAsRead(conversationId: string): Promise<{ success: boolean; markedAsRead: number }> {
    // Send via REST API
    const response = await axios.patch(
      `${API_URL}/messages/conversations/${conversationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );

    // Also send via WebSocket for real-time updates
    if (this.socket && this.socket.connected) {
      this.socket.emit('mark_read', { conversationId });
    }

    return response.data;
  }

  // Delete (archive) a conversation
  async deleteConversation(conversationId: string): Promise<{ success: boolean }> {
    const response = await axios.delete(`${API_URL}/messages/conversations/${conversationId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return response.data;
  }
}

export const messageService = new MessageService();

export default messageService;
