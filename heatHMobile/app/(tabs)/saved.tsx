import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Share, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import { savedRecipesService } from '@/services/savedRecipesService';
import { RecipeModel } from '@/models/Recipe';
import Screen from '@/components/layout/Screen';
import Loader from '@/components/ui/Loader';
import RecipeList from '@/components/recipes/RecipeList';
import EmptySavedRecipes from '@/components/recipes/EmptySavedRecipes';

export default function SavedScreen() {
  const { token, setToken } = useAuthContext();
  const [recipes, setRecipes] = useState<RecipeModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debug logging
  console.log('SavedScreen - token:', token);
  console.log('SavedScreen - loading:', loading);
  console.log('SavedScreen - recipes length:', recipes.length);

  // Fetch saved recipes on component mount
  useEffect(() => {
    console.log('useEffect triggered - token:', token);
    if (token) {
      console.log('Token exists, fetching saved recipes...');
      fetchSavedRecipes();
    } else {
      console.log('No token, setting loading to false');
      setLoading(false);
    }
  }, [token]);

  const fetchSavedRecipes = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const savedRecipes = await savedRecipesService.getSavedRecipes(token);
      setRecipes(savedRecipes);
    } catch (err) {
      console.error('Failed to fetch saved recipes:', err);
      
      // For testing purposes, show mock data when API fails
      if (token === 'test-token-123') {
        console.log('Using mock data for testing');
        const mockRecipes = [
          new RecipeModel({
            id: '1',
            title: 'Mock Recipe 1',
            photo: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Recipe+1',
            instructions: [],
            totalCalory: 0,
            ingredients: [],
            tag: '',
            price: 0,
            type: '',
            healthinessScore: 0,
            easinessScore: 0,
            whoShared: null,
          }),
          new RecipeModel({
            id: '2',
            title: 'Mock Recipe 2',
            photo: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Recipe+2',
            instructions: [],
            totalCalory: 0,
            ingredients: [],
            tag: '',
            price: 0,
            type: '',
            healthinessScore: 0,
            easinessScore: 0,
            whoShared: null,
          }),
        ];
        mockRecipes.forEach(recipe => {
          recipe.setSaved(true);
          recipe.setLiked(false);
          recipe.setShared(false);
        });
        setRecipes(mockRecipes);
      } else {
        setError('Failed to load saved recipes. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRecipePress = (recipe: RecipeModel) => {
    // Navigate to the recipe detail page
    router.push(`/recipes/${recipe.getId()}`);
  };

  const handleUnsaveRecipe = async (recipeId: string) => {
    if (!token) return;
    
    try {
      // Optimistic UI update - remove from list immediately
      setRecipes(prev => prev.filter(r => r.getId() !== recipeId));
      
      // Call the API to unsave the recipe
      await savedRecipesService.unsaveRecipe(recipeId, token);
      
    } catch (error) {
      console.error('Failed to unsave recipe:', error);
      
      // Restore the recipe to the list on error
      await fetchSavedRecipes();
      
      // Show error to user
      Alert.alert('Error', 'Failed to unsave recipe. Please try again.');
    }
  };

  const handleShareRecipe = async (recipe: RecipeModel) => {
    try {
      const result = await Share.share({
        message: `Check out this recipe: ${recipe.getTitle()}`,
        title: recipe.getTitle(),
      });
      
      if (result.action === Share.sharedAction) {
        // Recipe was shared successfully
        console.log('Recipe shared successfully');
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
      Alert.alert('Error', 'Failed to share recipe. Please try again.');
    }
  };

  const handleBrowseRecipes = () => {
    router.push('/(tabs)/explore');
  };

  if (!token) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={styles.title}>Please sign in to view saved recipes</Text>
          <TouchableOpacity 
            style={styles.testButton} 
            onPress={() => setToken('test-token-123')}
          >
            <Text style={styles.testButtonText}>Set Test Token (for debugging)</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Loader />
          <Text style={styles.loadingText}>Loading saved recipes...</Text>
        </View>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Screen>
    );
  }

  if (recipes.length === 0) {
    return (
      <Screen>
        <EmptySavedRecipes onBrowseRecipes={handleBrowseRecipes} />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} backgroundColor="#fff">
      <View style={styles.container}>
        {/* Header section matching frontend */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Saved Recipes</Text>
        </View>

        <View style={styles.content}>
          {/* Navigation to My Recipes */}
          <View style={styles.navigationSection}>
            <Text style={styles.navigationText}>
              Here are recipes you've saved. To create your own recipes, go to My Recipes.
            </Text>
            <TouchableOpacity 
              style={styles.myRecipesButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.myRecipesButtonText}>Go to My Recipes</Text>
            </TouchableOpacity>
          </View>
          
          <RecipeList
            recipes={recipes}
            onRecipePress={handleRecipePress}
            onSaveRecipe={handleUnsaveRecipe}
            onShareRecipe={handleShareRecipe}
            loading={loading}
            onRefresh={fetchSavedRecipes}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#fff',
  },
  headerSection: {
    backgroundColor: '#169873',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navigationSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  navigationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  myRecipesButton: {
    backgroundColor: '#169873',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  myRecipesButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#169873',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 4,
    marginTop: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


