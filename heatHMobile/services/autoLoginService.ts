import { authService } from './authService';

const TEST_CREDENTIALS = {
  username: 'test@test.com',
  password: 'test'
};

export const autoLoginService = {
  // Auto login with test credentials (matches frontend pattern)
  autoLogin: async (): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      console.log('🚀 Auto-login: Starting with test credentials...');
      console.log('🚀 Auto-login: Credentials:', TEST_CREDENTIALS);
      
      const response = await authService.login(TEST_CREDENTIALS);
      console.log('🚀 Auto-login: Response received:', response);
      
      if (response && response.accessToken) {
        console.log('🚀 Auto-login: SUCCESS! Token:', response.accessToken);
        return { success: true, token: response.accessToken };
      } else {
        console.error('🚀 Auto-login: No access token in response:', response);
        throw new Error('No access token received');
      }
    } catch (error: any) {
      console.error('🚀 Auto-login: FAILED:', error);
      return { 
        success: false, 
        error: error.message || 'Auto-login failed' 
      };
    }
  },

  // Check if user is already logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const token = await authService.getAccessToken();
      return !!token;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Logout (clear token)
  logout: async (): Promise<void> => {
    try {
      await authService.logout();
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};
