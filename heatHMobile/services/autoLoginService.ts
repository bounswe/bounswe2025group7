import { storage } from '@/utils/storage';
import { config } from '@/constants/config';

const TEST_CREDENTIALS = {
  username: 'test@test.com',
  password: 'test'
};

export const autoLoginService = {
  // Auto login with test credentials
  autoLogin: async (): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      console.log('Attempting auto-login with test credentials...');
      
      const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(TEST_CREDENTIALS)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.accessToken) {
        // Store the token
        await storage.setItem('accessToken', data.accessToken);
        console.log('Auto-login successful! Token stored.');
        return { success: true, token: data.accessToken };
      } else {
        throw new Error('No access token received');
      }
    } catch (error: any) {
      console.error('Auto-login failed:', error);
      return { 
        success: false, 
        error: error.message || 'Auto-login failed' 
      };
    }
  },

  // Check if user is already logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const token = await storage.getItem('accessToken');
      return !!token;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Logout (clear token)
  logout: async (): Promise<void> => {
    try {
      await storage.removeItem('accessToken');
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
};
