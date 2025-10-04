import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from './httpClient';

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
    const response = await httpClient.post('/auth/register', userData);
    console.log('AuthService: Registration response received:', response);
    const { accessToken, refreshToken } = response.data;
    console.log('AuthService: Tokens received:', { accessToken: accessToken ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing' });
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('AuthService: Attempting login to:', 'http://35.198.76.72:8080/api/auth/login');
    console.log('AuthService: Credentials:', { username: credentials.username, password: '***' });
    const response = await httpClient.post('/auth/login', credentials);
    console.log('AuthService: Response received:', response);
    const { accessToken, refreshToken } = response.data;
    console.log('AuthService: Tokens received:', { accessToken: accessToken ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing' });
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    return response.data;
  },

  sendVerification: async (userData: { email: string }) => {
    const response = await httpClient.post('/auth/send-verification-code', userData);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    console.log('AuthService: Attempting token refresh');
    const refresh = await AsyncStorage.getItem('refreshToken');
    console.log('AuthService: Refresh token found:', refresh ? 'Refresh token exists' : 'No refresh token');
    
    if (!refresh) {
      console.log('AuthService: No refresh token available, throwing error');
      throw new Error('No refresh token available');
    }
    
    console.log('AuthService: Making refresh request to /auth/refresh-token');
    const response = await httpClient.post('/auth/refresh-token', { refreshToken: refresh });
    console.log('AuthService: Refresh response received:', response);
    
    const { accessToken, refreshToken: newRefresh } = response.data;
    console.log('AuthService: New tokens received:', { 
      accessToken: accessToken ? 'exists' : 'missing', 
      refreshToken: newRefresh ? 'exists' : 'missing' 
    });
    
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', newRefresh);
    console.log('AuthService: Tokens stored in AsyncStorage');
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
  },

  getAccessToken: async (): Promise<string | null> => {
    const token = await AsyncStorage.getItem('accessToken');
    console.log('AuthService: Retrieved access token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token');
    return token;
  },

  getRefreshToken: async (): Promise<string | null> => {
    return await AsyncStorage.getItem('refreshToken');
  },

  // Send a verification code to the given email
  sendVerificationCode: async (email: string) => {
    const response = await httpClient.post('/auth/send-verification-code', { email });
    return response.data;
  },

  // Verify a received code given email and code
  verifyCode: async (email: string, code: number) => {
    const response = await httpClient.post('/auth/verify-code', { email, code });
    return response.data;
  },

  // Check if an email is already registered
  exists: async (email: string) => {
    const response = await httpClient.get('/auth/exists', { params: { email } });
    return response.data;
  },

  // Forgot password - send reset code
  forgotPassword: async (email: string) => {
    const response = await httpClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password with new password
  resetPassword: async (email: string, newPassword: string) => {
    const response = await httpClient.post('/auth/reset-password', { email, newPassword });
    return response.data;
  },
};

  /**
   * Verify a received code given email and code
   * @param {string} email - Email address
   * @param {string} code - Verification code
   * @returns {Promise<any>} - Verification response
   */
  verifyCode: async (email: string, code: string): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/verify-code', { email, code });
      return response;
    } catch (error) {
      console.error('Failed to verify code:', error);
      throw error;
    }
  },

  /**
   * Check if an email is already registered
   * @param {string} email - Email address
   * @returns {Promise<any>} - Exists response
   */
  exists: async (email: string): Promise<any> => {
    try {
      const response = await apiClient.get('/auth/exists', undefined, { params: { email } });
      return response;
    } catch (error) {
      console.error('Failed to check if email exists:', error);
      throw error;
    }
  }
};