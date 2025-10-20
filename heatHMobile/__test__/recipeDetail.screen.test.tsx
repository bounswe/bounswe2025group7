import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import RecipeDetail from '@/app/recipeDetail/recipeDetail';
import { recipeService } from '@/services/recipeService';

// Mock vector icons to avoid ESM issues
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

// Mock safe area context (avoid ESM mock file)
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ recipeId: '42' }),
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true }),
}));

jest.mock('@/services/recipeService', () => ({
  recipeService: {
    getRecipe: jest.fn(),
  },
}));

describe('RecipeDetail screen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders recipe content after loading', async () => {
    (recipeService.getRecipe as jest.Mock).mockResolvedValueOnce({
      id: 42,
      title: 'Pasta',
      tag: 'Italian',
      totalCalorie: 500,
      type: 'Dinner',
      price: 12,
      ingredients: ['Tomato', { name: 'Salt', amount: 1 }],
      instructions: ['Boil water', 'Cook pasta'],
      nutritionData: { calories: 500, protein: 20 },
    });

    render(<RecipeDetail />);

    await waitFor(() => {
      expect(screen.getByText('Pasta')).toBeTruthy();
      expect(screen.getByText('Italian')).toBeTruthy();
      expect(screen.getAllByText('Calories').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Protein').length).toBeGreaterThan(0);
      expect(screen.getByText('1. Boil water')).toBeTruthy();
    });
  });
});


