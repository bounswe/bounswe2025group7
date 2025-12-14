import { apiClient } from './apiClient';
import type { MeasurementType } from '../constants/measurements';

export const recipeService = {
  list: () => apiClient.get<any[]>('/recipes').then((r: any) => r.data),
  get: (id: string) => apiClient.get<any>(`/recipes/${id}`).then((r: any) => r.data),
  
  createRecipe: (recipeData: {
    title: string;
    instructions: string[];
    ingredients: Array<{ name: string; quantity: number; type: MeasurementType }>;
    tag: string;
    type: string;
    photo: string;
    totalCalorie: number;
    price: number;
  }) => apiClient.post<string>('/recipe/create', recipeData).then((r: any) => r.data),
  
  getRecipe: (recipeId: number) => apiClient.get<any>(`/recipe/get?recipeId=${recipeId}`).then((r: any) => r.data),
  
  getAllRecipes: () => apiClient.get<any[]>('/recipe/get-all').then((r: any) => r.data),

  getAllRecipesForAll: () => apiClient.get<any[]>('/recipe/get-all-for-all').then((r: any) => r.data),
  
  
  deleteRecipe: (recipeId: number) => 
    apiClient.delete<string>('/recipe/delete-recipe', { data: { id: recipeId } }).then((r: any) => r.data),
  
  saveRecipe: (recipeId: number) => 
    apiClient.post<string>('/saved-recipes/save', { recipeId }).then((r: any) => r.data),
  
  unsaveRecipe: (recipeId: number) => 
    apiClient.post<string>('/saved-recipes/unsave', { recipeId }).then((r: any) => r.data),
  
  getSavedRecipes: () => 
    apiClient.get<any[]>('/saved-recipes/get').then((r: any) => r.data),

  isRecipeSaved: async (recipeId: number | string): Promise<boolean> => {
    try {
      const list = await apiClient.get<any[]>('/saved-recipes/get').then((r: any) => r.data);
      if (!Array.isArray(list)) return false;
      return list.some((it: any) => {
        const rid =
          it?.id ??
          it?.recipeId ??
          it?.recipe?.id ??
          it?.recipe?.recipeId ??
          it?.recipe?.recipeID;
        return String(rid) === String(recipeId);
      });
    } catch {
      return false;
    }
  },

  submitRating: (recipeId: number, rating: number, type: 'easiness' | 'healthiness' = 'easiness') => {
    // Currently only easiness is supported by backend
    if (type === 'easiness') {
      return apiClient.post<string>('/recipe/rate-easiness', { 
        recipeId, 
        easinessRate: rating // Backend expects 'easinessRate' not 'rating'
      }).then((r: any) => r.data);
    }
    // Fallback or future implementation for healthiness if needed
    return Promise.resolve("Rating type not supported yet");
  },

  // Keeping these for backward compatibility if needed, but submitRating is the new requested way
  rateEasiness: (recipeId: number, easinessRate: number) =>
    apiClient.post<string>('/recipe/rate-easiness', { recipeId, easinessRate }).then((r: any) => r.data),

  getAverageEasiness: (recipeId: number) =>
    apiClient.post<{ averageEasinessRate: number }>('/recipe/average-easiness-rate', { recipeId }).then((r: any) => r.data),

  getUserEasinessRate: (recipeId: number) =>
    apiClient.get<{ easinessRate: number | null }>(`/recipe/get-easiness-rate-by-user?recipeId=${recipeId}`).then((r: any) => r.data),
};
