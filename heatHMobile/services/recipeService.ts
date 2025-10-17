import { apiClient } from './apiClient';

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
  createRecipe: async (recipeData: RecipeRequest): Promise<string> => {
    const response = await apiClient.post<string>('/recipe/create', {
      title: recipeData.title,
      instructions: recipeData.instructions,
      ingredients: recipeData.ingredients,
      tag: recipeData.tag,
      type: recipeData.type,
      photo: recipeData.photo,
    });
    return response;
  },

  // Get a recipe by ID
  getRecipe: async (recipeId: number): Promise<Recipe> => {
    const response = await apiClient.get<Recipe>(`/recipe/get`, { params: { recipeId } });
    return response;
  },

  // Update a recipe's action (like, save, share)
  updateRecipeAction: async (recipeId: number, action: string, value: boolean): Promise<string> => {
    const response = await apiClient.post<string>(`/recipe/${action}`, { recipeId, value });
    return response;
  },

  // Submit a rating for a recipe
  submitRating: async (recipeId: number, rating: number, type: string = 'easiness'): Promise<string> => {
    const response = await apiClient.post<string>('/recipe/rate', { recipeId, rating, type });
    return response;
  },
};