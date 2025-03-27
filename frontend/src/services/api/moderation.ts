import axios from 'axios';
import { getAuthHeaders } from '../../lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Report content (post, comment, user, etc.)
 */
export const reportContent = async (
  reportedId: string,
  type: string,
  reason: string,
  description?: string
) => {
  const response = await axios.post(
    `${API_URL}/moderation/reports`,
    {
      reportedId,
      type,
      reason,
      description
    },
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Create a report with the new report format 
 * This provides a more structured interface for the ReportModal component
 */
export const createReport = async (data: {
  contentId: string; 
  contentType: 'post' | 'comment' | 'profile' | 'message' | 'community' | 'event';
  reason: string;
  details?: string;
  targetUserId?: string;
}) => {
  const response = await axios.post(
    `${API_URL}/moderation/reports`,
    {
      reportedId: data.contentId,
      type: data.contentType,
      reason: data.reason,
      description: data.details,
      targetUserId: data.targetUserId
    },
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all reports created by the authenticated user
 */
export const getUserReports = async () => {
  const response = await axios.get(
    `${API_URL}/moderation/reports`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get a specific report by ID
 */
export const getReport = async (id: string) => {
  const response = await axios.get(
    `${API_URL}/moderation/reports/${id}`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get reports and moderation info for specific content
 */
export const getContentModerationInfo = async (type: string, id: string) => {
  const response = await axios.get(
    `${API_URL}/moderation/for-content/${type}/${id}`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

// Admin-specific endpoints

/**
 * Update report status (admin only)
 */
export const updateReport = async (
  id: string,
  updates: {
    status?: string;
    action?: string;
    adminNotes?: string;
  }
) => {
  const response = await axios.patch(
    `${API_URL}/moderation/reports/${id}`,
    updates,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get all content moderation entries (admin only)
 */
export const getContentModerations = async (
  filters: {
    status?: string;
    contentType?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const params = new URLSearchParams();
  
  if (filters.status) params.append('status', filters.status);
  if (filters.contentType) params.append('contentType', filters.contentType);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const response = await axios.get(
    `${API_URL}/moderation/content?${params.toString()}`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Get a specific content moderation entry (admin only)
 */
export const getContentModeration = async (id: string) => {
  const response = await axios.get(
    `${API_URL}/moderation/content/${id}`,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};

/**
 * Update content moderation status (admin only)
 */
export const updateContentModeration = async (
  id: string,
  updates: {
    status?: string;
    action?: string;
    moderationNotes?: string;
    isAutomated?: boolean;
    detectedIssues?: string[];
    confidenceScore?: number;
  }
) => {
  const response = await axios.patch(
    `${API_URL}/moderation/content/${id}`,
    updates,
    { headers: await getAuthHeaders() }
  );
  return response.data;
};
