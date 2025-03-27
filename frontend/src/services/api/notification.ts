import axios from 'axios';
import { getAuthHeaders } from '../../lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (status?: string, page: number = 1, limit: number = 20) => {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await axios.get(
    `${API_URL}/notifications?${params.toString()}`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async () => {
  const response = await axios.get(
    `${API_URL}/notifications/unread-count`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get a specific notification
 */
export const getNotification = async (id: string) => {
  const response = await axios.get(
    `${API_URL}/notifications/${id}`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (id: string) => {
  const response = await axios.patch(
    `${API_URL}/notifications/${id}/read`,
    {},
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Archive a notification
 */
export const archiveNotification = async (id: string) => {
  const response = await axios.patch(
    `${API_URL}/notifications/${id}/archive`,
    {},
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  const response = await axios.post(
    `${API_URL}/notifications/mark-all-read`,
    {},
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update a notification (status)
 */
export const updateNotification = async (id: string, data: { status: string }) => {
  const response = await axios.patch(
    `${API_URL}/notifications/${id}`,
    data,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

// Notification Preferences

/**
 * Get all notification preferences
 */
export const getNotificationPreferences = async () => {
  const response = await axios.get(
    `${API_URL}/notifications/preferences`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get a specific notification preference by type
 */
export const getNotificationPreference = async (type: string) => {
  const response = await axios.get(
    `${API_URL}/notifications/preferences/${type}`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Create a notification preference
 */
export const createNotificationPreference = async (data: {
  type: string;
  enabled?: boolean;
  channels?: string[];
  realTime?: boolean;
  includeInDigest?: boolean;
}) => {
  const response = await axios.post(
    `${API_URL}/notifications/preferences`,
    data,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update a notification preference by ID
 */
export const updateNotificationPreference = async (
  id: string,
  data: {
    enabled?: boolean;
    channels?: string[];
    realTime?: boolean;
    includeInDigest?: boolean;
  }
) => {
  const response = await axios.patch(
    `${API_URL}/notifications/preferences/${id}`,
    data,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update a notification preference by type
 */
export const updateNotificationPreferenceByType = async (
  type: string,
  data: {
    enabled?: boolean;
    channels?: string[];
    realTime?: boolean;
    includeInDigest?: boolean;
  }
) => {
  const response = await axios.patch(
    `${API_URL}/notifications/preferences/type/${type}`,
    data,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Reset all notification preferences to defaults
 */
export const resetNotificationPreferences = async () => {
  const response = await axios.post(
    `${API_URL}/notifications/preferences/reset`,
    {},
    { headers: await getAuthHeaders() }
  );
  return response.data;
};
