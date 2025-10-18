import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert,
  RefreshControl,
  Dimensions
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeColors } from '../../hooks/useThemeColors';
import { recipeService } from '../../services/recipeService';
import ShareModal from '../../components/ShareModal';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

interface SavedRecipe {
  recipeId: number;
  title: string;
  photo: string;
}

export default function SavedRecipesScreen() {
  const { colors, textColors, fonts, lineHeights } = useThemeColors();
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);

  // Fetch saved recipes
  const fetchSavedRecipes = async () => {
    try {
      setError(null);
      const recipes = await recipeService.getSavedRecipes();
      setSavedRecipes(recipes);
    } catch (err: any) {
      console.error('Error fetching saved recipes:', err);
      setError('Failed to load saved recipes. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load saved recipes on component mount
  useEffect(() => {
    fetchSavedRecipes();
  }, []);

  // Refetch saved recipes when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Only refetch if we're not already loading
      if (!loading) {
        fetchSavedRecipes();
      }
    }, [loading])
  );

  // Handle pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedRecipes();
  };

  // Handle unsave recipe
  const handleUnsaveRecipe = async (recipeId: number) => {
    Alert.alert(
      'Remove Recipe',
      'Are you sure you want to remove this recipe from your saved recipes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              await recipeService.unsaveRecipe(recipeId);
              // Remove from local state
              setSavedRecipes(prev => prev.filter(recipe => recipe.recipeId !== recipeId));
              Alert.alert('Success', 'Recipe removed from saved recipes');
            } catch (err: any) {
              console.error('Error unsaving recipe:', err);
              Alert.alert('Error', 'Failed to remove recipe. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Handle recipe press (navigation to recipe detail)
  const handleRecipePress = (recipe: SavedRecipe) => {
    // TODO: Navigate to recipe detail page
    Alert.alert('Recipe Detail', `Navigate to recipe: ${recipe.title}`);
  };

  // Handle share recipe - show share modal
  const handleShareRecipe = (recipe: SavedRecipe) => {
    setSelectedRecipe(recipe);
    setShareModalVisible(true);
  };

  // Close share modal
  const closeShareModal = () => {
    setShareModalVisible(false);
    setSelectedRecipe(null);
  };

  // Render recipe card
  const renderRecipeCard = (recipe: SavedRecipe) => (
    <View key={recipe.recipeId} style={[styles.recipeCard, { backgroundColor: colors.white }]}>
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={() => handleRecipePress(recipe)}
        activeOpacity={0.8}
      >
        <Image 
          source={{ uri: recipe.photo }} 
          style={styles.recipeImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.recipeContent}>
        <Text style={[styles.recipeTitle, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]} numberOfLines={2}>
          {recipe.title}
        </Text>
        
        <View style={styles.recipeActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleRecipePress(recipe)}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>View</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.unsaveButton, { backgroundColor: colors.error }]}
            onPress={() => handleUnsaveRecipe(recipe.recipeId)}
          >
            <Text style={[styles.actionButtonText, styles.unsaveButtonText, { color: colors.white }]}>Unsave</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => handleShareRecipe(recipe)}
          >
            <Text style={[styles.actionButtonText, { color: colors.white }]}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyText, { color: textColors.disabled, fontFamily: fonts.regular, lineHeight: lineHeights.lg }]}>No saved recipes yet</Text>
      <Text style={[styles.emptyDescription, { color: textColors.disabled, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
        Recipes you save will appear here
      </Text>
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Loading saved recipes...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>Saved Recipes</Text>
          <Text style={[styles.subtitle, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Your Bookmarked Recipes</Text>
          
          {error && (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '10', borderLeftColor: colors.error }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
              <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.error }]} onPress={fetchSavedRecipes}>
                <Text style={[styles.retryButtonText, { color: colors.white }]}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {savedRecipes.length === 0 && !error ? (
            renderEmptyState()
          ) : (
            <View style={styles.recipesGrid}>
              {savedRecipes.map(renderRecipeCard)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Share Modal */}
      <ShareModal
        visible={shareModalVisible}
        onClose={closeShareModal}
        item={selectedRecipe}
        baseUrl="https://heath.app"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recipesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recipeCard: {
    width: cardWidth,
    borderRadius: 12,
    marginBottom: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: cardWidth * 0.75, // 4:3 aspect ratio
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  recipeContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    marginHorizontal: 2,
  },
  unsaveButton: {
    // Dynamic styling applied in component
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  unsaveButtonText: {
    // Dynamic styling applied in component
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
});

