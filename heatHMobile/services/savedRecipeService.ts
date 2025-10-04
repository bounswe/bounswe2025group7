import { apiClient } from './apiClient';

// Saved recipe interfaces matching backend
export interface SavedRecipeRequest {
  recipeId: number;
}

export interface SavedRecipeResponse {
  id: number;
  userId: number;
  recipeId: number;
  recipe?: any; // The actual recipe data
  createdAt: string;
}

export const savedRecipeService = {
  // Save a recipe
  saveRecipe: async (recipeId: number): Promise<string> => {
    const request: SavedRecipeRequest = { recipeId };
    const response = await apiClient.post<string>('/saved-recipes/save', request);
    return response;
  },

  // Unsave a recipe
  unsaveRecipe: async (recipeId: number): Promise<string> => {
    const request: SavedRecipeRequest = { recipeId };
    const response = await apiClient.post<string>('/saved-recipes/unsave', request);
    return response;
  },

  // Get saved recipes for current user
  getSavedRecipes: async (): Promise<SavedRecipeResponse[]> => {
    const response = await apiClient.get<SavedRecipeResponse[]>('/saved-recipes/get');
    return response;
  },
};


