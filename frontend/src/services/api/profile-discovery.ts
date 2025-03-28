import { apiEndpoint } from '@/config';

// Define the user profile type
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance?: number;
  bio?: string;
  interests?: string[];
  profilePicture?: string;
  relationshipType?: string; 
  occupation?: string;
  education?: string;
  lifestyle?: {
    smoking?: string;
    drinking?: string;
    diet?: string;
    exercise?: string;
  };
  personality?: string[];
  values?: string[];
  compatibilityScore?: {
    overall: number;
    interests: number;
    values: number;
    personality: number;
  };
  lastActive?: string;
}

// Define the location type
export interface Location {
  lat: number;
  lng: number;
  distance?: number;
}

// Define the profile discovery options
export interface ProfileDiscoveryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  gender?: string[];
  ageRange?: { min: number; max: number };
  location?: Location;
  relationshipType?: string[];
  lifestyle?: {
    smoking?: string[];
    drinking?: string[];
    diet?: string[];
    exercise?: string[];
  };
  personality?: string[];
  values?: string[];
}

// Define the profile discovery result
export interface ProfileDiscoveryResult {
  data: UserProfile[];
  meta: {
    total: number;
    pages: number;
    currentPage: number;
  };
}

// Define the like/unlike result
export interface LikeResult {
  success: boolean;
  match?: boolean;
  matchId?: string;
}

// Define the profile discovery service
const profileDiscoveryService = {
  // Discover profiles based on the provided options
  async discoverProfiles(options: ProfileDiscoveryOptions): Promise<ProfileDiscoveryResult> {
    try {
      // In a real app, this would make an API call
      // For now, we'll just return mock data
      return {
        data: mockProfiles,
        meta: {
          total: mockProfiles.length,
          pages: 1,
          currentPage: 1
        }
      };
    } catch (error) {
      console.error('Error discovering profiles:', error);
      throw error;
    }
  },

  // Like a profile
  async likeProfile(profileId: string): Promise<LikeResult> {
    try {
      // In a real app, this would make an API call
      return {
        success: true,
        match: Math.random() > 0.7 // 30% chance of match for demo
      };
    } catch (error) {
      console.error('Error liking profile:', error);
      throw error;
    }
  },

  // Unlike a profile
  async unlikeProfile(profileId: string): Promise<LikeResult> {
    try {
      // In a real app, this would make an API call
      return {
        success: true
      };
    } catch (error) {
      console.error('Error unliking profile:', error);
      throw error;
    }
  }
};

// Mock user profiles for testing
const mockProfiles: UserProfile[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    age: 28,
    location: 'San Francisco, CA',
    distance: 5,
    bio: 'Software engineer who loves hiking and photography.',
    interests: ['hiking', 'photography', 'coding', 'travel'],
    profilePicture: '/profiles/Designer (1).png',
    relationshipType: 'long-term',
    occupation: 'Software Engineer',
    education: 'Stanford University',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'social',
      diet: 'omnivore',
      exercise: 'regularly'
    },
    personality: ['Creative', 'Analytical', 'Ambitious'],
    values: ['Health', 'Learning', 'Career'],
    compatibilityScore: {
      overall: 0.85,
      interests: 0.8,
      values: 0.9,
      personality: 0.85
    },
    lastActive: '2023-10-15T14:30:00Z'
  },
  {
    id: '2',
    name: 'Jamie Smith',
    age: 26,
    location: 'Oakland, CA',
    distance: 12,
    bio: 'Artist and part-time barista. Love creating and exploring.',
    interests: ['art', 'coffee', 'museums', 'hiking'],
    profilePicture: '/profiles/Designer (2).png',
    relationshipType: 'casual',
    occupation: 'Artist & Barista',
    education: 'Art Institute',
    lifestyle: {
      smoking: 'occasional',
      drinking: 'social',
      diet: 'vegetarian',
      exercise: 'sometimes'
    },
    personality: ['Creative', 'Spontaneous', 'Relaxed'],
    values: ['Creativity', 'Freedom', 'Community'],
    compatibilityScore: {
      overall: 0.75,
      interests: 0.7,
      values: 0.6,
      personality: 0.95
    },
    lastActive: '2023-10-16T10:15:00Z'
  },
  {
    id: '3',
    name: 'Taylor Rivera',
    age: 30,
    location: 'San Jose, CA',
    distance: 35,
    bio: 'Marketing professional who loves yoga and cooking.',
    interests: ['yoga', 'cooking', 'reading', 'travel'],
    profilePicture: '/profiles/Designer (3).png',
    relationshipType: 'long-term',
    occupation: 'Marketing Manager',
    education: 'UC Berkeley',
    lifestyle: {
      smoking: 'non-smoker',
      drinking: 'rarely',
      diet: 'pescatarian',
      exercise: 'daily'
    },
    personality: ['Organized', 'Ambitious', 'Outgoing'],
    values: ['Health', 'Career', 'Family'],
    compatibilityScore: {
      overall: 0.82,
      interests: 0.75,
      values: 0.85,
      personality: 0.85
    },
    lastActive: '2023-10-16T20:45:00Z'
  }
];

export default profileDiscoveryService;
