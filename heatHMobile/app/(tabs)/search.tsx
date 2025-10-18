import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  Image 
} from 'react-native';
import { semanticSearchService } from '@/services/semanticSearchService';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await semanticSearchService.search(query, 10);
      setResults(data.results || data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to search recipes');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeItem = ({ item }: { item: any }) => (
    <View style={styles.recipeCard}>
      {item.photo && (
        <Image 
          source={{ uri: item.photo }} 
          style={styles.recipeImage}
          resizeMode="cover"
        />
      )}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title || 'Untitled Recipe'}</Text>
        {item.tag && <Text style={styles.recipeTag}>Tag: {item.tag}</Text>}
        {item.type && <Text style={styles.recipeType}>Type: {item.type}</Text>}
        {item.totalCalorie !== undefined && (
          <Text style={styles.recipeCalories}>Calories: {item.totalCalorie}</Text>
        )}
        {item.price !== undefined && (
          <Text style={styles.recipePrice}>Price: ${item.price.toFixed(2)}</Text>
        )}
        {item.similarity !== undefined && (
          <Text style={styles.recipeSimilarity}>
            Match: {(item.similarity * 100).toFixed(1)}%
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for recipes..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
          <Text style={styles.loadingText}>Searching recipes...</Text>
        </View>
      )}

      {!loading && results.length === 0 && query && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found. Try a different search.</Text>
        </View>
      )}

      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          renderItem={renderRecipeItem}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={true}
        />
      )}

      {!query && !loading && results.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Enter a search query to find recipes using semantic search
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#FF6347',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  recipeTag: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipeType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recipeCalories: {
    fontSize: 14,
    color: '#FF6347',
    marginBottom: 4,
    fontWeight: '500',
  },
  recipePrice: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 4,
    fontWeight: '500',
  },
  recipeSimilarity: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 4,
  },
});

