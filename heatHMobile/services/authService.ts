import { apiClient } from './apiClient';
import { storage } from '@/utils/storage';

// Types matching backend exactly
interface LoginRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

interface RefreshTokenRequest {
  refreshToken: string;
}

export const authService = {
  // Login method matching backend API exactly
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log('🔑 AuthService: Starting login with credentials:', credentials);
    
    // Make direct API call (no auth headers needed for login)
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://35.198.76.72:8080'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔑 AuthService: Login failed:', response.status, errorText);
      throw new Error(`Login failed: ${response.status}`);
    }

    const data: AuthResponse = await response.json();
    console.log('🔑 AuthService: Login response:', data);
    
    // Store tokens (matches frontend pattern)
    await storage.setItem('accessToken', data.accessToken);
    await storage.setItem('refreshToken', data.refreshToken);
    console.log('🔑 AuthService: Tokens stored in storage');
    
    return data;
  },

  // Register method matching backend API exactly
  register: async (userData: any): Promise<AuthResponse> => {
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://35.198.76.72:8080'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Registration failed: ${response.status} - ${errorText}`);
    }

    const data: AuthResponse = await response.json();
    
    // Store tokens (matches frontend pattern)
    await storage.setItem('accessToken', data.accessToken);
    await storage.setItem('refreshToken', data.refreshToken);
    
    return data;
  },

  // Refresh token method matching backend API exactly
  refreshToken: async (): Promise<AuthResponse> => {
    const refreshToken = await storage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const request: RefreshTokenRequest = { refreshToken };
    
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'http://35.198.76.72:8080'}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔑 AuthService: Token refresh failed:', response.status, errorText);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data: AuthResponse = await response.json();
    
    // Store new tokens (matches frontend pattern)
    await storage.setItem('accessToken', data.accessToken);
    await storage.setItem('refreshToken', data.refreshToken);
    
    return data;
  },

  sendVerificationCode: async (email: string) => {
    const response = await apiClient.post('/auth/send-verification-code', { email });
    return response;
  },

  verifyCode: async (email: string, code: string) => {
    const response = await apiClient.post('/auth/verify-code', { email, code });
    return response;
  },

  checkEmailExists: async (email: string) => {
    const response = await apiClient.get(`/auth/exists?email=${email}`);
    return response;
  },

  resetPassword: async (request: any) => {
    const response = await apiClient.post('/auth/reset-password', request);
    return response;
  },

  logout: async () => {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
  },

  getAccessToken: async () => {
    return await storage.getItem('accessToken');
  },

  getRefreshToken: async () => {
    return await storage.getItem('refreshToken');
  },

  // Legacy methods for compatibility
  signIn: async (email: string, password: string) => {
    return await authService.login({ username: email, password });
  },
  
  signUp: async (email: string, password: string) => {
    return await authService.register({ username: email, password });
  },
};


