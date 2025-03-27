import React from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: string;
  lastMessageAt?: string;
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

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversation: Conversation) => void;
  loading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  loading,
}) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-gray-500 mt-2">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-gray-500">No conversations yet</p>
        <p className="text-gray-400 text-sm mt-2">
          Start chatting with your matches to begin a conversation
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-2">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              selectedConversationId === conversation.id
                ? 'bg-primary/10'
                : 'hover:bg-gray-100'
            }`}
            onClick={() => onSelectConversation(conversation)}
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                {conversation.otherUser?.profilePhoto ? (
                  <Image
                    src={conversation.otherUser.profilePhoto}
                    alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    {conversation.otherUser?.firstName?.charAt(0)}
                    {conversation.otherUser?.lastName?.charAt(0)}
                  </div>
                )}
              </div>
              {conversation.unreadCount && conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-primary text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                </div>
              )}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <div className="flex justify-between items-center">
                <p className="font-medium truncate">
                  {conversation.otherUser?.firstName} {conversation.otherUser?.lastName}
                </p>
                {conversation.lastMessageAt && (
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                  </p>
                )}
              </div>
              <p className={`text-sm truncate ${conversation.unreadCount ? 'font-medium' : 'text-gray-500'}`}>
                {conversation.lastMessage?.content || 'No messages yet'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
