import { authService } from './auth';

// Define interface here to avoid import issues
export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
  mediaUrls?: string[];
}

// Helper function to get the auth header
const getAuthHeader = async () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Comment {
  id: string;
  content: string;
  status: string;
  postId: string;
  authorId: string;
  author?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  parentId?: string;
  reactionCount: number;
  replyCount: number;
  mediaUrls?: string[];
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
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

const commentService = {
  async getComments(
    communityId: string,
    postId: string,
    page = 1,
    limit = 20,
    parentId?: string | null
  ): Promise<PaginatedResponse<Comment>> {
    const authHeader = await getAuthHeader();
    
    const params: any = { page, limit };
    if (parentId !== undefined) {
      params.parentId = parentId === null ? 'null' : parentId;
    }
    
    const response = await fetch(
      `${API_URL}/communities/${communityId}/posts/${postId}/comments?${new URLSearchParams(params).toString()}`,
      {
        headers: authHeader,
      }
    );
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get comments');
    }
    
    return data;
  },
  
  async getComment(communityId: string, postId: string, commentId: string): Promise<Comment> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(
      `${API_URL}/communities/${communityId}/posts/${postId}/comments/${commentId}`,
      {
        headers: authHeader,
      }
    );
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get comment');
    }
    
    return data;
  },
  
  async createComment(
    communityId: string,
    postId: string,
    content: string,
    parentId?: string,
    mediaUrls?: string[]
  ): Promise<Comment> {
    const authHeader = await getAuthHeader();
    
    const commentData: CreateCommentDto = {
      content,
      postId,
      ...(parentId && { parentId }),
      ...(mediaUrls && { mediaUrls }),
    };
    
    const response = await fetch(
      `${API_URL}/communities/${communityId}/posts/${postId}/comments`,
      {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify(commentData),
      }
    );
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create comment');
    }
    
    return result;
  },
  
  async updateComment(
    communityId: string,
    postId: string,
    commentId: string,
    content: string
  ): Promise<Comment> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(
      `${API_URL}/communities/${communityId}/posts/${postId}/comments/${commentId}`,
      {
        method: 'PATCH',
        headers: authHeader,
        body: JSON.stringify({ content }),
      }
    );
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update comment');
    }
    
    return result;
  },
  
  async deleteComment(
    communityId: string,
    postId: string,
    commentId: string
  ): Promise<{ success: boolean }> {
    const authHeader = await getAuthHeader();
    
    const response = await fetch(
      `${API_URL}/communities/${communityId}/posts/${postId}/comments/${commentId}`,
      {
        method: 'DELETE',
        headers: authHeader,
      }
    );
    
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete comment');
    }
    
    return result;
  },
  
  async getReplies(
    communityId: string,
    postId: string,
    commentId: string,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Comment>> {
    const authHeader = await getAuthHeader();
    
    const params: Record<string, string> = { 
      page: page.toString(), 
      limit: limit.toString() 
    };
    
    const response = await fetch(
      `${API_URL}/communities/${communityId}/posts/${postId}/comments/${commentId}/replies?${new URLSearchParams(params).toString()}`,
      {
        headers: authHeader,
      }
    );
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get replies');
    }
    
    return data;
  },
};

export default commentService;
