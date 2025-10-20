import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, Modal, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import { interestFormService } from '../../services/interestFormService';
import { feedService } from '../../services/feedService';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTheme } from '../../context/ThemeContext';

interface InterestFormData {
  name: string;
  surname: string;
  dateOfBirth: string;
  height: number;
  weight: number;
  gender: string;
  profilePhoto?: string;
}

interface FeedResponse {
  id: number;
  userId: number;
  type: 'TEXT' | 'IMAGE_AND_TEXT' | 'RECIPE';
  text: string;
  image: string;
  recipe: any;
  createdAt: string;
  likeCount: number;
  commentCount: number;
  likedByCurrentUser: boolean;
  name: string;
  surname: string;
  profilePhoto: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, textColors, borderColors, fonts, lineHeights } = useThemeColors();
  const { isDark, toggleTheme, isDyslexic, toggleFont, isColorBlind, toggleColorBlind } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<InterestFormData>({
    name: '',
    surname: '',
    dateOfBirth: '',
    height: 0,
    weight: 0,
    gender: '',
    profilePhoto: '',
  });
  const [editData, setEditData] = useState<InterestFormData>({
    name: '',
    surname: '',
    dateOfBirth: '',
    height: 0,
    weight: 0,
    gender: '',
    profilePhoto: '',
  });
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
  const [isImageUpdated, setIsImageUpdated] = useState(false);
  const [userFeeds, setUserFeeds] = useState<FeedResponse[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(false);

  const genderOptions = ['Male', 'Female', 'Other'];

  // Load profile data on component mount
  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      // Check if user is authenticated
      const token = await authService.getAccessToken();
      
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to view your profile');
        router.replace('/auth/sign-in' as any);
        return;
      }
      await Promise.all([loadProfileData(), loadUserFeeds()]);
    } catch (error) {
      Alert.alert('Authentication Error', 'Please log in again');
      router.replace('/auth/sign-in' as any);
    }
  };

  const loadUserFeeds = async () => {
    try {
      setFeedsLoading(true);
      const feeds = await feedService.getFeedByUser();

      setUserFeeds(Array.isArray(feeds) ? feeds : []);
    } catch (error) {
      setUserFeeds([]);
    } finally {
      setFeedsLoading(false);
    }
  };

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await interestFormService.getInterestForm();
      
      setProfileData(data);
      setEditData(data);
      
      // Set profile image if it exists from backend
      const imageUri = createImageUri(data.profilePhoto);

      setProfileImageUri(imageUri);
      setIsImageUpdated(false); // Reset image update flag when loading
    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert('Authentication Error', 'Please log in again to access your profile');
        // Optionally redirect to login
        // router.replace('/auth/sign-in' as any);
      } else if (error.response?.status === 404) {
        // Profile doesn't exist yet, set default values
        const defaultData = {
          name: '',
          surname: '',
          dateOfBirth: '',
          height: 0,
          weight: 0,
          gender: '',
          profilePhoto: '',
        };
        setProfileData(defaultData);
        setEditData(defaultData);
        setProfileImageUri(null);
        setIsImageUpdated(false);
      } else {
        Alert.alert('Error', 'Failed to load profile data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(profileData);
  };

  // Corrected function in ProfileScreen.js

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Create a copy of the data to be sent
      const dataToSend = { ...editData };
      
      // If the image was changed, process it
      if (isImageUpdated) {
        if (profileImageUri) {
          // Convert the new local image URI to a full Base64 data URI
          const base64Image = await convertImageToBase64(profileImageUri);
          dataToSend.profilePhoto = base64Image;
        } else {
          // If the image was removed, send an empty string
          dataToSend.profilePhoto = '';
        }
      } else {
        // If the image was NOT updated, remove the key so the backend doesn't change it
        delete dataToSend.profilePhoto;
      }
      
      // Check if this is a new profile or an update
      const isNewProfile = !profileData.name && !profileData.surname;
      
      if (isNewProfile) {
        await interestFormService.createInterestForm(dataToSend);
      } else {
        await interestFormService.updateInterestForm(dataToSend);
      }
      
      // Update the local state upon success
      setProfileData(dataToSend); // Use the successfully sent data
      setIsImageUpdated(false); 
      setIsEditing(false);
      setShowSuccessModal(true);

    } catch (error: any) {
      if (error.response?.status === 403) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
      } else if (error.response?.status === 400) {
        Alert.alert('Validation Error', 'Please check your input and try again.');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
    // Reset image state to original backend photo
    setProfileImageUri(createImageUri(profileData.profilePhoto || null));
    setIsImageUpdated(false);
  };

  const handleGenderSelect = (gender: string) => {
    setEditData({ ...editData, gender });
    setShowGenderModal(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDateModal(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setEditData({ ...editData, dateOfBirth: formattedDate });
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const openDatePicker = () => {
    if (editData.dateOfBirth) {
      setSelectedDate(new Date(editData.dateOfBirth));
    } else {
      setSelectedDate(new Date());
    }
    setShowDateModal(true);
  };

  // Corrected function in ProfileScreen.js

const convertImageToBase64 = async (uri: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Return the entire result, which includes the "data:image/jpeg;base64," prefix
        resolve(reader.result as string); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw error;
  }
};

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library');
        return;
      }

      // Launch image picker
      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setProfileImageUri(uri);
        setIsImageUpdated(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setProfileImageUri(null);
    setIsImageUpdated(true);
    setEditData({ ...editData, profilePhoto: '' });
  };

  const createImageUri = (profilePhoto: string | null): string | null => {
    if (!profilePhoto) return null;
    
    // If it's already a data URI, return as is
    if (profilePhoto.startsWith('data:')) {
      return profilePhoto;
    }
    
    // If it's a URL (http/https), return as is
    if (profilePhoto.startsWith('http://') || profilePhoto.startsWith('https://')) {
      return profilePhoto;
    }
    
    // If it's base64 data, create data URI
    return `data:image/jpeg;base64,${profilePhoto}`;
  };

  const performLogout = async () => {
    try {
      await authService.logout();
      setTimeout(() => {
        router.replace('/auth/sign-in' as any);
      }, 100);
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Failed to logout. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Use native browser confirm for web
      if (confirm('Are you sure you want to logout?')) {
        await performLogout();
      }
    } else {
      // Use Alert.alert for native
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.header, { borderBottomColor: borderColors.light }]}>
          <View>
            <Text style={[styles.title, { color: colors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>Profile</Text>
            <Text style={[styles.fontModeIndicator, { color: textColors.secondary, fontFamily: fonts.regular }]}>
              Font: {isDyslexic ? 'Dyslexic (OpenDyslexic)' : 'Normal (System)'}
            </Text>
            <Text style={[styles.colorBlindIndicator, { color: textColors.secondary, fontFamily: fonts.regular }]}>
              Colors: {isColorBlind ? 'Color Blind Mode' : 'Standard'}
            </Text>
          </View>
          <View style={[styles.headerButtons, isDyslexic && styles.headerButtonsDyslexic]}>
            <TouchableOpacity style={styles.themeToggleButton} onPress={toggleTheme}>
              <Text style={[styles.themeToggleIcon, { fontSize: 20 }]}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fontToggleButton, isDyslexic && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={toggleFont}>
              <Text style={[styles.fontToggleIcon, { fontFamily: fonts.regular, color: isDyslexic ? colors.primary : textColors.primary, fontSize: 16 }]}>{isDyslexic ? '🔤' : '📝'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.colorBlindToggleButton, isColorBlind && { backgroundColor: colors.primary + '20', borderColor: colors.primary }]} onPress={toggleColorBlind}>
              <Text style={[styles.colorBlindToggleIcon, { fontFamily: fonts.regular, color: isColorBlind ? colors.primary : textColors.primary, fontSize: 16 }]}>{isColorBlind ? '👓' : '🎨'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <View style={[styles.profileImageWrapper, { borderColor: colors.primary }]}>
            {profileImageUri ? (
              <Image 
                source={{ uri: profileImageUri }} 
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.placeholderImage, { backgroundColor: colors.gray[100] }]}>
                <Text style={[styles.placeholderText, { color: colors.gray[400], fontSize: 24 }]}>📷</Text>
              </View>
            )}
          </View>
          {isEditing && (
            <View style={styles.imageActions}>
              <TouchableOpacity style={[styles.imageActionButton, { backgroundColor: colors.primary }]} onPress={pickImage}>
                <Text style={[styles.imageActionText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Change Photo</Text>
              </TouchableOpacity>
              {profileImageUri && (
                <TouchableOpacity style={[styles.removeImageButton, { backgroundColor: colors.error }]} onPress={removeImage}>
                  <Text style={[styles.removeImageText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Name</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.name}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
              placeholder="Enter your name"
              placeholderTextColor={textColors.hint}
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.name || 'Not set'}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Surname</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.surname}
              onChangeText={(text) => setEditData({ ...editData, surname: text })}
              placeholder="Enter your surname"
              placeholderTextColor={textColors.hint}
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.surname || 'Not set'}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium }]}>Date of Birth</Text>
          {isEditing ? (
            <TouchableOpacity style={[styles.dateSelector, { backgroundColor: colors.white, borderColor: borderColors.medium }]} onPress={openDatePicker}>
              <Text style={[styles.dateSelectorText, { color: textColors.primary, fontFamily: fonts.regular }]}>
                {editData.dateOfBirth ? formatDisplayDate(editData.dateOfBirth) : 'Select date of birth'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{formatDisplayDate(profileData.dateOfBirth)}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Height (cm)</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.height.toString()}
              onChangeText={(text) => setEditData({ ...editData, height: parseInt(text) || 0 })}
              placeholder="Enter height in cm"
              placeholderTextColor={textColors.hint}
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.height ? `${profileData.height} cm` : 'Not set'}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Weight (kg)</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, { color: textColors.primary, backgroundColor: colors.white, borderColor: borderColors.medium, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}
              value={editData.weight.toString()}
              onChangeText={(text) => setEditData({ ...editData, weight: parseInt(text) || 0 })}
              placeholder="Enter weight in kg"
              placeholderTextColor={textColors.hint}
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.weight ? `${profileData.weight} kg` : 'Not set'}</Text>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.label, { color: textColors.secondary, fontFamily: fonts.medium }]}>Gender</Text>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.genderSelector, { backgroundColor: colors.white, borderColor: borderColors.medium }]}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={[styles.genderSelectorText, { color: textColors.primary, fontFamily: fonts.regular }]}>
                {editData.gender || 'Select gender'}
              </Text>
              <Text style={[styles.dropdownArrow, { color: textColors.secondary, fontFamily: fonts.regular }]}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.value, { color: textColors.primary, fontFamily: fonts.regular }]}>{profileData.gender || 'Not set'}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base, textAlign: 'center' }]}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelButton, { backgroundColor: colors.white, borderColor: borderColors.medium }]} onPress={handleCancel}>
              <Text style={[styles.cancelButtonText, { color: textColors.secondary, fontFamily: fonts.medium }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Feeds Section */}
        <View style={[styles.feedsSection, { borderTopColor: borderColors.light }]}>
          <Text style={[styles.feedsSectionTitle, { color: colors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>My Posts</Text>
          {feedsLoading ? (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.loadingText, { color: textColors.secondary, fontFamily: fonts.regular }]}>Loading posts...</Text>
            </View>
          ) : userFeeds.length > 0 ? (
            userFeeds.map((feed, index) => {
              const handleFeedPress = () => {
                if (feed.type === 'RECIPE' && feed.recipe?.id) {
                  router.push(`/recipeDetail/recipeDetail?recipeId=${feed.recipe.id}` as any);
                }
              };

              const FeedContent = () => (
                <View style={[styles.feedCard, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
                  <View style={styles.feedHeader}>
                    <Text style={[styles.feedDate, { color: textColors.secondary, fontFamily: fonts.regular }]}>
                      {feed.createdAt ? new Date(feed.createdAt).toLocaleDateString() : ''}
                    </Text>
                  </View>
                  
                  {feed.text && (
                    <Text style={[styles.feedContent, { color: textColors.primary, fontFamily: fonts.regular }]} numberOfLines={3}>
                      {feed.text}
                    </Text>
                  )}
                  
                  {feed.type === 'RECIPE' && feed.recipe?.photo ? (
                    <Image source={{ uri: feed.recipe.photo }} style={[styles.feedImage, { backgroundColor: colors.gray[100] }]} />
                  ) : feed.image && (
                    <Image source={{ uri: feed.image }} style={[styles.feedImage, { backgroundColor: colors.gray[100] }]} />
                  )}
                  
                  {feed.type === 'RECIPE' && feed.recipe && (
                    <View style={[styles.recipeContainer, { borderColor: borderColors.light }]}>
                      <Text style={[styles.recipeTitle, { color: textColors.secondary, fontFamily: fonts.medium }]}>Recipe</Text>
                      <Text style={[styles.recipeName, { color: textColors.primary, fontFamily: fonts.medium }]}>{feed.recipe.title || 'Untitled Recipe'}</Text>
                      {feed.recipe.description && (
                        <Text style={[styles.recipeDescription, { color: textColors.secondary, fontFamily: fonts.regular }]} numberOfLines={2}>
                          {feed.recipe.description}
                        </Text>
                      )}
                    </View>
                  )}
                  
                  <View style={[styles.feedStats, { borderTopColor: borderColors.light }]}>
                    <Text style={[styles.feedStat, { color: textColors.secondary, fontFamily: fonts.regular }, feed.likedByCurrentUser && { color: colors.error }]}>
                      {feed.likedByCurrentUser ? '❤️' : '🤍'} {feed.likeCount || 0} likes
                    </Text>
                    <Text style={[styles.feedStat, { color: textColors.secondary, fontFamily: fonts.regular }]}>
                      💬 {feed.commentCount || 0} comments
                    </Text>
                  </View>
                </View>
              );

              return feed.type === 'RECIPE' ? (
                <TouchableOpacity 
                  key={feed.id || index} 
                  onPress={handleFeedPress}
                  style={styles.clickableFeedCard}
                  activeOpacity={0.7}
                >
                  <FeedContent />
                </TouchableOpacity>
              ) : (
                <View key={feed.id || index}>
                  <FeedContent />
                </View>
              );
            })
          ) : (
            <View style={styles.emptyFeedsContainer}>
              <Text style={[styles.emptyFeedsText, { color: textColors.secondary, fontFamily: fonts.regular }]}>No posts yet</Text>
              <Text style={[styles.emptyFeedsSubtext, { color: textColors.hint, fontFamily: fonts.regular }]}>Start sharing your recipes and experiences!</Text>
            </View>
          )}
        </View>

        {/* Font Test Section */}
        <View style={[styles.fontTestSection, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.fontTestTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>Font Preview</Text>
          <Text style={[styles.fontTestText, { color: textColors.secondary, fontFamily: fonts.regular }]}>
            This text shows how the current font looks. {isDyslexic ? 'Dyslexic-friendly OpenDyslexic font is active.' : 'Normal system font is active.'}
          </Text>
        </View>

        {/* Color Blind Demonstration Section */}
        <View style={[styles.colorDemoSection, { backgroundColor: colors.backgroundPaper, borderColor: borderColors.light }]}>
          <Text style={[styles.colorDemoTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>Color Demonstration</Text>
          <View style={styles.colorDemoGrid}>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.success }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>Success</Text>
            </View>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.error }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>Error</Text>
            </View>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.warning }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>Warning</Text>
            </View>
            <View style={[styles.colorDemoItem, { backgroundColor: colors.primary }]}>
              <Text style={[styles.colorDemoLabel, { color: colors.white, fontFamily: fonts.medium }]}>Primary</Text>
            </View>
          </View>
          <Text style={[styles.colorDemoText, { color: textColors.secondary, fontFamily: fonts.regular }]}>
            {isColorBlind ? 'Color blind mode active - all green colors have been changed to blue for better distinction!' : 'Standard colors are currently active - greens are green.'}
          </Text>
        </View>

        {/* Action Buttons at Bottom */}
        <View style={styles.bottomActions}>
          {!isEditing && (
            <TouchableOpacity style={[styles.editButton, { backgroundColor: colors.secondary }]} onPress={handleEdit}>
              <Text style={[styles.editButtonText, { color: colors.white, fontFamily: fonts.medium }]}>Edit Profile</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error }]} onPress={handleLogout}>
            <Text style={[styles.logoutButtonText, { color: colors.white, fontFamily: fonts.medium }]}>Logout</Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
            <Text style={[styles.modalTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>Select Gender</Text>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  { borderColor: borderColors.light },
                  editData.gender === gender && [styles.selectedGenderOption, { backgroundColor: colors.primary, borderColor: colors.primary }]
                ]}
                onPress={() => handleGenderSelect(gender)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base },
                    editData.gender === gender && [styles.selectedGenderOptionText, { color: colors.white }]
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelModalButton, { borderColor: borderColors.medium }]}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={[styles.cancelModalButtonText, { color: textColors.secondary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.datePickerModal, { backgroundColor: colors.white }]}>
            <View style={[styles.datePickerHeader, { borderBottomColor: borderColors.light }]}>
              <Text style={[styles.datePickerTitle, { color: textColors.primary, fontFamily: fonts.bold }]}>Select Date of Birth</Text>
              <TouchableOpacity
                style={[styles.datePickerCloseButton, { backgroundColor: colors.gray[100] }]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={[styles.datePickerCloseText, { color: textColors.secondary, fontFamily: fonts.regular }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              style={styles.datePickerComponent}
            />
            {Platform.OS === 'ios' && (
              <View style={[styles.datePickerActions, { borderTopColor: borderColors.light }]}>
                <TouchableOpacity
                  style={[styles.datePickerCancelButton, { borderColor: borderColors.medium }]}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={[styles.datePickerCancelText, { color: textColors.secondary, fontFamily: fonts.medium }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.datePickerConfirmButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={[styles.datePickerConfirmText, { color: colors.white }]}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.successModalContent, { backgroundColor: colors.white }]}>
            <Text style={[styles.successIcon, { color: colors.success }]}>✓</Text>
            <Text style={[styles.successTitle, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>Success!</Text>
            <Text style={[styles.successMessage, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>
              Profile saved successfully
            </Text>
            <TouchableOpacity 
              style={[styles.successButton, { backgroundColor: colors.primary }]} 
              onPress={() => setShowSuccessModal(false)}
            >
              <Text style={[styles.successButtonText, { color: colors.white, fontFamily: fonts.medium, lineHeight: lineHeights.base, textAlign: 'center' }]}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: -20,
    marginTop: -40,
  },
  headerButtonsDyslexic: {
    marginLeft: -80, // Move further left for dyslexic version
    marginTop: -65,  // Move upward for dyslexic version
  },
  themeToggleButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  themeToggleIcon: {
    fontSize: 20,
  },
  fontToggleButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  fontToggleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  colorBlindToggleButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colorBlindToggleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    minHeight: 40,
    paddingVertical: 4,
  },
  fontModeIndicator: {
    fontSize: 12,
    marginTop: 4,
    minHeight: 20,
    paddingVertical: 2,
  },
  colorBlindIndicator: {
    fontSize: 12,
    marginTop: 2,
    minHeight: 20,
    paddingVertical: 2,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 24,
    paddingVertical: 4,
    textAlign: 'center',
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeImageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    minHeight: 28,
    paddingVertical: 6,
  },
  value: {
    fontSize: 16,
    minHeight: 32,
    paddingVertical: 6,
  },
  input: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 18,
    marginTop: 4,
    minHeight: 60,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 18,
    marginTop: 4,
    minHeight: 60,
  },
  dateSelectorText: {
    fontSize: 16,
    flex: 1,
  },
  calendarIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  genderSelectorText: {
    fontSize: 16,
  },
  dropdownArrow: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  datePickerModal: {
    borderRadius: 16,
    width: '90%',
    maxWidth: 350,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  datePickerCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerComponent: {
    paddingHorizontal: 20,
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  datePickerCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  datePickerConfirmText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  selectedGenderOption: {
    // Dynamic styling applied in component
  },
  genderOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedGenderOptionText: {
    fontWeight: '600',
  },
  cancelModalButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelModalButtonText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    minHeight: 24,
    paddingVertical: 4,
    textAlign: 'center',
  },
  feedsSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  feedsSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    minHeight: 36,
    paddingVertical: 6,
  },
  feedCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  clickableFeedCard: {
    marginBottom: 12,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  feedDate: {
    fontSize: 12,
  },
  feedContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  feedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  feedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  feedStat: {
    fontSize: 12,
  },
  likedStat: {
    // Dynamic styling applied in component
  },
  recipeContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  emptyFeedsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyFeedsText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyFeedsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  fontTestSection: {
    margin: 20,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 90,
  },
  fontTestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    minHeight: 28,
    paddingVertical: 4,
  },
  fontTestText: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 44,
    paddingVertical: 6,
  },
  colorDemoSection: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 120,
  },
  colorDemoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    minHeight: 24,
    paddingVertical: 2,
  },
  colorDemoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  colorDemoItem: {
    flex: 1,
    minWidth: 70,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorDemoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorDemoText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  successModalContent: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  successButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  successButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

