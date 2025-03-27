import { authService } from './auth';
import { CreatePostDto } from '../../modules/communities/dto/create-post.dto';

// Helper function to get the auth header
const getAuthHeader = async () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Post {
  id: string;
  type: string;
  content: string;
  status: string;
  mediaUrls?: string[];
  linkUrl?: string;
  linkTitle?: string;
  linkDescription?: string;
  linkImageUrl?: string;
  communityId: string;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  viewCount: number;
  commentCount: number;
  reactionCount: number;
  shareCount: number;
  metadata?: any;
  tags?: string[];
  pollOptions?: any;
  isAnnouncement: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
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

const postService = {
  async getPosts(
    communityId: string,
    page = 1,
    limit = 20,
    filter?: string
  ): Promise<PaginatedResponse<Post>> {
    const authHeader = await getAuthHeader();
    
    const params: any = { page, limit };
    if (filter) params.filter = filter;
    
    const response = await fetch(`${API_URL}/communities/${communityId}/posts?${new URLSearchParams(params).toString()}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get posts');
    }
    
    return data;
  },
  
  async getPost(communityId: string, postId: string): Promise<Post> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/posts/${postId}`, {
      headers: authHeader,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get post');
    }
    
    return data;
  },
  
  async createPost(communityId: string, data: CreatePostDto): Promise<Post> {
    const authHeader = await getAuthHeader();
    
    // Make sure the communityId in the URL matches the one in the DTO
    const postData = {
      ...data,
      communityId,
    };
    
    const response = await fetch(`${API_URL}/communities/${communityId}/posts`, {
      method: 'POST',
      headers: authHeader,
      body: JSON.stringify(postData),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create post');
    }
    
    return result;
  },
  
  async updatePost(communityId: string, postId: string, data: Partial<Post>): Promise<Post> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/posts/${postId}`, {
      method: 'PATCH',
      headers: authHeader,
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update post');
    }
    
    return result;
  },
  
  async deletePost(communityId: string, postId: string): Promise<{ success: boolean }> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/posts/${postId}`, {
      method: 'DELETE',
      headers: authHeader,
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete post');
    }
    
    return result;
  },
  
  async pinPost(communityId: string, postId: string, isPinned: boolean): Promise<Post> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/posts/${postId}/pin`, {
      method: 'PATCH',
      headers: authHeader,
      body: JSON.stringify({ isPinned }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to pin/unpin post');
    }
    
    return result;
  },
  
  async markAsAnnouncement(communityId: string, postId: string, isAnnouncement: boolean): Promise<Post> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(`${API_URL}/communities/${communityId}/posts/${postId}/announcement`, {
      method: 'PATCH',
      headers: authHeader,
      body: JSON.stringify({ isAnnouncement }),
    });
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to mark post as announcement');
    }
    
    return result;
  },
};

export default postService;
