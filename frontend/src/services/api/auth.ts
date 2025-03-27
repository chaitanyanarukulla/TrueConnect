// Authentication service to handle all auth-related API calls
import logger from '@/utils/logger';

// Create a specialized auth logger instance
const authLogger = logger.createContextLogger('Auth');

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
    // Log the registration attempt (without sensitive data)
    authLogger.info(`Registration attempt for: ${data.email}`, {
      data: { email: data.email, name: data.name }
    });
    
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      // Log the API response
      logger.apiResponse('POST', `${API_URL}/auth/register`, response.status, 
        response.ok ? { success: true } : { error: result.error }
      );
      
      if (!response.ok) {
        const errorMessage = result.error?.message || 'Registration failed';
        authLogger.error(`Registration failed: ${errorMessage}`, {
          status: response.status,
          error: result.error
        });
        throw new Error(errorMessage);
      }
      
      authLogger.success(`User registered successfully: ${data.email}`);
      return result;
    } catch (error) {
      authLogger.error(`Registration error: ${error.message}`, { error });
      throw error;
    }
  },
  
  /**
   * Login a user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Log the login attempt (without password)
    authLogger.info(`Login attempt for: ${credentials.email}`);
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const result = await response.json();
      
      // Log the API response
      logger.apiResponse('POST', `${API_URL}/auth/login`, response.status, 
        response.ok ? { success: true } : { error: result.error }
      );
      
      if (!response.ok) {
        const errorMessage = result.error?.message || 'Login failed';
        authLogger.error(`Login failed: ${errorMessage}`, {
          status: response.status,
          error: result.error
        });
        throw new Error(errorMessage);
      }
      
      authLogger.success(`User logged in successfully: ${credentials.email}`);
      return result;
    } catch (error) {
      authLogger.error(`Login error: ${error.message}`, { error });
      throw error;
    }
  },
  
  /**
   * Refresh the access token
   */
  async refreshToken(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    authLogger.debug(`Attempting to refresh token for user: ${userId}`);
    
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, refreshToken }),
      });
      
      const result = await response.json();
      
      // Log the API response
      logger.apiResponse('POST', `${API_URL}/auth/refresh`, response.status, 
        response.ok ? { success: true } : { error: result.error }
      );
      
      if (!response.ok) {
        const errorMessage = result.error?.message || 'Token refresh failed';
        authLogger.error(`Token refresh failed: ${errorMessage}`, {
          status: response.status,
          userId
        });
        throw new Error(errorMessage);
      }
      
      authLogger.success(`Token refreshed successfully for user: ${userId}`);
      return result;
    } catch (error) {
      authLogger.error(`Token refresh error: ${error.message}`, { error, userId });
      throw error;
    }
  },
  
  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<any> {
    authLogger.debug('Fetching current user data');
    
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      authLogger.warn('getCurrentUser called with no token in storage');
      throw new Error('No token found');
    }
    
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      // Log the API response
      logger.apiResponse('GET', `${API_URL}/auth/me`, response.status, 
        response.ok ? { success: true } : { error: result.error }
      );
      
      if (!response.ok) {
        const errorMessage = result.error?.message || 'Failed to get user';
        authLogger.error(`Failed to get current user: ${errorMessage}`, {
          status: response.status,
          error: result.error
        });
        throw new Error(errorMessage);
      }
      
      authLogger.debug('Current user data fetched successfully');
      return result;
    } catch (error) {
      authLogger.error(`Get current user error: ${error.message}`, { error });
      throw error;
    }
  },
  
  /**
   * Store authentication data in localStorage
   */
  storeAuthData(data: AuthResponse): void {
    authLogger.debug('Storing authentication data in localStorage');
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    authLogger.debug('Authentication data stored successfully');
  },
  
  /**
   * Clear authentication data from localStorage
   */
  clearAuthData(): void {
    authLogger.debug('Clearing authentication data from localStorage');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    authLogger.debug('Authentication data cleared successfully');
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const isAuth = !!localStorage.getItem('accessToken');
    authLogger.debug(`Authentication check result: ${isAuth}`);
    return isAuth;
  },
};
