import { httpClient } from './httpClient';
import { authService } from './authService';
import { apiClient } from './apiClient';

export const userService = {
  me: async () => {
    const response = await apiClient.get<any>('/me');
    return response;
  },
  byUsername: async (username: string) => {
    const response = await apiClient.get<any>(`/users/${username}`);
    return response;
  },
  
  // Update user profile
  updateProfile: async (profileData: any): Promise<any> => {
    try {
      const response = await apiClient.put('/user/profile', profileData);
      return response;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  // Get user's recipes
  getMyRecipes: async (): Promise<any> => {
    try {
      const response = await apiClient.get('/user/recipes');
      return response;
    } catch (error) {
      console.error('Failed to get user recipes:', error);
      throw error;
    }
  }
};