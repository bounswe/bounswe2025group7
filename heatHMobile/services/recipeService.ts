import { apiClient } from './apiClient';

export const recipeService = {
  list: () => apiClient.get<any[]>('/recipes').then((r: any) => r.data),
  get: (id: string) => apiClient.get<any>(`/recipes/${id}`).then((r: any) => r.data),
  
  createRecipe: (recipeData: {
    title: string;
    instructions: string[];
    ingredients: Array<{ name: string; quantity: number }>;
    tag: string;
    type: string;
    photo: string;
    totalCalorie: number;
    price: number;
  }) => apiClient.post<string>('/recipe/create', recipeData).then((r: any) => r.data),
  
  getRecipe: (recipeId: number) => apiClient.get<any>(`/recipe/get?recipeId=${recipeId}`).then((r: any) => r.data),
  
  getAllRecipes: () => apiClient.get<any[]>('/recipe/get-all').then((r: any) => r.data),
  
  
  deleteRecipe: (recipeId: number) => 
    apiClient.delete<string>('/recipe/delete-recipe', { data: { id: recipeId } }).then((r: any) => r.data),
  
  saveRecipe: (recipeId: number) => 
    apiClient.post<string>('/saved-recipes/save', { recipeId }).then((r: any) => r.data),
  
  unsaveRecipe: (recipeId: number) => 
    apiClient.post<string>('/saved-recipes/unsave', { recipeId }).then((r: any) => r.data),
  
  getSavedRecipes: () => 
    apiClient.get<any[]>('/saved-recipes/get').then((r: any) => r.data),
};


