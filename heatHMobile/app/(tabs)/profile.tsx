import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, RefreshControl, View, Image, Switch } from 'react-native';
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
import interestFormService from '@/services/interestFormService';
import { feedService, FeedResponse } from '@/services/feedService';
import { authService } from '@/services/authService';
import { storage } from '@/utils/storage';
import { ProfileData } from '@/models/User';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import { useThemePreference } from '@/context/ThemeContext';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function MyProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, logout } = useAuthContext();
  const { resolvedScheme, setPreference } = useThemePreference();
  const isDark = resolvedScheme === 'dark';
  
  // States for profile data
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // States for feeds
  const [userFeed, setUserFeed] = useState<FeedResponse[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  
  // States for UI
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleToggleDarkMode = (value: boolean) => {
    setPreference(value ? 'dark' : 'light');
  };

  // Load profile data and feeds
  useEffect(() => {
    
    // Debug: Check what token is currently stored at the very start
    const checkCurrentToken = async () => {
      try {
        const currentToken = await authService.getAccessToken();
        
        
        if (currentToken) {
          try {
            const payload = JSON.parse(atob(currentToken.split('.')[1]));
            
          } catch (e) {
          }
        }
      } catch (e) {
      }
    };
    
    checkCurrentToken();
    
    // Clear previous data when authentication state changes
    setProfileData(null);
    setUserFeed([]);
    setError(null);
    
    // Wait for authentication to complete
    if (authLoading) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please log in to view your profile');
      setLoadingProfile(false);
      setLoadingFeed(false);
      return;
    }

    

    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true);
        
        // Debug: Check what user is currently authenticated
        const token = await authService.getAccessToken();
        
        // Debug: Decode JWT to see username
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
          } catch (e) {
          }
        }
        
        const data = await interestFormService.getInterestForm();
        const profile = interestFormService.toProfileData(data);
        setProfileData(profile);
      } catch (err: any) {
        setError(`Failed to load profile data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoadingProfile(false);
      }
    };

    const fetchFeedByUser = async () => {
      try {
        setLoadingFeed(true);
        const data = await feedService.getFeedByUser();
        setUserFeed(data);
      } catch (err: any) {
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
      
      // Debug: Check current authentication state
      const currentToken = await authService.getAccessToken();
      
      if (currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
        } catch (e) {
        }
      }
      
      // Refetch both profile and feed data
      const [profileData, feedData] = await Promise.all([
        interestFormService.getInterestForm().then(interestFormService.toProfileData),
        feedService.getFeedByUser()
      ]);
      
      setProfileData(profileData);
      setUserFeed(feedData);
    } catch (err: any) {
      setError(`Failed to refresh data: ${err.message || 'Unknown error'}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };


  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/auth/sign-in');
    } catch (e) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
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
      setUserFeed(prev => prev.map(feed => 
        feed.id === feedId 
          ? { ...feed, likedByCurrentUser: !currentlyLiked }
          : feed
      ));
    } catch (err: any) {
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
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const renderFeedItem = (feed: FeedResponse) => (
    <Card key={feed.id} style={styles.feedItem}>
      {/* Post (text and/or image) */}
      {feed.type === 'POST' && (
        <>
          {feed.image && (
            <View style={styles.feedImageContainer}>
              <Image 
                source={{ uri: feed.image }} 
                style={styles.feedImage}
                resizeMode="cover"
              />
            </View>
          )}
          {feed.text && (
            <ThemedText style={styles.feedContent}>
              {feed.text}
            </ThemedText>
          )}
        </>
      )}

      {/* Recipe Feed */}
      {feed.type === 'RECIPE' && feed.recipe && (
        <>
          <ThemedText style={styles.recipeTitle}>
            {feed.recipe.title}
          </ThemedText>
          <View style={styles.recipeImageContainer}>
            <Image 
              source={{ uri: feed.recipe.photo }} 
              style={styles.recipeImage}
              resizeMode="cover"
            />
          </View>
          {feed.text && (
            <ThemedText style={styles.feedContent}>
              {feed.text}
            </ThemedText>
          )}
        </>
      )}
      
      <View style={styles.feedFooter}>
        <ThemedText style={styles.feedDate}>
          {new Date(feed.createdAt).toLocaleString()}
        </ThemedText>
        <ThemedText style={styles.likeCount}>
          {feed.likeCount} {feed.likeCount === 1 ? 'like' : 'likes'}
        </ThemedText>
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
          <ThemedText style={{ fontSize: 12, marginTop: 8 }}>
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
            <Spacer size={16} />
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

          <Spacer size={16} />
          <Divider />
          <Spacer size={12} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleLabelRow}>
              <IconSymbol name={isDark ? 'moon.fill' : 'sun.max.fill'} size={18} color={isDark ? '#ffd54f' : '#127d5d'} />
              <ThemedText style={[styles.infoLabel, styles.toggleLabelText]}>Dark Mode</ThemedText>
            </View>
            <Switch
              value={isDark}
              onValueChange={handleToggleDarkMode}
              trackColor={{ false: '#bdbdbd', true: '#127d5d' }}
              thumbColor={isDark ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </Card>

        {/* User Feeds */}
        <Card style={styles.feedsCard}>
          <ThemedText style={styles.sectionTitle}>Recent Activity</ThemedText>
          <Spacer size={16} />
          
          {userFeed.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>
                No recent activity yet. Start sharing your recipes!
              </ThemedText>
            </View>
          ) : (
            userFeed.map(renderFeedItem)
          )}
        </Card>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          <Button
            title="Logout"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
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
  
  // Profile Card Styles
  profileCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  editButton: {
    minWidth: 120,
    backgroundColor: '#169873',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  
  // Info Card Styles
  infoCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabelText: {
    marginLeft: 8,
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
    fontStyle: 'italic',
  },
  
  // Feed Item Styles
  feedItem: {
    marginBottom: 16,
    marginHorizontal: 0,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
  },
  feedContent: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  feedImageContainer: {
    width: '100%',
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  feedImage: {
    width: '100%',
    height: 200,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeImageContainer: {
    width: '100%',
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden',
    aspectRatio: 16/9,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  feedDate: {
    fontSize: 12,
  },
  likeCount: {
    fontSize: 12,
  },
});


