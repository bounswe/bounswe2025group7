import { httpClient } from './httpClient';
import { authService } from './authService';

export const recipeService = {
  list: async () => {
    const token = await authService.getAccessToken();
    return httpClient.get<any[]>('/recipes', undefined, token);
  },
  get: async (id: string) => {
    const token = await authService.getAccessToken();
    return httpClient.get<any>(`/recipes/${id}`, undefined, token);
  },
};


