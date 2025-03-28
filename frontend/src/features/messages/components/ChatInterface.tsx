import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import messageService from '@/services/api/message';
import { Conversation } from '@/types/conversation';

interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  isRead: boolean;
  messageType: string;
  attachmentUrl?: string;
}

interface ChatInterfaceProps {
  conversation: Conversation;
  currentUserId: string;
  onNewMessage: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  currentUserId,
  onNewMessage,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [typing, setTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  const messageListRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    if (conversation?.id) {
      loadMessages();
      
      // Join conversation room
      messageService.joinConversation(conversation.id);
      
      // Subscribe to new messages
      messageService.onNewMessage(conversation.id, handleNewMessage);
      
      // Subscribe to typing status
      messageService.onTypingStatus(conversation.id, handleTypingStatus);
      
      // Mark conversation as read when opened
      messageService.markAsRead(conversation.id);
    }
    
    return () => {
      if (conversation?.id) {
        // Leave conversation room
        messageService.leaveConversation(conversation.id);
        
        // Unsubscribe from events
        messageService.removeMessageCallback(conversation.id);
        messageService.removeTypingCallback(conversation.id);
      }
    };
  }, [conversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!conversation?.id) return;
    
    try {
      setLoading(true);
      const response = await messageService.getMessages(conversation.id, page);
      
      if (page === 1) {
        setMessages(response.data);
      } else {
        setMessages(prev => [...response.data, ...prev]);
      }
      
      setHasMore(page < response.meta.pages);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages. Please try again.');
      setLoading(false);
    }
  };

  const handleNewMessage = (newMessage: Message) => {
    // Add message to state if it doesn't exist
    setMessages(prev => {
      const exists = prev.some(m => m.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage];
    });
    
    // Mark as read if not from current user
    if (newMessage.senderId !== currentUserId) {
      messageService.markAsRead(conversation.id);
    }
    
    // Notify parent component
    onNewMessage();
  };

  const handleTypingStatus = (data: { userId: string, isTyping: boolean }) => {
    if (data.userId !== currentUserId) {
      setTyping(data.isTyping);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    messageService.sendTypingStatus(conversation.id, isTyping);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    
    // Send typing status
    sendTypingStatus(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing status
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!message.trim() || !conversation?.id) return;
    
    try {
      setSending(true);
      
      // Send message via WebSocket for real-time delivery
      try {
        await messageService.sendMessageSocket(conversation.id, message.trim());
      } catch (socketError) {
        // Fallback to REST API if WebSocket fails
        await messageService.sendMessage(conversation.id, message.trim());
      }
      
      // Clear input
      setMessage('');
      
      // Stop typing status
      sendTypingStatus(false);
      
      // Reload conversation to get the latest messages
      onNewMessage();
      
      setSending(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      loadMessages();
    }
  };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), 'p'); // 'p' gives format like '12:00 AM/PM'
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center border-b p-3">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
          {conversation.otherUser?.profilePhoto ? (
            <Image
              src={conversation.otherUser.profilePhoto}
              alt={`${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {conversation.otherUser?.firstName?.charAt(0)}
              {conversation.otherUser?.lastName?.charAt(0)}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">
            {conversation.otherUser?.firstName} {conversation.otherUser?.lastName}
          </p>
          {typing && <p className="text-xs text-primary">Typing...</p>}
        </div>
      </div>
      
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-4"
        ref={messageListRef}
      >
        {loading && page === 1 ? (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {hasMore && (
              <button
                className="w-full text-center text-primary p-2 hover:bg-primary/5 rounded-lg my-2"
                onClick={loadMoreMessages}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load more messages'}
              </button>
            )}
            
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-500">No messages yet</p>
                <p className="text-gray-400 text-sm mt-2">
                  Send a message to start the conversation
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => {
                  const isCurrentUser = msg.senderId === currentUserId;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                          isCurrentUser 
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-gray-100 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-100' : 'text-gray-500'}`}>
                          {formatMessageTime(msg.createdAt)}
                          {isCurrentUser && msg.isRead && (
                            <span className="ml-2">✓ Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Input Area */}
      <div className="border-t p-3">
        {error && (
          <div className="text-red-500 text-sm mb-2">
            {error}
            <button
              className="ml-2 text-primary hover:underline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex items-center">
          <input
            type="text"
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={sending}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || sending}
            className={`ml-2 p-2 rounded-full ${
              message.trim() && !sending
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
