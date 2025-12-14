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
    // Mobile specific endpoint mapping based on the provided web code structure request
    // Since the web code provided uses /api/recipe/rate for both, but the existing mobile code used /recipe/rate-easiness
    // We will follow the user's request to implement 'submitRating' which likely implies a unified endpoint or specific logic.
    // However, looking at the web code provided: 
    // fetch(`${RECIPE_API}/rate`, ... body: { recipeId, rating, type })
    // We should replicate this structure using apiClient.
    
    // Note: The previous implementation used /recipe/rate-easiness. 
    // If the backend has changed to support a unified /rate endpoint as per the web code provided, we use that.
    // If not, we might need to stick to the old endpoint for easiness or check if a new one exists.
    // Assuming the user wants us to match the web implementation structure:
    return apiClient.post<string>('/recipe/rate', { 
      recipeId, 
      rating, 
      type 
    }).then((r: any) => r.data);
  },

  // Keeping these for backward compatibility if needed, but submitRating is the new requested way
  rateEasiness: (recipeId: number, easinessRate: number) =>
    apiClient.post<string>('/recipe/rate-easiness', { recipeId, easinessRate }).then((r: any) => r.data),

  getAverageEasiness: (recipeId: number) =>
    apiClient.post<{ averageEasinessRate: number }>('/recipe/average-easiness-rate', { recipeId }).then((r: any) => r.data),
};
