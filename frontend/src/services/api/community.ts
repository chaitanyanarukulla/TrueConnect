import { CreateCommunityDto, 
  CommunityCategory,
  CommunitySettings 
} from '../../modules/communities/dto/create-community.dto';
import { getAuthToken } from '@/lib/auth';

// Helper function to get the auth header
const getAuthHeader = async (): Promise<Record<string, string>> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Authentication required');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Community {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  coverImageUrl?: string;
  isPrivate: boolean;
  category?: CommunityCategory;
  tags?: string[];
  memberCount: number;
  creatorId: string;
  creator?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: 'admin' | 'moderator' | 'member';
  isActive: boolean;
  notifications: boolean;
  joinedAt: string;
  lastVisitedAt?: string;
  customTitle?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
}

// Re-export types from the DTO for easier usage elsewhere
export type { CommunityCategory, CommunitySettings };

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CommunityQueryParams {
  page?: number;
  limit?: number;
  filter?: string;
  category?: CommunityCategory | '';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const communityService = {
  async getCommunities(
    page = 1,
    limit = 10,
    filter?: string,
    category?: CommunityCategory | ''
  ): Promise<PaginatedResponse<Community>> {
    const authHeader = await getAuthHeader();
    
    const params: CommunityQueryParams = { page, limit };
    if (filter) params.filter = filter;
    if (category) params.category = category;
    
    const response = await fetch(`${API_URL}/communities?${new URLSearchParams(params as Record<string, string>).toString()}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get communities');
    }
    
    return data;
  },
  
  async getMyCommunities(
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Community>> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/my?page=${page}&limit=${limit}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get my communities');
    }
    
    return data;
  },
  
  async getCommunity(id: string): Promise<Community> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${id}`, {
      headers: authHeader,
    });
    
    const data = await response.json() as ApiResponse<Community>;
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get community');
    }
    
    return data.data;
  },
  
  async createCommunity(data: CreateCommunityDto): Promise<Community> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(data),
    });
    
    const result = await response.json() as ApiResponse<Community>;
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create community');
    }
    
    return result.data;
  },
  
  async updateCommunity(id: string, data: Partial<CreateCommunityDto>): Promise<Community> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${id}`, {
      method: 'PATCH',
      headers: authHeader,
      body: JSON.stringify(data),
    });
    
    const result = await response.json() as ApiResponse<Community>;
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update community');
    }
    
    return result.data;
  },
  
  async deleteCommunity(id: string): Promise<{ success: boolean }> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${id}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    
    const result = await response.json() as ApiResponse<{ success: boolean }>;
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete community');
    }
    
    return result.data;
  },
  
  async joinCommunity(id: string): Promise<CommunityMember> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${id}/join`, {
      method: 'POST',
      headers: authHeader,
    });
    
    const result = await response.json() as ApiResponse<CommunityMember>;
    if (!response.ok) {
      throw new Error(result.message || 'Failed to join community');
    }
    
    return result.data;
  },
  
  async leaveCommunity(id: string): Promise<{ success: boolean }> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${id}/leave`, {
      method: 'POST',
      headers: authHeader,
    });
    
    const result = await response.json() as ApiResponse<{ success: boolean }>;
    if (!response.ok) {
      throw new Error(result.message || 'Failed to leave community');
    }
    
    return result.data;
  },
  
  async getCommunityMembers(
    id: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<CommunityMember>> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${id}/members?page=${page}&limit=${limit}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get community members');
    }
    
    return data;
  },
  
  async updateMemberRole(
    communityId: string,
    memberId: string,
    role: 'admin' | 'moderator' | 'member'
  ): Promise<CommunityMember> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/members/${memberId}/role`, {
      method: 'PATCH',
      headers: authHeader,
      body: JSON.stringify({ role }),
    });
    
    const result = await response.json() as ApiResponse<CommunityMember>;
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update member role');
    }
    
    return result.data;
  },
};

export default communityService;
