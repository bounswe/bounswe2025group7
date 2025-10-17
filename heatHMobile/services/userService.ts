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
      
      throw error;
    }
  },

  // Get user's recipes
  getMyRecipes: async (): Promise<any> => {
    try {
      return await apiClient.get('/user/recipes');
    } catch (error) {
      
      throw error;
    }
  }
};