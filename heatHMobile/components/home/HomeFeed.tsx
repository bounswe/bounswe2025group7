import { useState, useEffect } from 'react';
import { FlatList, Text, ActivityIndicator, View } from 'react-native';
import HomeSection from './HomeSection';
import { feedService, FeedResponse } from '@/services/feedService';
import FeedCard from './FeedCard';

export default function HomeFeed() {
  const [feeds, setFeeds] = useState<FeedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        
        // User should already be authenticated through AuthContext
        console.log('Fetching feeds for authenticated user...');
        const response = await feedService.getRecentFeeds(0);
        console.log('Feeds fetched successfully:', response.length, 'items');
        setFeeds(response);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch feeds:', err);
        setError(err.message || 'Failed to load feeds');
      } finally {
        setLoading(false);
      }
    };

    fetchFeeds();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <HomeSection title="Feed">
        {loading && (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" />
          </View>
        )}
        
        {error && (
          <View style={{ padding: 20 }}>
            <Text style={{ color: 'red' }}>{error}</Text>
          </View>
        )}
      </HomeSection>
      
      {!loading && !error && (
        <FlatList
          data={feeds}
          keyExtractor={(item) => `feed-${item.id}`}
          contentContainerStyle={{ padding: 10, flexGrow: 1 }}
          renderItem={({ item }) => <FeedCard feed={item} />}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          style={{ flex: 1 }}
        />
      )}
    </View>
  );
}


