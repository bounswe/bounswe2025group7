import { apiClient } from './apiClient';

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<any>} - Registration response with tokens
   */
  register: async (userData: any): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      const { accessToken, refreshToken } = response as { accessToken: string; refreshToken: string };
      
      // Store tokens (you'll need to implement secure storage)
      // For now, we'll just return the response
      return response;
    } catch (error) {
      console.error('Failed to register:', error);
      throw error;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @returns {Promise<any>} - Login response with tokens
   */
  login: async (credentials: any): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { accessToken, refreshToken } = response as { accessToken: string; refreshToken: string };
      
      // Store tokens (you'll need to implement secure storage)
      // For now, we'll just return the response
      return response;
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  },

  /**
   * Send verification code
   * @param {Object} userData - User data for verification
   * @returns {Promise<any>} - Verification response
   */
  sendVerification: async (userData: any): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/send-verification-code', userData);
      console.log("data: ", response);
      return response;
    } catch (error) {
      console.error('Failed to send verification:', error);
      throw error;
    }
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<any>} - New tokens
   */
  refreshToken: async (refreshToken: string): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/refresh-token', { refreshToken });
      const { accessToken, refreshToken: newRefresh } = response as { accessToken: string; refreshToken: string };
      
      // Store new tokens (you'll need to implement secure storage)
      return response;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  },

  /**
   * Logout user
   * @returns {void}
   */
  logout: (): void => {
    // Clear stored tokens (you'll need to implement secure storage)
    console.log('User logged out');
  },

  /**
   * Get access token
   * @returns {string | null} - Access token
   */
  getAccessToken: (): string | null => {
    // Return stored access token (you'll need to implement secure storage)
    return null;
  },

  /**
   * Get refresh token
   * @returns {string | null} - Refresh token
   */
  getRefreshToken: (): string | null => {
    // Return stored refresh token (you'll need to implement secure storage)
    return null;
  },

  /**
   * Send a verification code to the given email
   * @param {string} email - Email address
   * @returns {Promise<any>} - Verification response
   */
  sendVerificationCode: async (email: string): Promise<any> => {
    try {
      const response = await apiClient.post('/auth/send-verification-code', { email });
      return response;
    } catch (error) {
      console.error('Failed to send verification code:', error);
      throw error;
    }
  },

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