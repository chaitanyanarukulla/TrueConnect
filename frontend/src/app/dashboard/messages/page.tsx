'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import messageService from '@/services/api/message';
import ConversationList from '@/features/messages/components/ConversationList';
import ChatInterface from '@/features/messages/components/ChatInterface';
import { Conversation } from '@/types/conversation';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('id');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  useEffect(() => {
    // Connect to WebSocket when the page loads
    messageService.connect();

    // Load conversations
    loadConversations();

    // Cleanup WebSocket connection when the page is unmounted
    return () => {
      messageService.disconnect();
    };
  }, []);

  useEffect(() => {
    // If conversationId query param exists, load that conversation
    if (conversationId) {
      loadConversationById(conversationId);
    }
  }, [conversationId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data);
      
      // If there's a conversationId in the URL, select that conversation
      if (conversationId) {
        const conversation = response.data.find(conv => conv.id === conversationId);
        if (conversation) {
          setSelectedConversation(conversation);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setLoading(false);
    }
  };

  const loadConversationById = async (id: string) => {
    try {
      const conversation = await messageService.getConversation(id);
      setSelectedConversation(conversation);
      
      // Update the URL if needed
      if (!conversationId) {
        router.push(`/dashboard/messages?id=${id}`);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    router.push(`/dashboard/messages?id=${conversation.id}`);
    
    // Mark conversation as read when selected
    if (conversation.unreadCount && conversation.unreadCount > 0) {
      messageService.markAsRead(conversation.id);
    }
  };

  const handleNewMessage = async (conversation: Conversation) => {
    // Move this conversation to the top of the list
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== conversation.id);
      return [conversation, ...updated];
    });
  };

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      
      {user ? (
        <div className="flex flex-1 gap-4 h-[calc(100vh-200px)]">
          {/* Conversation List */}
          <div className="w-1/3 border rounded-lg overflow-hidden">
            <ConversationList 
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              loading={loading}
            />
          </div>
          
          {/* Chat Interface */}
          <div className="w-2/3 border rounded-lg overflow-hidden">
            {selectedConversation ? (
              <ChatInterface 
                conversation={selectedConversation}
                currentUserId={user.id}
                onNewMessage={() => handleNewMessage(selectedConversation)}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Please log in to view your messages</p>
        </div>
      )}
    </div>
  );
}
