"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNotifications, markAsRead, markAllAsRead } from '@/services/api/notification';
import { NotificationType, NotificationStatus } from '@/types/enums';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  actionUrl: string | null;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
  } | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('unread');
  const router = useRouter();

  // Fetch notifications on component mount and when active tab changes
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const status = activeTab === 'unread' ? 'unread' : undefined;
        const response = await getNotifications(status);
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [activeTab]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // If the notification has an action URL, navigate to it
      if (notification.actionUrl) {
        // Mark as read first
        if (notification.status === 'unread') {
          await markAsRead(notification.id);
        }
        router.push(notification.actionUrl);
        return;
      }

      // Otherwise just mark it as read
      if (notification.status === 'unread') {
        await markAsRead(notification.id);
        
        // Update the local state
        setNotifications(prev => 
          prev.map(n => 
            n.id === notification.id 
              ? { ...n, status: 'read' as NotificationStatus } 
              : n
          )
        );
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      
      // Update the local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, status: 'read' as NotificationStatus }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return '❤️';
      case 'message':
        return '💬';
      case 'community_invite':
      case 'community_join':
      case 'community_post':
      case 'community_comment':
        return '👥';
      case 'event_invite':
      case 'event_reminder':
      case 'event_update':
      case 'event_cancelled':
        return '📅';
      case 'profile_like':
        return '👍';
      case 'reaction':
        return '😀';
      case 'system':
      default:
        return '🔔';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If the notification is from today, show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the notification is from within the last 7 days, show the day name
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    if (date > sevenDaysAgo) {
      return date.toLocaleDateString([], { weekday: 'long' });
    }
    
    // Otherwise show the date
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {activeTab === 'unread' && notifications.some(n => n.status === 'unread') && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-primary hover:underline text-sm"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex mb-4 border-b">
        <button
          className={`px-4 py-2 ${
            activeTab === 'unread'
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('unread')}
        >
          Unread
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === 'all'
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-gray-500'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="spinner">Loading...</div>
        </div>
      )}

      {/* Empty state */}
      {!loading && notifications.length === 0 && (
        <div className="text-center py-10">
          <div className="text-4xl mb-2">🔔</div>
          <h2 className="text-xl font-semibold mb-2">No notifications</h2>
          <p className="text-gray-500">
            {activeTab === 'unread'
              ? "You're all caught up! No unread notifications."
              : "You don't have any notifications yet."}
          </p>
        </div>
      )}

      {/* Notifications list */}
      {!loading && notifications.length > 0 && (
        <ul className="space-y-2">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                notification.status === 'unread' ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <div className="flex">
                <div className="mr-4 text-xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className={`font-medium ${notification.status === 'unread' ? 'font-semibold' : ''}`}>
                      {notification.title}
                    </h3>
                    <span className="text-gray-500 text-sm">
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.content}</p>
                  {notification.actionUrl && (
                    <div className="mt-2">
                      <span className="text-primary text-sm hover:underline">
                        View details
                      </span>
                    </div>
                  )}
                </div>
                {notification.status === 'unread' && (
                  <div className="ml-2 w-2 h-2 rounded-full bg-primary self-start mt-2"></div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
