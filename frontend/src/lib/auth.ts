/**
 * Authentication utilities for handling tokens
 */
import { AxiosRequestHeaders } from 'axios';

/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('accessToken');
};

/**
 * Get the refresh token from localStorage
 * @returns The refresh token or null if not found
 */
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('refreshToken');
};

/**
 * Store authentication tokens in localStorage
 * @param accessToken JWT access token
 * @param refreshToken JWT refresh token
 */
export const storeTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

/**
 * Clear authentication tokens from localStorage
 */
export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Check if user is authenticated
 * @returns Boolean indicating authentication status
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Get authentication headers with Bearer token
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = getAuthToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
};

/**
 * Get user data from localStorage
 * @returns User data object or null if not found
 */
export const getUser = (): any | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const userJson = localStorage.getItem('user');
  if (!userJson) {
    return null;
  }
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Failed to parse user data from localStorage', error);
    return null;
  }
};
