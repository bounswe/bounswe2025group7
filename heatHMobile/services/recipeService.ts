import { apiClient } from './apiClient';

export const recipeService = {
  list: () => apiClient.get<any[]>('/recipes'),
  get: (id: string) => apiClient.get<any>(`/recipes/${id}`),
};


