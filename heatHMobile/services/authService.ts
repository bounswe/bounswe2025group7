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
    console.log('AuthService: Attempting registration to:', 'http://35.198.76.72:8080/api/auth/register');
    console.log('AuthService: Registration data:', { username: userData.username, password: '***' });
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    console.log('AuthService: Registration response received:', response);
    const { accessToken, refreshToken } = response;
    console.log('AuthService: Tokens received:', { accessToken: accessToken ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing' });
    
    // Store tokens in storage
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', refreshToken);
    console.log('AuthService: Tokens stored in storage');
    
    return response;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('AuthService: Attempting login to:', 'http://35.198.76.72:8080/api/auth/login');
    console.log('AuthService: Credentials:', { username: credentials.username, password: '***' });
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    console.log('AuthService: Response received:', response);
    const { accessToken, refreshToken } = response;
    console.log('AuthService: Tokens received:', { accessToken: accessToken ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing' });
    
    // Store tokens in storage
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', refreshToken);
    console.log('AuthService: Tokens stored in storage');
    
    return response;
  },

  sendVerification: async (userData: { email: string }) => {
    const response = await apiClient.post('/auth/send-verification-code', userData);
    return response;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    console.log('AuthService: Attempting token refresh');
    // For now, we'll need to get the refresh token from storage
    // This is a simplified version - in real implementation, you'd get it from storage
    const refresh = await storage.getItem('refreshToken');
    console.log('AuthService: Refresh token found:', refresh ? 'Refresh token exists' : 'No refresh token');
    
    if (!refresh) {
      console.log('AuthService: No refresh token available, throwing error');
      throw new Error('No refresh token available');
    }
    
    console.log('AuthService: Making refresh request to /auth/refresh-token');
    const response = await apiClient.post<AuthResponse>('/auth/refresh-token', { refreshToken: refresh });
    console.log('AuthService: Refresh response received:', response);
    
    const { accessToken, refreshToken: newRefresh } = response;
    console.log('AuthService: New tokens received:', { 
      accessToken: accessToken ? 'exists' : 'missing', 
      refreshToken: newRefresh ? 'exists' : 'missing' 
    });
    
    await storage.setItem('accessToken', accessToken);
    await storage.setItem('refreshToken', newRefresh);
    console.log('AuthService: Tokens stored in storage');
    return response;
  },

  logout: async () => {
    await storage.removeItem('accessToken');
    await storage.removeItem('refreshToken');
    console.log('AuthService: User logged out, tokens cleared');
  },

  getAccessToken: async (): Promise<string | null> => {
    try {
      const token = await storage.getItem('accessToken');
      console.log('AuthService: Retrieved access token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token');
      
      // If no token found, try again after a short delay (race condition fix)
      if (!token) {
        console.log('AuthService: No token found, waiting 100ms and retrying...');
        await new Promise(resolve => setTimeout(resolve, 100));
        const retryToken = await storage.getItem('accessToken');
        console.log('AuthService: Retry result:', retryToken ? `Token exists (${retryToken.substring(0, 20)}...)` : 'Still no token');
        return retryToken;
      }
      
      return token;
    } catch (error) {
      console.error('AuthService: Error retrieving access token:', error);
      return null;
    }
  },

  getRefreshToken: async (): Promise<string | null> => {
    return await storage.getItem('refreshToken');
  },

  // Send a verification code to the given email
  sendVerificationCode: async (email: string) => {
    const response = await apiClient.post('/auth/send-verification-code', { email });
    return response;
  },

  // Verify a received code given email and code
  verifyCode: async (email: string, code: number) => {
    const response = await apiClient.post('/auth/verify-code', { email, code });
    return response;
  },

  // Check if an email is already registered
  exists: async (email: string) => {
    const response = await apiClient.get('/auth/exists', { headers: { }, });
    // Note: adjust to backend API signature if needed
    return response as any;
  },

  // Forgot password - send reset code
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response;
  },

  // Reset password with new password
  resetPassword: async (email: string, newPassword: string) => {
    const response = await apiClient.post('/auth/reset-password', { email, newPassword });
    return response;
  },
};