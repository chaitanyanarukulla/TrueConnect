/**
 * NotificationBadge component that displays a count of unread notifications
 * This is used in the navigation bar to indicate unread notifications
 */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import io, { Socket } from 'socket.io-client';
import { getAuthHeaders } from '@/lib/auth';

interface NotificationBadgeProps {
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ className = '' }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

  // Connect to notification WebSocket
  useEffect(() => {
    const connectSocket = async () => {
      try {
        const headers = await getAuthHeaders();
        const token = headers.Authorization?.split(' ')[1];
        
        if (!token) return;
        
        const socketIo = io(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications`, {
          auth: { token },
          transports: ['websocket'],
          autoConnect: true,
        });

        socketIo.on('connect', () => {
          console.log('Connected to notifications socket');
        });

        socketIo.on('unread_count', (data: { count: number }) => {
          setUnreadCount(data.count);
        });

        socketIo.on('new_notification', () => {
          // Increment the unread count when a new notification arrives
          setUnreadCount((prev) => prev + 1);
        });

        socketIo.on('disconnect', () => {
          console.log('Disconnected from notifications socket');
        });

        socketIo.on('error', (error: any) => {
          console.error('Notification socket error:', error);
        });

        setSocket(socketIo);

        // Clean up on unmount
        return () => {
          socketIo.disconnect();
        };
      } catch (error) {
        console.error('Error connecting to notifications socket:', error);
      }
    };

    connectSocket();
  }, []);

  // Fetch initial unread count when component mounts
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/notifications/unread-count`,
          { headers: await getAuthHeaders() }
        );
        
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    };

    fetchUnreadCount();
  }, []);

  const handleBadgeClick = () => {
    router.push('/dashboard/notifications');
  };

  if (unreadCount === 0) {
    return null; // Don't render anything if there are no unread notifications
  }

  return (
    <button 
      onClick={handleBadgeClick}
      className={`relative rounded-full bg-primary text-white text-xs font-bold px-2 py-1 min-w-[20px] flex items-center justify-center ${className}`}
      aria-label={`${unreadCount} unread notifications`}
    >
      {unreadCount > 99 ? '99+' : unreadCount}
    </button>
  );
};

export default NotificationBadge;
