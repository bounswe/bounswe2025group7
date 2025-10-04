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
  
  // Update user profile
  updateProfile: async (profileData: any, token?: string): Promise<any> => {
    try {
      const response = await httpClient.put('/user/profile', profileData, token);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  // Get user's recipes
  getMyRecipes: async (token?: string): Promise<any> => {
    try {
      const response = await httpClient.get('/user/recipes', undefined, token);
      return response.data;
    } catch (error) {
      console.error('Failed to get user recipes:', error);
      throw error;
    }
  }
};