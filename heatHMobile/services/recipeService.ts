import { apiClient } from './apiClient';

export const recipeService = {
  list: () => apiClient.get<any[]>('/recipes').then((r: any) => r.data),
  get: (id: string) => apiClient.get<any>(`/recipes/${id}`).then((r: any) => r.data),
  
  createRecipe: (recipeData: {
    title: string;
    instructions: string[];
    ingredients: string[];
    tag: string;
    type: string;
    photo: string;
  }) => apiClient.post<string>('/recipe/create', recipeData).then((r: any) => r.data),
  
  getRecipe: (recipeId: number) => apiClient.get<any>(`/recipe/get?recipeId=${recipeId}`).then((r: any) => r.data),
  
  updateRecipeAction: (recipeId: number, action: 'like' | 'save' | 'share', value: boolean) => 
    apiClient.post<string>(`/recipe/${action}`, { recipeId, value }).then((r: any) => r.data),
  
  submitRating: (recipeId: number, rating: number, type: 'easiness' | 'healthiness' = 'easiness') => 
    apiClient.post<string>('/recipe/rate', { recipeId, rating, type }).then((r: any) => r.data),
};


