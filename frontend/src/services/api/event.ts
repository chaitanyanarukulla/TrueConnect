import { authService } from './auth';
import { CreateEventDto, EventStatus, EventType } from '../../modules/communities/dto/create-event.dto';

// Helper function to get the auth header
const getAuthHeader = async () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface EventAttendee {
  id: string;
  userId: string;
  eventId: string;
  status: 'going' | 'interested' | 'not_going' | 'waitlist';
  isOrganizer: boolean;
  note?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  startTime: string;
  endTime: string;
  location?: string;
  virtualMeetingUrl?: string;
  imageUrl?: string;
  communityId: string;
  creatorId: string;
  attendeeLimit: number;
  attendeeCount: number;
  isPrivate: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface EventDiscoveryOptions {
  status?: EventStatus;
  type?: EventType;
  tags?: string | string[];
  upcoming?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

const eventService = {
  async discoverEvents(options: EventDiscoveryOptions = {}): Promise<PaginatedResponse<Event>> {
    const authHeader = await getAuthHeader();
    
    const params: Record<string, string> = {};
    if (options.status) params.status = options.status;
    if (options.type) params.type = options.type;
    if (options.upcoming !== undefined) params.upcoming = options.upcoming.toString();
    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    if (options.limit) params.limit = options.limit.toString();
    if (options.page) params.page = options.page.toString();
    
    // Convert tags array to comma-separated string if needed
    if (options.tags) {
      params.tags = Array.isArray(options.tags) ? options.tags.join(',') : options.tags;
    }
    
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/events/discover${queryString ? `?${queryString}` : ''}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to discover events');
    }
    
    return data;
  },
  async getEvents(
    communityId: string,
    options?: {
      status?: EventStatus;
      upcoming?: boolean;
      page?: number;
      limit?: number;
    }
  ): Promise<Event[]> {
    const authHeader = await getAuthHeader();
    
    const params: Record<string, string> = {};
    if (options?.status) params.status = options.status;
    if (options?.upcoming !== undefined) params.upcoming = options.upcoming.toString();
    if (options?.page) params.page = options.page.toString();
    if (options?.limit) params.limit = options.limit.toString();
    
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/communities/${communityId}/events${queryString ? `?${queryString}` : ''}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get events');
    }
    
    return data;
  },
  
  async getEvent(communityId: string, eventId: string): Promise<Event> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get event');
    }
    
    return data;
  },
  
  async createEvent(communityId: string, eventData: CreateEventDto): Promise<Event> {
    const authHeader = await getAuthHeader();
    
    // Make sure the communityId in the URL matches the one in the DTO
    const data = {
      ...eventData,
      communityId,
    };
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create event');
    }
    
    return result;
  },
  
  async updateEvent(communityId: string, eventId: string, updateData: Partial<CreateEventDto>): Promise<Event> {
    const authHeader = await getAuthHeader();
    
    // If communityId is provided, ensure it matches the path communityId
    if (updateData.communityId && updateData.communityId !== communityId) {
      throw new Error('Community ID mismatch');
    }
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}`, {
      method: 'PATCH',
      headers: authHeader,
      body: JSON.stringify(updateData),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update event');
    }
    
    return result;
  },
  
  async deleteEvent(communityId: string, eventId: string): Promise<{ success: boolean }> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete event');
    }
    
    return result;
  },
  
  async getAttendees(communityId: string, eventId: string): Promise<EventAttendee[]> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}/attendees`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get attendees');
    }
    
    return data;
  },
  
  async rsvp(
    communityId: string, 
    eventId: string, 
    status: 'going' | 'maybe' | 'not_going'
  ): Promise<EventAttendee> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}/rsvp`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify({ status }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to RSVP for event');
    }
    
    return result;
  },
  
  async cancelRsvp(communityId: string, eventId: string): Promise<{ success: boolean }> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}/rsvp`, {
      method: 'DELETE',
      headers: authHeader,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to cancel RSVP');
    }
    
    return result;
  },
  
  async getUserRsvp(communityId: string, eventId: string): Promise<EventAttendee | null> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}/rsvp`, {
      headers: authHeader,
    });
    
    if (response.status === 404) {
      return null;
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user RSVP');
    }
    
    return data;
  },
  
  async publishEvent(communityId: string, eventId: string): Promise<Event> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}/publish`, {
      method: 'PATCH',
      headers: authHeader,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to publish event');
    }
    
    return result;
  },
  
  async cancelEvent(communityId: string, eventId: string): Promise<Event> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/events/${eventId}/cancel`, {
      method: 'PATCH',
      headers: authHeader,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to cancel event');
    }
    
    return result;
  },
};

export default eventService;
