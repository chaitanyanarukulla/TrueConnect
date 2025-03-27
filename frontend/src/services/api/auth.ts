// Authentication service to handle all auth-related API calls

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  birthdate: string;
  gender: string;
  acceptTerms: boolean;
}

interface AuthResponse {
  user: any;
  accessToken: string;
  refreshToken: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Registration failed');
    }
    
    return result;
  },
  
  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Login failed');
    }
    
    return result;
  },
  
  /**
   * Refresh the access token
   */
  async refreshToken(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, refreshToken }),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Token refresh failed');
    }
    
    return result;
  },
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<any> {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      throw new Error('No token found');
    }
    
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error?.message || 'Failed to get user');
    }
    
    return result;
  },
  
  /**
   * Store authentication data in localStorage
   */
  storeAuthData(data: AuthResponse): void {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  },
  
  /**
   * Clear authentication data from localStorage
   */
  clearAuthData(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
