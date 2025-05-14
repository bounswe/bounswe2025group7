import React, { useEffect, useState } from 'react';
import { View, FlatList, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import FeedCard from '../../components/FeedCard'; // adjust path if needed
import apiClient from '../../services/apiClient'; // your Axios instance

const FeedScreen = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchFeeds = async (pageToFetch = 0, isRefresh = false) => {
    try {
      console.log(`Fetching feeds, page: ${pageToFetch}, isRefresh: ${isRefresh}`);

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [feedsRes, savedRes] = await Promise.all([
        apiClient.get('/feeds/recent', { params: { pageNumber: pageToFetch } }),
        apiClient.get('/saved-recipes/get'),
      ]);

      const savedRecipeIds = savedRes.data.map(recipe => recipe.recipeId);

      const fetchedFeeds = feedsRes.data.map(feed => ({
        ...feed,
        savedByCurrentUser:
          feed.type === 'RECIPE' && feed.recipe
            ? savedRecipeIds.includes(feed.recipe.id)
            : false,
      }));


      if (isRefresh) {
        setFeeds(fetchedFeeds);
      } else {
        setFeeds(prev => [...prev, ...fetchedFeeds]);
      }

      setHasMore(fetchedFeeds.length > 0);
    } catch (error) {
      console.error('Failed to fetch feeds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreFeeds = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      console.log(`Loading more feeds, page: ${nextPage}`);
      setPage(nextPage);
      fetchFeeds(nextPage);
    }
  };

  const handleRefresh = () => {
    console.log('Refreshing feeds');
    setPage(0);
    fetchFeeds(0, true);
  };

  useEffect(() => {
    console.log('Component mounted, fetching initial feeds');
    fetchFeeds(0, true);
  }, []);

  const renderItem = ({ item }) => {
    return <FeedCard feed={item} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={feeds}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        onEndReached={loadMoreFeeds}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          loading && !refreshing ? <ActivityIndicator size="large" style={styles.loader} /> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  loader: {
    marginVertical: 20,
  },
});

export default FeedScreen;
