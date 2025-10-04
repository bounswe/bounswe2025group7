import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, RefreshControl, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Screen from '@/components/layout/Screen';
import Section from '@/components/layout/Section';
import Avatar from '@/components/user/Avatar';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Card from '@/components/ui/Card';
import Divider from '@/components/ui/Divider';
import Grid from '@/components/ui/Grid';
import Badge from '@/components/ui/Badge';
import Spacer from '@/components/ui/Spacer';
import { interestFormService } from '@/services/interestFormService';
import { feedService, FeedResponse } from '@/services/feedService';
import { ProfileData } from '@/models/User';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';

export default function MyProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  
  // States for profile data
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // States for feeds
  const [userFeed, setUserFeed] = useState<FeedResponse[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  // States for UI
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load profile data and feeds
  useEffect(() => {
    console.log('👤 Profile - useEffect triggered - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
    
    // Wait for authentication to complete
    if (authLoading) {
      console.log('👤 Profile - Waiting for auth to complete...');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('👤 Profile - User not authenticated, showing error');
      setError('Please log in to view your profile');
      setLoadingProfile(false);
      setLoadingFeed(false);
      return;
    }

    console.log('👤 Profile - User authenticated, fetching data...');
    // Clear any previous errors
    setError(null);

    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true);
        console.log('Fetching profile data...');
        const data = await interestFormService.getInterestForm();
        console.log('Profile data received:', data);
        const profile = interestFormService.toProfileData(data);
        console.log('Profile data converted:', profile);
        setProfileData(profile);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(`Failed to load profile data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchFeedByUser = async () => {
      try {
        setLoadingFeed(true);
        console.log('Fetching feed data...');
        const data = await feedService.getFeedByUser();
        console.log('Feed data received:', data);
        setUserFeed(data);
      } catch (err: any) {
        console.error('Error fetching feeds:', err);
        setError(`Failed to load feeds: ${err.message || 'Unknown error'}`);
      } finally {
        setLoadingFeed(false);
      }
    };

    // Fetch data if authenticated
    fetchProfileData();
    fetchFeedByUser();
  }, [isAuthenticated, authLoading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError(null);
    
    try {
      console.log('Starting refresh...');
      
      // Refetch both profile and feed data
      const [profileData, feedData] = await Promise.all([
        interestFormService.getInterestForm().then(interestFormService.toProfileData),
        feedService.getFeedByUser()
      ]);
      
      console.log('Refresh successful:', { profileData, feedData });
      setProfileData(profileData);
      setUserFeed(feedData);
    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(`Failed to refresh data: ${err.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleLikeFeed = async (feedId: number, currentlyLiked: boolean) => {
    try {
      if (currentlyLiked) {
        await feedService.unlikeFeed(feedId);
      } else {
        await feedService.likeFeed(feedId);
      }
      
      // Update local state
      setUserFeed(prev => prev.map(feed => 
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
      
      // Update local state - note: this would need to be handled differently
      // as saved recipes are separate from feeds
      Alert.alert('Success', `Recipe ${currentlySaved ? 'unsaved' : 'saved'} successfully!`);
    } catch (err: any) {
      console.error('Error toggling save:', err);
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const renderFeedItem = (feed: FeedResponse) => (
    <Card key={feed.id} style={styles.feedItem}>
      <View style={styles.feedHeader}>
        <Badge label={feed.type} />
        <ThemedText style={styles.feedDate}>
          {new Date(feed.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      
      <Spacer size={8} />
      
      <ThemedText style={styles.feedContent}>
        {feed.text || 'Recipe post'}
      </ThemedText>
      
      {feed.type === 'RECIPE' && feed.recipe && (
        <>
          <Spacer size={8} />
          <ThemedText style={styles.recipeTitle}>
            {feed.recipe.title}
          </ThemedText>
        </>
      )}
      
      <Spacer size={12} />
      
      <View style={styles.feedActions}>
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
      </View>
    </Card>
  );

  if (authLoading || loadingProfile || loadingFeed) {
    return (
      <Screen>
        <ThemedView style={styles.loadingContainer}>
          <Loader />
          <ThemedText>
            {authLoading ? 'Logging in...' : 'Loading profile...'}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
            Auth: {isAuthenticated ? 'Yes' : 'No'} | Loading: {authLoading ? 'Yes' : 'No'}
          </ThemedText>
        </ThemedView>
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen>
        <ThemedView style={styles.errorContainer}>
          <ErrorMessage message={error} />
          {error.includes('log in') ? (
            <Button title="Go to Sign In" onPress={() => router.push('/auth/sign-in')} />
          ) : (
            <Button title="Retry" onPress={handleRefresh} />
          )}
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
        {/* Profile Header Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar 
              uri={profileData?.profilePhoto} 
              size={120} 
            />
            <Spacer size={16} />
            <ThemedText style={styles.profileName}>
              {profileData?.firstName} {profileData?.lastName}
            </ThemedText>
            <Spacer size={8} />
            <Button 
              title="Edit Profile" 
              onPress={handleEditProfile}
              style={styles.editButton}
            />
          </View>
        </Card>

        {/* Profile Information Grid */}
        <Card style={styles.infoCard}>
          <ThemedText style={styles.sectionTitle}>Profile Information</ThemedText>
          <Spacer size={16} />
          
          <Grid container spacing={16}>
            {profileData?.weight && (
              <Grid item xs={6}>
                <ThemedText style={styles.infoLabel}>Weight</ThemedText>
                <ThemedText style={styles.infoValue}>{profileData.weight} kg</ThemedText>
              </Grid>
            )}
            {profileData?.height && (
              <Grid item xs={6}>
                <ThemedText style={styles.infoLabel}>Height</ThemedText>
                <ThemedText style={styles.infoValue}>{profileData.height} cm</ThemedText>
              </Grid>
            )}
            {profileData?.gender && (
              <Grid item xs={6}>
                <ThemedText style={styles.infoLabel}>Gender</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {profileData.gender.charAt(0).toUpperCase() + profileData.gender.slice(1)}
                </ThemedText>
              </Grid>
            )}
            {profileData?.dateOfBirth && (
              <Grid item xs={6}>
                <ThemedText style={styles.infoLabel}>Date of Birth</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {(() => {
                    try {
                      return new Date(profileData.dateOfBirth).toLocaleDateString();
                    } catch (e) {
                      return profileData.dateOfBirth;
                    }
                  })()}
                </ThemedText>
              </Grid>
            )}
          </Grid>
        </Card>

        {/* User Feeds */}
        <Card style={styles.feedsCard}>
          <ThemedText style={styles.sectionTitle}>My Posts</ThemedText>
          <Spacer size={16} />
          
          {userFeed.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                No posts yet. Start sharing your recipes!
              </ThemedText>
            </View>
          ) : (
            userFeed.map(renderFeedItem)
          )}
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  
  // Profile Card Styles
  profileCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  editButton: {
    marginTop: 8,
    minWidth: 120,
  },
  
  // Info Card Styles
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  
  // Feeds Card Styles
  feedsCard: {
    margin: 16,
    marginTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Feed Item Styles
  feedItem: {
    marginBottom: 12,
    marginHorizontal: 0,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedDate: {
    fontSize: 12,
    color: '#666',
  },
  feedContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  feedActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
});


