import { storage } from '@/utils/storage';
import { apiClient } from './apiClient';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
}

export const authService = {
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', userData);
      const { accessToken, refreshToken } = response.data;
      
      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      
      return response.data;
    } catch (error: any) {
      console.log('Registration failed:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      const { accessToken, refreshToken } = response.data;
      
      await storage.setItem('accessToken', accessToken);
      await storage.setItem('refreshToken', refreshToken);
      
      return response.data;
    } catch (error: any) {
      console.log('Login failed:', error.response?.status, error.response?.data);
      throw error;
    }
  },

  sendVerification: async (userData: { email: string }) => {
    const response = await apiClient.post('/auth/send-verification-code', userData);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const refresh = await storage.getItem('refreshToken');
    
    if (!refresh) {
      throw new Error('No refresh token available');
    }
    
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', { refreshToken: refresh });
    const { accessToken, refreshToken: newRefresh } = response.data;
    
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', newRefresh);
    
    return response.data;
  },

  logout: async () => {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
  },

  getAccessToken: async (): Promise<string | null> => {
    try {
      const token = await storage.getItem('accessToken');
      
      // If no token found, try again after a short delay (race condition fix)
      if (!token) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return await storage.getItem('accessToken');
      }
      
      return token;
    } catch (error) {
      console.warn('Error retrieving access token:', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    return await storage.getItem('refreshToken');
  },

  // Send a verification code to the given email
  sendVerificationCode: async (email: string) => {
    const response = await apiClient.post('/auth/send-verification-code', { email });
    return response.data;
  },

  // Verify a received code given email and code
  verifyCode: async (email: string, code: number) => {
    const response = await apiClient.post('/auth/verify-code', { email, code });
    return response.data;
  },

  // Check if an email is already registered
  exists: async (email: string) => {
    const response = await apiClient.get('/auth/exists', { params: { email } });
    return response.data;
  },

  // Forgot password - send reset code
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with new password
  resetPassword: async (email: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },
};