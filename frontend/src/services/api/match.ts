// Match service for interacting with the matching API

export interface MatchData {
  matchId: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    bio?: string;
    location?: string;
    interests?: string[];
    lookingFor?: string;
    occupation?: string;
    education?: string;
  };
  compatibilityScore: {
    overall: number;
    interests: number;
    preferences: number;
    location: number;
  };
  isSuperLike: boolean;
  isRead: boolean;
}

export interface PotentialMatchData {
  id: string;
  name: string;
  profilePicture?: string;
  bio?: string;
  location?: string;
  interests?: string[];
  lookingFor?: string;
  occupation?: string;
  education?: string;
}

export enum MatchAction {
  LIKE = 'like',
  PASS = 'pass',
}

interface CreateMatchData {
  targetUserId: string;
  action: MatchAction;
  isSuperLike?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const matchService = {
  /**
   * Get all matches for the current user
   */
  async getUserMatches(): Promise<MatchData[]> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_URL}/matches`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get matches');
    }
    
    return await response.json();
  },
  
  /**
   * Get potential matches for the current user
   */
  async getPotentialMatches(limit: number = 10): Promise<PotentialMatchData[]> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_URL}/matches/potential?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get potential matches');
    }
    
    return await response.json();
  },
  
  /**
   * Create a match (like or pass)
   */
  async createMatch(data: CreateMatchData): Promise<any> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_URL}/matches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create match');
    }
    
    return await response.json();
  },
  
  /**
   * Check if users are matched
   */
  async checkMatchStatus(targetUserId: string): Promise<{isMatched: boolean}> {
    const allMatches = await this.getUserMatches();
    const isMatched = allMatches.some(match => match.user.id === targetUserId);
    
    return { isMatched };
  }
};
