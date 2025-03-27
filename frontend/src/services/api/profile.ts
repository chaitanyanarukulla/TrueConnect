// Profile service to handle all profile-related API calls

interface ProfileData {
  id: string;
  name: string;
  email: string;
  birthdate: string | Date;
  gender: string;
  location?: string;
  bio?: string;
  profilePicture?: string;
  interests?: string[];
  preferences?: {
    ageRange?: { min: number; max: number };
    distance?: number;
    genderPreferences?: string[];
  };
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    other?: string;
  };
  lookingFor?: string;
  occupation?: string;
  education?: string;
  privacySettings?: {
    showLocation?: boolean;
    showAge?: boolean;
    showLastActive?: boolean;
    showOnlineStatus?: boolean;
  };
  isVerified: boolean;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfileData {
  bio?: string;
  location?: string;
  gender?: string;
  interests?: string[];
  preferences?: {
    ageRange?: { min: number; max: number };
    distance?: number;
    genderPreferences?: string[];
  };
  socialMedia?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    other?: string;
  };
  lookingFor?: string;
  occupation?: string;
  education?: string;
  privacySettings?: {
    showLocation?: boolean;
    showAge?: boolean;
    showLastActive?: boolean;
    showOnlineStatus?: boolean;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const profileService = {
  /**
   * Get current user profile
   */
  async getCurrentProfile(): Promise<ProfileData> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_URL}/profiles/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to get profile');
    }
    
    return result;
  },
  
  /**
   * Get a profile by ID
   */
  async getProfileById(id: string): Promise<ProfileData> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_URL}/profiles/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to get profile');
    }
    
    return result;
  },
  
  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileData): Promise<ProfileData> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_URL}/profiles/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to update profile');
    }
    
    return result;
  },
  
  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<{ success: boolean; photoUrl: string }> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await fetch(`${API_URL}/profiles/me/photo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to upload photo');
    }
    
    return result;
  },
};
