import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Share, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { RecipeModel } from '@/models/Recipe';
import Screen from '@/components/layout/Screen';
import Loader from '@/components/ui/Loader';
import RecipeList from '@/components/recipes/RecipeList';
import EmptySavedRecipes from '@/components/recipes/EmptySavedRecipes';

export default function SavedScreen() {
  const [recipes, setRecipes] = useState<RecipeModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Load mock data on component mount
  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const mockRecipes = [
        new RecipeModel({
          id: '1',
          title: 'Delicious Pasta Carbonara',
          photo: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Pasta+Carbonara',
          instructions: ['Boil pasta', 'Cook bacon', 'Mix with eggs and cheese'],
          totalCalory: 450,
          ingredients: ['Pasta', 'Bacon', 'Eggs', 'Parmesan'],
          tag: 'Italian',
          price: 15,
          type: 'Main Course',
          healthinessScore: 7,
          easinessScore: 6,
          whoShared: null,
        }),
        new RecipeModel({
          id: '2',
          title: 'Healthy Quinoa Bowl',
          photo: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Quinoa+Bowl',
          instructions: ['Cook quinoa', 'Add vegetables', 'Top with dressing'],
          totalCalory: 320,
          ingredients: ['Quinoa', 'Vegetables', 'Dressing'],
          tag: 'Healthy',
          price: 12,
          type: 'Main Course',
          healthinessScore: 9,
          easinessScore: 8,
          whoShared: null,
        }),
        new RecipeModel({
          id: '3',
          title: 'Chocolate Chip Cookies',
          photo: 'https://via.placeholder.com/300x200/FFD93D/FFFFFF?text=Chocolate+Cookies',
          instructions: ['Mix ingredients', 'Bake for 12 minutes', 'Let cool'],
          totalCalory: 180,
          ingredients: ['Flour', 'Chocolate chips', 'Butter', 'Sugar'],
          tag: 'Dessert',
          price: 8,
          type: 'Dessert',
          healthinessScore: 3,
          easinessScore: 7,
          whoShared: null,
        }),
        new RecipeModel({
          id: '4',
          title: 'Grilled Salmon',
          photo: 'https://via.placeholder.com/300x200/FF8A80/FFFFFF?text=Grilled+Salmon',
          instructions: ['Season salmon', 'Grill for 6 minutes per side', 'Serve with lemon'],
          totalCalory: 280,
          ingredients: ['Salmon fillet', 'Lemon', 'Herbs', 'Olive oil'],
          tag: 'Healthy',
          price: 22,
          type: 'Main Course',
          healthinessScore: 9,
          easinessScore: 5,
          whoShared: null,
        }),
      ];
      
      mockRecipes.forEach(recipe => {
        recipe.setSaved(true);
        recipe.setLiked(false);
        recipe.setShared(false);
      });
      
      setRecipes(mockRecipes);
      setLoading(false);
    }, 1000);
  };

  const handleRecipePress = (recipe: RecipeModel) => {
    // Navigate to the recipe detail page
    router.push(`/recipes/${recipe.getId()}`);
  };

  const handleUnsaveRecipe = (recipeId: string) => {
    // Simply remove from the list (mock behavior)
    setRecipes(prev => prev.filter(r => r.getId() !== recipeId));
  };

  const handleShareRecipe = async (recipe: RecipeModel) => {
    try {
      const result = await Share.share({
        message: `Check out this recipe: ${recipe.getTitle()}`,
        title: recipe.getTitle(),
      });
      
      if (result.action === Share.sharedAction) {
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
            onRefresh={loadMockData}
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
});


