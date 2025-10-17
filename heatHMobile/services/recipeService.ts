import { apiClient } from './apiClient';

export const recipeService = {
  list: () => apiClient.get<any[]>('/recipes').then((r: any) => r.data),
  get: (id: string) => apiClient.get<any>(`/recipes/${id}`).then((r: any) => r.data),
};


