import { httpClient } from './httpClient';
import { authService } from './authService';

// Recipe interfaces matching backend
export interface Recipe {
  id: number;
  title: string;
  instructions: string[];
  ingredients: string[];
  tag: string;
  type: string;
  photo?: string;
  totalCalory?: number;
  price?: number;
  healthinessScore?: number;
  easinessScore?: number;
  whoShared?: string;
  liked?: boolean;
  saved?: boolean;
  shared?: boolean;
}

export interface RecipeRequest {
  title: string;
  instructions: string[];
  ingredients: string[];
  tag: string;
  type: string;
  photo?: string;
}

export interface RecipeResponse {
  message: string;
}

export interface DeleteRecipeRequest {
  id: number;
}

const RECIPE_API = '/recipe';

/**
 * Recipe service for interacting with the recipe API endpoints
 */
export const recipeService = {
  // Create a new recipe
  createRecipe: async (recipeData: RecipeRequest): Promise<RecipeResponse> => {
    const response = await apiClient.post<RecipeResponse>('/recipe/create', recipeData);
    return response;
  },

  // Get a recipe by ID
  getRecipe: async (recipeId: number): Promise<Recipe> => {
    const response = await apiClient.get<Recipe>(`/recipe/get?recipeId=${recipeId}`);
    return response;
  },

  // Get all recipes
  getAllRecipes: async (): Promise<Recipe[]> => {
    const response = await apiClient.get<Recipe[]>('/recipe/get-all');
    return response;
  },

  // Delete a recipe
  deleteRecipe: async (recipeId: number): Promise<string> => {
    const request: DeleteRecipeRequest = { id: recipeId };
    const response = await apiClient.post<string>('/recipe/delete-recipe', request);
    return response;
  },
};