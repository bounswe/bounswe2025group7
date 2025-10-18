import { recipeService } from '@/services/recipeService';
import { apiClient } from '@/services/apiClient';

jest.mock('@/services/apiClient', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('recipeService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('list, get and getAllRecipes', async () => {
    (apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ data: [{ id: 1 }] })
      .mockResolvedValueOnce({ data: { id: 1 } })
      .mockResolvedValueOnce({ data: [{ id: 2 }] });

    expect(await recipeService.list()).toEqual([{ id: 1 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/recipes');

    expect(await recipeService.get('1')).toEqual({ id: 1 });
    expect(apiClient.get).toHaveBeenCalledWith('/recipes/1');

    expect(await recipeService.getAllRecipes()).toEqual([{ id: 2 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/recipe/get-all');
  });

  it('create, delete, save, unsave, getSaved', async () => {
    (apiClient.post as jest.Mock)
      .mockResolvedValueOnce({ data: 'OK' })
      .mockResolvedValueOnce({ data: 'SAVED' })
      .mockResolvedValueOnce({ data: 'UNSAVED' });
    (apiClient.delete as jest.Mock)
      .mockResolvedValueOnce({ data: 'DELETED' });
    (apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ data: [{ id: 5 }] });

    const payload = { title: 't', instructions: [], ingredients: [], tag: 'x', type: 'y', photo: 'p', totalCalorie: 0, price: 0 };

    expect(await recipeService.createRecipe(payload as any)).toBe('OK');
    expect(apiClient.post).toHaveBeenCalledWith('/recipe/create', payload);

    expect(await recipeService.deleteRecipe(3)).toBe('DELETED');
    expect(apiClient.delete).toHaveBeenCalledWith('/recipe/delete-recipe', { data: { id: 3 } });

    expect(await recipeService.saveRecipe(7)).toBe('SAVED');
    expect(apiClient.post).toHaveBeenCalledWith('/saved-recipes/save', { recipeId: 7 });

    expect(await recipeService.unsaveRecipe(7)).toBe('UNSAVED');
    expect(apiClient.post).toHaveBeenCalledWith('/saved-recipes/unsave', { recipeId: 7 });

    expect(await recipeService.getSavedRecipes()).toEqual([{ id: 5 }]);
    expect(apiClient.get).toHaveBeenCalledWith('/saved-recipes/get');
  });
});


