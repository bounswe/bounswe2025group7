import { apiClient } from './apiClient';

export const userService = {
  /**
   * Get user profile
   * @returns {Promise<any>} - User profile data
   */
  getProfile: async (token?: string): Promise<any> => {
    try {
      const response = await apiClient.get('/user/profile', token);
      return response;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },

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