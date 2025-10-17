import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Screen from '@/components/layout/Screen';
import Section from '@/components/layout/Section';
import ProfileHeader from '@/components/user/ProfileHeader';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { userService } from '@/services/userService';
import { feedService, FeedResponse, FeedProfileResponse } from '@/services/feedService';
import { User } from '@/models/User';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function UserProfileScreen() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const router = useRouter();
  
  // States for user data
  const [user, setUser] = useState<User | null>(null);
  const [feeds, setFeeds] = useState<FeedResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load user profile data
  useEffect(() => {
    if (!username) return;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // For now, we'll use the current user's feeds
        // In a real implementation, you'd need a userId to get other user's profile
        const userFeeds = await feedService.getFeedByUser();
        
        // Create a mock user object from username
        const userData: User = {
          id: '1',
          username: username,
          name: 'User',
          surname: 'Name',
          profilePhoto: undefined,
        };
        
        setUser(userData);
        setFeeds(userFeeds);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleRefresh = async () => {
    if (!username) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      const [userData, userFeeds] = await Promise.all([
        userService.byUsername(username),
        feedService.getFeedByUser()
      ]);
      
      setUser(userData);
      setFeeds(userFeeds);
    } catch (err: any) {
      console.error('Error refreshing user profile:', err);
      setError('Failed to refresh profile');
    } finally {
      setRefreshing(false);
    }
  };

  const handleFollow = async () => {
    try {
      // TODO: Implement follow functionality
      Alert.alert('Info', 'Follow functionality not implemented yet');
    } catch (err: any) {
      console.error('Error following user:', err);
      Alert.alert('Error', 'Failed to follow user');
    }
  };

  const handleLikeFeed = async (feedId: number, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await feedService.unlikeFeed(feedId);
      } else {
        await feedService.likeFeed(feedId);
      }
      
      // Update local state
      setFeeds(prev => prev.map(feed => 
        feed.id === feedId 
          ? { ...feed, likedByCurrentUser: !currentlyLiked }
          : feed
      ));
    } catch (err: any) {
      console.error('Error toggling like:', err);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleSaveRecipe = async (recipeId: number, currentlySaved: boolean) => {
    try {
      if (currentlySaved) {
        await feedService.unsaveRecipe(recipeId);
      } else {
        await feedService.saveRecipe(recipeId);
      }
      
      Alert.alert('Success', `Recipe ${currentlySaved ? 'unsaved' : 'saved'} successfully!`);
    } catch (err: any) {
      console.error('Error toggling save:', err);
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const renderFeedItem = (feed: FeedResponse) => (
    <ThemedView key={feed.id} style={styles.feedItem}>
      <ThemedText style={styles.feedContent}>
        {feed.text || 'Recipe post'}
      </ThemedText>
      <ThemedText style={styles.feedDate}>
        {new Date(feed.createdAt).toLocaleDateString()}
      </ThemedText>
      {feed.type === 'RECIPE' && feed.recipe && (
        <ThemedText style={styles.recipeTitle}>
          {feed.recipe.title}
        </ThemedText>
      )}
      <ThemedView style={styles.feedActions}>
        <Button
          title={feed.likedByCurrentUser ? 'Unlike' : 'Like'}
          onPress={() => handleLikeFeed(feed.id, feed.likedByCurrentUser)}
          style={styles.actionButton}
        />
        {feed.type === 'RECIPE' && feed.recipe && (
          <Button
            title="Save Recipe"
            onPress={() => handleSaveRecipe(feed.recipe.id, false)}
            style={[styles.actionButton, styles.saveButton]}
          />
        )}
      </ThemedView>
    </ThemedView>
  );

  if (loading) {
    return (
      <Screen>
        <ThemedView style={styles.loadingContainer}>
          <Loader />
          <ThemedText>Loading profile...</ThemedText>
        </ThemedView>
      </Screen>
    );
  }

  if (error || !user) {
    return (
      <Screen>
        <ThemedView style={styles.errorContainer}>
          <ErrorMessage message={error || 'User not found'} />
          <Button title="Go Back" onPress={() => router.back()} />
        </ThemedView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <ProfileHeader 
          user={user}
          showStats={true}
          postCount={feeds.length}
          followerCount={0} // TODO: Implement follower count
          followingCount={0} // TODO: Implement following count
        />

        {/* Follow Button */}
        <ThemedView style={styles.actionSection}>
          <Button 
            title="Follow" 
            onPress={handleFollow}
            style={styles.followButton}
          />
        </ThemedView>

        {/* User Feeds */}
        <ThemedView style={styles.feedsSection as any}>
          <ThemedText style={styles.sectionTitle}>Posts</ThemedText>
          {feeds.length === 0 ? (
            <ThemedText style={styles.emptyText}>
              No posts yet.
            </ThemedText>
          ) : (
            feeds.map(renderFeedItem)
          )}
        </ThemedView>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionSection: {
    padding: 20,
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: '#007AFF',
    minWidth: 120,
  },
  feedsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  feedItem: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  feedContent: {
    fontSize: 16,
    marginBottom: 8,
  },
  feedDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  feedActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    padding: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
});