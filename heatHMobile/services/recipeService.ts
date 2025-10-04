import { apiClient } from './apiClient';
import { RecipeModel } from '@/models/Recipe';

const RECIPE_API = '/recipe';

/**
 * Recipe service for interacting with the recipe API endpoints
 */
export const recipeService = {
  /**
   * Create a new recipe
   * 
   * @param {Object} recipeData - Recipe data to be created
   * @param {string} recipeData.title - Title of the recipe
   * @param {string[]} recipeData.instructions - List of instructions
   * @param {string[]} recipeData.ingredients - List of ingredients
   * @param {string} recipeData.tag - Tag for the recipe
   * @param {string} recipeData.type - Type of recipe
   * @param {string} recipeData.photo - Base64 encoded photo
   * @returns {Promise<string>} - Response message
   */
  createRecipe: async (recipeData: {
    title: string;
    instructions: string[];
    ingredients: string[];
    tag: string;
    type: string;
    photo: string;
  }, token?: string): Promise<string> => {
    try {
      const response = await apiClient.post(`${RECIPE_API}/create`, {
        title: recipeData.title,
        instructions: recipeData.instructions,
        ingredients: recipeData.ingredients,
        tag: recipeData.tag,
        type: recipeData.type,
        photo: recipeData.photo,
      }, token);

      return response as string;
    } catch (error) {
      console.error('Failed to create recipe:', error);
      throw error;
    }
  },

  /**
   * Get a recipe by ID
   * 
   * @param {number} recipeId - ID of the recipe to fetch
   * @returns {Promise<RecipeModel>} - Recipe object
   */
  getRecipe: async (recipeId: number, token?: string): Promise<RecipeModel> => {
    try {
      const recipeData = await apiClient.get(`${RECIPE_API}/get?recipeId=${recipeId}`, token);
      
      // Transform the API response into a RecipeModel object
      const recipe = new RecipeModel({
        id: recipeData.id,
        totalCalory: recipeData.totalCalory || 0,
        ingredients: recipeData.ingredients || [],
        tag: recipeData.tag || '',
        price: recipeData.price || 0,
        title: recipeData.title,
        type: recipeData.type || '',
        instructions: recipeData.instructions || [],
        photo: recipeData.photo,
        healthinessScore: recipeData.healthinessScore || 0,
        easinessScore: recipeData.easinessScore || 0,
        whoShared: recipeData.whoShared,
      });
      
      // Add additional properties if they exist in the API response
      if (recipeData.liked !== undefined) recipe.setLiked(recipeData.liked);
      if (recipeData.saved !== undefined) recipe.setSaved(recipeData.saved);
      if (recipeData.shared !== undefined) recipe.setShared(recipeData.shared);
      
      return recipe;
    } catch (error) {
      console.error(`Failed to fetch recipe with ID ${recipeId}:`, error);
      throw error;
    }
  },
  
  /**
   * Update a recipe's action (like, save, share)
   * 
   * @param {number} recipeId - ID of the recipe
   * @param {string} action - Action to perform ('like', 'save', 'share')
   * @param {boolean} value - New value for the action
   * @returns {Promise<string>} - Response message
   */
  updateRecipeAction: async (recipeId: number, action: string, value: boolean, token?: string): Promise<string> => {
    try {
      const response = await apiClient.post(`${RECIPE_API}/${action}`, {
        recipeId: recipeId,
        value: value
      }, token);

      return response as string;
    } catch (error) {
      console.error(`Failed to update recipe ${action}:`, error);
      throw error;
    }
  },
  
  /**
   * Submit a rating for a recipe
   * 
   * @param {number} recipeId - ID of the recipe
   * @param {number} rating - Rating value (1-5)
   * @param {string} type - Type of rating ('easiness' or 'healthiness')
   * @returns {Promise<string>} - Response message
   */
  submitRating: async (recipeId: number, rating: number, type: string = 'easiness', token?: string): Promise<string> => {
    try {
      const response = await apiClient.post(`${RECIPE_API}/rate`, {
        recipeId: recipeId,
        rating: rating,
        type: type
      }, token);

      return response as string;
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  }
};