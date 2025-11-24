import axios from 'axios';
import authService from './authService';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`, 
});

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  const token = authService.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses by attempting token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await authService.refreshToken();
        const newToken = authService.getAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        // Retry with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Check if a recipe is saved by current user
export const checkIfRecipeSaved = async (recipeId) => {
  try {
    const response = await apiClient.get('/saved-recipes/get');
    const savedRecipes = response.data;
    return savedRecipes.some(recipe => recipe.recipeId === recipeId);
  } catch (error) {
    console.error('Error checking saved recipe:', error);
    return false;
  }
};

// Save a recipe
export const saveRecipe = async (recipeId) => {
  return apiClient.post('/saved-recipes/save', { recipeId });
};

// Unsave a recipe
export const unsaveRecipe = async (recipeId) => {
  return apiClient.post('/saved-recipes/unsave', { recipeId });
};

export default apiClient;