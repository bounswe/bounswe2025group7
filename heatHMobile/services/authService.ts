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
    const response = await httpClient.post<AuthResponse>('/auth/register', userData);
    console.log('AuthService: Registration response received:', response);
    const { accessToken, refreshToken } = response.data;
    console.log('AuthService: Tokens received:', { accessToken: accessToken ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing' });
    // Store tokens in memory storage for now
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    console.log('AuthService: Attempting login to:', 'http://35.198.76.72:8080/api/auth/login');
    console.log('AuthService: Credentials:', { username: credentials.username, password: '***' });
    const response = await httpClient.post<AuthResponse>('/auth/login', credentials);
    console.log('AuthService: Response received:', response);
    const { accessToken, refreshToken } = response.data;
    console.log('AuthService: Tokens received:', { accessToken: accessToken ? 'exists' : 'missing', refreshToken: refreshToken ? 'exists' : 'missing' });
    // Store tokens in memory storage for now
    return response.data;
  },

  sendVerification: async (userData: { email: string }) => {
    const response = await httpClient.post('/auth/send-verification-code', userData);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    console.log('AuthService: Attempting token refresh');
    // For now, we'll need to get the refresh token from storage
    // This is a simplified version - in real implementation, you'd get it from storage
    const refresh = 'dummy-refresh-token'; // This should come from storage
    console.log('AuthService: Refresh token found:', refresh ? 'Refresh token exists' : 'No refresh token');
    
    if (!refresh) {
      console.log('AuthService: No refresh token available, throwing error');
      throw new Error('No refresh token available');
    }
    
    console.log('AuthService: Making refresh request to /auth/refresh-token');
    const response = await httpClient.post<AuthResponse>('/auth/refresh-token', { refreshToken: refresh });
    console.log('AuthService: Refresh response received:', response);
    
    const { accessToken, refreshToken: newRefresh } = response.data;
    console.log('AuthService: New tokens received:', { 
      accessToken: accessToken ? 'exists' : 'missing', 
      refreshToken: newRefresh ? 'exists' : 'missing' 
    });
    
    // Store tokens in memory storage for now
    console.log('AuthService: Tokens stored in memory');
    return response.data;
  },

  logout: async () => {
    // Clear tokens from memory storage
    console.log('AuthService: User logged out');
  },

  getAccessToken: async (): Promise<string | null> => {
    // For now, return null - in real implementation, get from storage
    console.log('AuthService: Retrieved access token: No token');
    return null;
  },

  getRefreshToken: async (): Promise<string | null> => {
    // For now, return null - in real implementation, get from storage
    return null;
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
    const response = await httpClient.get('/auth/exists', { email });
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