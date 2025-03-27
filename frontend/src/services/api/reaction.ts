import { ReactionType } from '../../types/reaction';

// Helper function to get the auth header
const getAuthHeader = async () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const reactionService = {
  /**
   * Create or update a reaction to a post or comment
   */
  async createReaction(entityId: string, entityType: 'post' | 'comment', type: ReactionType) {
    const authHeader = await getAuthHeader();
    
    try {
      const response = await fetch(`${API_URL}/reactions`, {
        method: 'POST',
        headers: authHeader,
        body: JSON.stringify({
          entityId,
          entityType,
          type,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create reaction');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating reaction:', error);
      throw error;
    }
  },

  /**
   * Get all reactions for a post or comment
   */
  async getReactions(entityId: string, entityType: 'post' | 'comment') {
    const authHeader = await getAuthHeader();
    
    try {
      const response = await fetch(`${API_URL}/reactions/${entityType}/${entityId}`, {
        headers: authHeader,
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reactions');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching reactions:', error);
      throw error;
    }
  },

  /**
   * Get the current user's reaction to a post or comment
   */
  async getUserReaction(entityId: string, entityType: 'post' | 'comment') {
    const authHeader = await getAuthHeader();
    
    try {
      const response = await fetch(`${API_URL}/reactions/user/${entityType}/${entityId}`, {
        headers: authHeader,
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user reaction');
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching user reaction:', error);
      throw error;
    }
  },

  /**
   * Remove a reaction from a post or comment
   */
  async removeReaction(entityId: string, entityType: 'post' | 'comment') {
    const authHeader = await getAuthHeader();
    
    try {
      const response = await fetch(`${API_URL}/reactions/${entityType}/${entityId}`, {
        method: 'DELETE',
        headers: authHeader,
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to remove reaction');
      }
      
      return data;
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  },
};

export default reactionService;
