import { apiClient } from './apiClient';

export const userService = {
  me: async () => {
    return await apiClient.get<any>('/me');
  },
  byUsername: async (username: string) => {
    return await apiClient.get<any>(`/users/${username}`);
  },
  
  // Update user profile
  updateProfile: async (profileData: any): Promise<any> => {
    try {
      return await apiClient.put('/user/profile', profileData);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  // Get user's recipes
  getMyRecipes: async (): Promise<any> => {
    try {
      return await apiClient.get('/user/recipes');
    } catch (error) {
      console.error('Failed to get user recipes:', error);
      throw error;
    }
  }
};