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
import interestFormService from '@/services/interestFormService';
import { feedService, FeedResponse } from '@/services/feedService';
import { authService } from '@/services/authService';
import { storage } from '@/utils/storage';
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
    
    // Debug: Check what token is currently stored at the very start
    const checkCurrentToken = async () => {
      try {
        const currentToken = await authService.getAccessToken();
        console.log('👤 Profile - Current token at start of useEffect:', currentToken ? `Token exists (${currentToken.substring(0, 20)}...)` : 'No token');
        
        if (currentToken) {
          try {
            const payload = JSON.parse(atob(currentToken.split('.')[1]));
            console.log('👤 Profile - Token user at start of useEffect:', payload.sub);
            console.log('👤 Profile - Token issued at:', new Date(payload.iat * 1000));
            console.log('👤 Profile - Token expires at:', new Date(payload.exp * 1000));
          } catch (e) {
            console.log('👤 Profile - Could not decode token at start:', e);
          }
        }
      } catch (e) {
        console.log('👤 Profile - Error checking token at start:', e);
      }
    };
    
    checkCurrentToken();
    
    // Clear previous data when authentication state changes
    setProfileData(null);
    setUserFeed([]);
    setError(null);
    
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

    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true);
        console.log('Fetching profile data...');
        
        // Debug: Check what user is currently authenticated
        const token = await authService.getAccessToken();
        console.log('Current token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token');
        
        // Debug: Decode JWT to see username
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('JWT payload:', payload);
            console.log('Current username from JWT:', payload.sub);
          } catch (e) {
            console.log('Could not decode JWT:', e);
          }
        }
        
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
      console.log('🔄 Starting refresh...');
      
      // Debug: Check current authentication state
      const currentToken = await authService.getAccessToken();
      console.log('🔄 Current token during refresh:', currentToken ? `Token exists (${currentToken.substring(0, 20)}...)` : 'No token');
      
      if (currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          console.log('🔄 JWT payload during refresh:', payload);
          console.log('🔄 Username from JWT during refresh:', payload.sub);
        } catch (e) {
          console.log('🔄 Could not decode JWT during refresh:', e);
        }
      }
      
      // Refetch both profile and feed data
      const [profileData, feedData] = await Promise.all([
        interestFormService.getInterestForm().then(interestFormService.toProfileData),
        feedService.getFeedByUser()
      ]);
      
      console.log('🔄 Refresh successful:', { profileData, feedData });
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

  const handleDebugAuth = async () => {
    console.log('🔍 DEBUG: Starting authentication debug...');
    
    // Check AuthContext state
    console.log('🔍 AuthContext state:', { isAuthenticated, authLoading });
    
    // Check stored token
    const storedToken = await authService.getAccessToken();
    console.log('🔍 Stored token:', storedToken ? `Token exists (${storedToken.substring(0, 20)}...)` : 'No token');
    
    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        console.log('🔍 JWT payload:', payload);
        console.log('🔍 Username from JWT:', payload.sub);
        console.log('🔍 Token issued at:', new Date(payload.iat * 1000));
        console.log('🔍 Token expires at:', new Date(payload.exp * 1000));
        
        // Check if this matches the current user
        console.log('🔍 Current user should be: yigitmemcer3@gmail.com');
        console.log('🔍 Token user is:', payload.sub);
        console.log('🔍 Users match:', payload.sub === 'yigitmemcer3@gmail.com');
      } catch (e) {
        console.log('🔍 Could not decode JWT:', e);
      }
    }
    
    // Check all stored tokens
    console.log('🔍 Checking all stored tokens...');
    try {
      const accessToken = await storage.getItem('accessToken');
      const refreshToken = await storage.getItem('refreshToken');
      console.log('🔍 Access token in storage:', accessToken ? `Token exists (${accessToken.substring(0, 20)}...)` : 'No token');
      console.log('🔍 Refresh token in storage:', refreshToken ? `Token exists (${refreshToken.substring(0, 20)}...)` : 'No token');
      
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          console.log('🔍 Storage access token user:', payload.sub);
        } catch (e) {
          console.log('🔍 Could not decode storage access token:', e);
        }
      }
    } catch (e) {
      console.log('🔍 Error checking storage:', e);
    }
    
    // Test API call
    try {
      console.log('🔍 Testing API call...');
      const testData = await interestFormService.getInterestForm();
      console.log('🔍 API response:', testData);
      
      // Test a different endpoint to see if the issue is specific to get-form
      console.log('🔍 Testing check-first-login endpoint...');
      try {
        const checkResponse = await interestFormService.testAuthentication();
        console.log('🔍 Check-first-login response:', checkResponse);
      } catch (checkError) {
        console.log('🔍 Check-first-login failed:', checkError);
      }
      
      // Test user service to see if we can get current user info
      console.log('🔍 Testing user service...');
      try {
        const { userService } = await import('@/services/userService');
        const userInfo = await userService.me();
        console.log('🔍 User service response:', userInfo);
      } catch (userError) {
        console.log('🔍 User service failed:', userError);
      }
      
      // Test feed service to see if it returns user-specific data
      console.log('🔍 Testing feed service...');
      try {
        const { feedService } = await import('@/services/feedService');
        const feedData = await feedService.getFeedByUser();
        console.log('🔍 Feed service response:', feedData);
      } catch (feedError) {
        console.log('🔍 Feed service failed:', feedError);
      }
    } catch (e) {
      console.log('🔍 API call failed:', e);
    }
  };

  const handleForceTokenRefresh = async () => {
    console.log('🔄 Force Token Refresh: Starting...');
    
    // Clear all storage
    await storage.clear();
    console.log('🔄 Force Token Refresh: Storage cleared');
    
    // Redirect to sign-in
    router.replace('/auth/sign-in');
    console.log('🔄 Force Token Refresh: Redirected to sign-in');
  };

  const handleClearAllTokens = async () => {
    console.log('🧹 Clear All Tokens: Starting...');
    
    // Clear all storage
    await storage.clear();
    console.log('🧹 Clear All Tokens: Storage cleared');
    
    // Also clear AuthContext token
    const { logout } = useAuthContext();
    await logout();
    console.log('🧹 Clear All Tokens: AuthContext cleared');
    
    // Redirect to sign-in
    router.replace('/auth/sign-in');
    console.log('🧹 Clear All Tokens: Redirected to sign-in');
  };

  const handleForceCleanLogin = async () => {
    console.log('🧽 Force Clean Login: Starting...');
    
    // Clear all storage completely
    await storage.clear();
    console.log('🧽 Force Clean Login: Storage cleared');
    
    // Clear AuthContext
    const { logout } = useAuthContext();
    await logout();
    console.log('🧽 Force Clean Login: AuthContext cleared');
    
    // Wait a moment to ensure everything is cleared
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('🧽 Force Clean Login: Wait completed');
    
    // Redirect to sign-in
    router.replace('/auth/sign-in');
    console.log('🧽 Force Clean Login: Redirected to sign-in');
  };

  const handleCheckTokenOnly = async () => {
    console.log('🔍 Check Token Only: Starting...');
    
    try {
      const token = await authService.getAccessToken();
      console.log('🔍 Check Token Only: Token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token');
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔍 Check Token Only: Token user:', payload.sub);
          console.log('🔍 Check Token Only: Token issued at:', new Date(payload.iat * 1000));
          console.log('🔍 Check Token Only: Token expires at:', new Date(payload.exp * 1000));
        } catch (e) {
          console.log('🔍 Check Token Only: Could not decode token:', e);
        }
      }
      
      // Also check what's in storage directly
      const accessToken = await storage.getItem('accessToken');
      const refreshToken = await storage.getItem('refreshToken');
      console.log('🔍 Check Token Only: Access token in storage:', accessToken ? `Token exists (${accessToken.substring(0, 20)}...)` : 'No token');
      console.log('🔍 Check Token Only: Refresh token in storage:', refreshToken ? `Token exists (${refreshToken.substring(0, 20)}...)` : 'No token');
      
      if (accessToken) {
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          console.log('🔍 Check Token Only: Storage access token user:', payload.sub);
        } catch (e) {
          console.log('🔍 Check Token Only: Could not decode storage access token:', e);
        }
      }
    } catch (e) {
      console.log('🔍 Check Token Only: Error:', e);
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
            style={styles.saveButton}
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
                   <Spacer size={8} />
                   <Button 
                     title="🔍 Debug Auth" 
                     onPress={handleDebugAuth}
                     style={styles.debugButton}
                   />
                   <Spacer size={8} />
                   <Button 
                     title="🧹 Clear Storage" 
                     onPress={handleForceTokenRefresh}
                     style={styles.clearButton}
                   />
                   <Spacer size={8} />
                   <Button 
                     title="🔄 Force Refresh" 
                     onPress={handleForceTokenRefresh}
                     style={styles.refreshButton}
                   />
                   <Spacer size={8} />
                   <Button 
                     title="🧹 Clear All Tokens" 
                     onPress={handleClearAllTokens}
                     style={styles.clearAllButton}
                   />
                   <Spacer size={8} />
                   <Button 
                     title="🔍 Check Token Only" 
                     onPress={handleCheckTokenOnly}
                     style={styles.checkTokenButton}
                   />
                   <Spacer size={8} />
                   <Button 
                     title="🧽 Force Clean Login" 
                     onPress={handleForceCleanLogin}
                     style={styles.forceCleanButton}
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
  debugButton: {
    marginTop: 4,
    minWidth: 120,
    backgroundColor: '#FF6B6B',
  },
  clearButton: {
    marginTop: 4,
    minWidth: 120,
    backgroundColor: '#FF9500',
  },
         refreshButton: {
           marginTop: 4,
           minWidth: 120,
           backgroundColor: '#007AFF',
         },
         clearAllButton: {
           marginTop: 4,
           minWidth: 120,
           backgroundColor: '#FF3B30',
         },
         checkTokenButton: {
           marginTop: 4,
           minWidth: 120,
           backgroundColor: '#5856D6',
         },
         forceCleanButton: {
           marginTop: 4,
           minWidth: 120,
           backgroundColor: '#FF9500',
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


