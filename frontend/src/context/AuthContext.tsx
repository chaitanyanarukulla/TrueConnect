"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<{ accessToken: string; refreshToken: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Import auth utilities
        const { getUser, getAuthToken, isAuthenticated } = await import("@/lib/auth");
        
        // Check if user is authenticated
        if (isAuthenticated()) {
          const userData = getUser();
          if (userData) {
            setUser(userData);
            console.log("Auth initialized with user:", userData.id);
          } else {
            console.warn("Token exists but no user data found");
          }
        } else {
          console.log("No authentication found during initialization");
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear potentially corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { authService } = await import("@/services/api/auth");
      const result = await authService.login({ email, password });
      
      // Store auth data
      authService.storeAuthData(result);
      setUser(result.user);
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const { authService } = await import("@/services/api/auth");
      const result = await authService.register(userData);
      
      // Store auth data
      authService.storeAuthData(result);
      setUser(result.user);
      
      // Redirect to dashboard or profile completion
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    // Clear auth data
    const clearAuthData = async () => {
      const { authService } = await import("@/services/api/auth");
      authService.clearAuthData();
    };
    
    clearAuthData();
    setUser(null);
    router.push('/');
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const userId = user?.id;
      const refreshTokenValue = localStorage.getItem('refreshToken');
      
      if (!userId || !refreshTokenValue) {
        throw new Error('No refresh token available');
      }
      
      const { authService } = await import("@/services/api/auth");
      const result = await authService.refreshToken(userId, refreshTokenValue);
      
      // Update tokens in localStorage
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      
      return result;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, log out the user
      logout();
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
