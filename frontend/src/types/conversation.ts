/**
 * Shared Conversation interface for use across the application
 */
export interface Conversation {
  id: string;
  user1Id: string;
  user2Id: string;
  lastMessageAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount?: number;
  otherUser?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}
