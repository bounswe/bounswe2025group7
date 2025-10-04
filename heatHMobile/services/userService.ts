import { httpClient } from './httpClient';
import { authService } from './authService';

export const userService = {
  me: async () => {
    const token = await authService.getAccessToken();
    return httpClient.get<any>('/me', undefined, token);
  },
  byUsername: async (username: string) => {
    const token = await authService.getAccessToken();
    return httpClient.get<any>(`/users/${username}`, undefined, token);
  },
};

  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<any>} - Updated profile data
   */
  updateProfile: async (profileData: any, token?: string): Promise<any> => {
    try {
      const response = await apiClient.put('/user/profile', profileData, token);
      return response;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  /**
   * Get user's recipes
   * @returns {Promise<any>} - User's recipes
   */
  getMyRecipes: async (token?: string): Promise<any> => {
    try {
      const response = await apiClient.get('/user/recipes', token);
      return response;
    } catch (error) {
      console.error('Failed to get user recipes:', error);
      throw error;
    }
  }
};