import { apiClient } from './apiClient';
import { RecipeModel, Recipe } from '@/models/Recipe';

export const savedRecipesService = {
  /**
   * Get all saved recipes for the current user
   * @param {string} token - Authentication token
   * @returns {Promise<RecipeModel[]>} - Array of saved recipes
   */
  getSavedRecipes: async (token: string): Promise<RecipeModel[]> => {
    try {
      console.log('Fetching saved recipes with token:', token);
      const response = await apiClient.get<Array<{
        recipeId: string;
        title: string;
        photo: string;
      }>>('/saved-recipes/get', token);
      
      console.log('API response:', response);
      
      // Map API response to RecipeModel objects
      const recipeInstances = response.map(recipe => {
        const recipeObj = new RecipeModel({
          id: recipe.recipeId,
          title: recipe.title,
          photo: recipe.photo,
          // Set these properties with defaults as needed
          instructions: [], 
          totalCalory: 0,
          ingredients: [],
          tag: '',
          price: 0,
          type: '',
          healthinessScore: 0,
          easinessScore: 0,
          whoShared: null,
        });
        
        // Set saved state to true since these are saved recipes
        recipeObj.setSaved(true);
        recipeObj.setLiked(false); // Default state
        recipeObj.setShared(false); // Default state
        
        return recipeObj;
      });
      
      console.log('Mapped recipes:', recipeInstances);
      return recipeInstances;
    } catch (error) {
      console.error('Error fetching saved recipes:', error);
      throw error;
    }
  },

  /**
   * Save a recipe
   * @param {string} recipeId - ID of the recipe to save
   * @param {string} token - Authentication token
   * @returns {Promise<any>} - Save response
   */
  saveRecipe: async (recipeId: string, token: string): Promise<any> => {
    try {
      const response = await apiClient.post('/saved-recipes/save', { recipeId }, token);
      return response;
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  },

  /**
   * Unsave a recipe
   * @param {string} recipeId - ID of the recipe to unsave
   * @param {string} token - Authentication token
   * @returns {Promise<any>} - Unsave response
   */
  unsaveRecipe: async (recipeId: string, token: string): Promise<any> => {
    try {
      const response = await apiClient.post('/saved-recipes/unsave', { recipeId }, token);
      return response;
    } catch (error) {
      console.error('Error unsaving recipe:', error);
      throw error;
    }
  },

  /**
   * Check if a recipe is saved by current user
   * @param {string} recipeId - ID of the recipe to check
   * @param {string} token - Authentication token
   * @returns {Promise<boolean>} - True if recipe is saved
   */
  checkIfRecipeSaved: async (recipeId: string, token: string): Promise<boolean> => {
    try {
      const response = await apiClient.get('/saved-recipes/get', token);
      const savedRecipes = response;
      return savedRecipes.some((recipe: any) => recipe.recipeId === recipeId);
    } catch (error) {
      console.error('Error checking saved recipe:', error);
      return false;
    }
  }
};
