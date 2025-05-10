import Recipe from '../models/Recipe';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const RECIPE_API = `${API_BASE_URL}/api/recipe`;

/**
 * Recipe service for interacting with the recipe API endpoints
 */
const recipeService = {
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
  createRecipe: async (recipeData) => {
    try {
      const response = await fetch(`${RECIPE_API}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: recipeData.title,
          instructions: recipeData.instructions,
          ingredients: recipeData.ingredients,
          tag: recipeData.tag,
          type: recipeData.type,
          photo: recipeData.photo,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error creating recipe: ${response.statusText}`);
      }

      const result = await response.text();
      return result;
    } catch (error) {
      console.error('Failed to create recipe:', error);
      throw error;
    }
  },

  /**
   * Get a recipe by ID
   * 
   * @param {number} recipeId - ID of the recipe to fetch
   * @returns {Promise<Recipe>} - Recipe object
   */
  getRecipe: async (recipeId) => {
    try {
      const response = await fetch(`${RECIPE_API}/get?recipeId=${recipeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching recipe: ${response.statusText}`);
      }

      const recipeData = await response.json();
      
      // Transform the API response into a Recipe object
      const recipe = new Recipe({
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
      if (recipeData.liked !== undefined) recipe.liked = recipeData.liked;
      if (recipeData.saved !== undefined) recipe.saved = recipeData.saved;
      if (recipeData.shared !== undefined) recipe.shared = recipeData.shared;
      
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
  updateRecipeAction: async (recipeId, action, value) => {
    try {
      const response = await fetch(`${RECIPE_API}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipeId,
          value: value
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating recipe ${action}: ${response.statusText}`);
      }

      const result = await response.text();
      return result;
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
  submitRating: async (recipeId, rating, type = 'easiness') => {
    try {
      const response = await fetch(`${RECIPE_API}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipeId: recipeId,
          rating: rating,
          type: type
        }),
      });

      if (!response.ok) {
        throw new Error(`Error submitting rating: ${response.statusText}`);
      }

      const result = await response.text();
      return result;
    } catch (error) {
      console.error('Failed to submit rating:', error);
      throw error;
    }
  }
};

export default recipeService;