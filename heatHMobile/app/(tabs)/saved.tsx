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
import { useRouter } from 'expo-router';
import { colors, textColors } from '../../constants/theme';
import { recipeService } from '../../services/recipeService';
import ShareModal from '../../components/ShareModal';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

interface SavedRecipe {
  recipeId: number;
  title: string;
  photo: string;
}

export default function SavedRecipesScreen() {
  const router = useRouter();
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
    router.push({ pathname: '/recipeDetail/recipeDetail', params: { recipeId: String(recipe.recipeId) } });
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
    <View key={recipe.recipeId} style={styles.recipeCard}>
      <TouchableOpacity 
        style={styles.imageContainer}
        onPress={() => handleRecipePress(recipe)}
        activeOpacity={0.85}
      >
        <Image 
          source={{ uri: recipe.photo }} 
          style={styles.recipeImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.recipeContent}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {recipe.title}
        </Text>
        
        <View style={styles.actionRow}>
          <TouchableOpacity 
            accessibilityLabel="View recipe"
            style={styles.iconButton}
            onPress={() => handleRecipePress(recipe)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            accessibilityLabel="Share recipe"
            style={styles.iconButton}
            onPress={() => handleShareRecipe(recipe)}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            accessibilityLabel="Unsave recipe"
            style={styles.iconButton}
            onPress={() => handleUnsaveRecipe(recipe.recipeId)}
            activeOpacity={0.8}
          >
            <Ionicons name="bookmark" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="bookmark-outline" size={56} color={textColors.disabled} />
      <Text style={styles.emptyText}>No saved recipes yet</Text>
      <Text style={styles.emptyDescription}>
        Recipes you save will appear here
      </Text>
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={() => router.push('/(tabs)/search')}
        activeOpacity={0.85}
      >
        <Ionicons name="search-outline" size={16} color={colors.white} />
        <Text style={styles.ctaButtonText}>Browse recipes</Text>
      </TouchableOpacity>
    </View>
  );

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading saved recipes...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
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
          <Text style={styles.title}>Saved Recipes</Text>
          <Text style={styles.subtitle}>Your Bookmarked Recipes</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchSavedRecipes}>
                <Text style={styles.retryButtonText}>Retry</Text>
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
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: textColors.primary,
  },
  subtitle: {
    fontSize: 18,
    color: textColors.secondary,
    marginBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: textColors.secondary,
  },
  errorContainer: {
    backgroundColor: colors.error + '10',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: colors.white,
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
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: colors.black,
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
  // removed overlay unsave FAB in favor of right-aligned row icons
  recipeContent: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 12,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    backgroundColor: colors.primary,
    marginHorizontal: 2,
  },
  iconButton: {
    width: 38,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: colors.primary + '22',
  },
  unsaveButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  unsaveButtonText: {
    color: colors.white,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.disabled,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: textColors.disabled,
    textAlign: 'center',
  },
  ctaButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  ctaButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
});

