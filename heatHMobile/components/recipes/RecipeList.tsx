import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, RefreshControl } from 'react-native';
import { RecipeModel } from '@/models/Recipe';
import RecipeCard from './RecipeCard';

const { width } = Dimensions.get('window');
const isTablet = width > 768;
const numColumns = isTablet ? 3 : 2;

interface RecipeListProps {
  recipes: RecipeModel[];
  onRecipePress: (recipe: RecipeModel) => void;
  onSaveRecipe?: (recipeId: string) => void;
  onShareRecipe?: (recipe: RecipeModel) => void;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function RecipeList({ 
  recipes, 
  onRecipePress, 
  onSaveRecipe, 
  onShareRecipe,
  loading = false,
  onRefresh
}: RecipeListProps) {
  const renderRecipe = ({ item }: { item: RecipeModel }) => (
    <RecipeCard
      recipe={item}
      onPress={onRecipePress}
      onSave={onSaveRecipe}
      onShare={onShareRecipe}
      showSaveButton={true}
      showShareButton={true}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No saved recipes found</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={recipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => `recipe-${item.getId()}`}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor="#169873"
              colors={['#169873']}
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmptyComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={numColumns === 1 ? (data, index) => ({
          length: 200, // Approximate height of RecipeCard
          offset: 200 * index,
          index,
        }) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexGrow: 1,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  separator: {
    height: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '500',
  },
});


