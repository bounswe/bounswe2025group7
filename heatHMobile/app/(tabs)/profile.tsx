import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, Modal, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import { interestFormService } from '../../services/interestFormService';
import { feedService } from '../../services/feedService';
import { colors, textColors, borderColors } from '../../constants/theme';

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
      console.log('Auth token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to view your profile');
        router.replace('/auth/sign-in' as any);
        return;
      }
      await Promise.all([loadProfileData(), loadUserFeeds()]);
    } catch (error) {
      console.error('Auth check failed:', error);
      Alert.alert('Authentication Error', 'Please log in again');
      router.replace('/auth/sign-in' as any);
    }
  };

  const loadUserFeeds = async () => {
    try {
      setFeedsLoading(true);
      const feeds = await feedService.getFeedByUser();
      console.log('User feeds loaded:', feeds);
      setUserFeeds(Array.isArray(feeds) ? feeds : []);
    } catch (error) {
      console.error('Failed to load user feeds:', error);
      setUserFeeds([]);
    } finally {
      setFeedsLoading(false);
    }
  };

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const data = await interestFormService.getInterestForm();
      console.log('Profile data from backend:', data);
      console.log('Profile photo from backend:', data.profilePhoto ? 'exists' : 'null');
      
      setProfileData(data);
      setEditData(data);
      
      // Set profile image if it exists from backend
      const imageUri = createImageUri(data.profilePhoto);
      console.log('Created image URI:', imageUri);
      setProfileImageUri(imageUri);
      setIsImageUpdated(false); // Reset image update flag when loading
    } catch (error: any) {
      console.error('Failed to load profile data:', error);
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
      Alert.alert('Success', 'Profile saved successfully');

    } catch (error: any) {
      console.error('Failed to save profile:', error);
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
    console.error('Error converting image to base64:', error);
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
      console.error('Error picking image:', error);
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
      console.log('Logging out...');
      await authService.logout();
      console.log('Tokens cleared, navigating to sign-in...');
      // Small delay to ensure storage is cleared
      setTimeout(() => {
        router.replace('/auth/sign-in' as any);
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
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
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerButtons}>
            {!isEditing && (
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Image Section */}
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImageWrapper}>
            {profileImageUri ? (
              <Image 
                source={{ uri: profileImageUri }} 
                style={styles.profileImage}
                onError={(error) => console.log('Image load error:', error)}
                onLoad={() => console.log('Image loaded successfully')}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>📷</Text>
              </View>
            )}
          </View>
          {isEditing && (
            <View style={styles.imageActions}>
              <TouchableOpacity style={styles.imageActionButton} onPress={pickImage}>
                <Text style={styles.imageActionText}>Change Photo</Text>
              </TouchableOpacity>
              {profileImageUri && (
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <Text style={styles.removeImageText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.name}
              onChangeText={(text) => setEditData({ ...editData, name: text })}
              placeholder="Enter your name"
              placeholderTextColor={textColors.hint}
            />
          ) : (
            <Text style={styles.value}>{profileData.name || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Surname</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.surname}
              onChangeText={(text) => setEditData({ ...editData, surname: text })}
              placeholder="Enter your surname"
              placeholderTextColor={textColors.hint}
            />
          ) : (
            <Text style={styles.value}>{profileData.surname || 'Not set'}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Date of Birth</Text>
          {isEditing ? (
            <TouchableOpacity style={styles.dateSelector} onPress={openDatePicker}>
              <Text style={styles.dateSelectorText}>
                {editData.dateOfBirth ? formatDisplayDate(editData.dateOfBirth) : 'Select date of birth'}
              </Text>
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>{formatDisplayDate(profileData.dateOfBirth)}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Height (cm)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.height.toString()}
              onChangeText={(text) => setEditData({ ...editData, height: parseInt(text) || 0 })}
              placeholder="Enter height in cm"
              placeholderTextColor={textColors.hint}
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>{profileData.height ? `${profileData.height} cm` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Weight (kg)</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editData.weight.toString()}
              onChangeText={(text) => setEditData({ ...editData, weight: parseInt(text) || 0 })}
              placeholder="Enter weight in kg"
              placeholderTextColor={textColors.hint}
              keyboardType="numeric"
            />
          ) : (
            <Text style={styles.value}>{profileData.weight ? `${profileData.weight} kg` : 'Not set'}</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Gender</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.genderSelector}
              onPress={() => setShowGenderModal(true)}
            >
              <Text style={styles.genderSelectorText}>
                {editData.gender || 'Select gender'}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>{profileData.gender || 'Not set'}</Text>
          )}
        </View>

        {isEditing && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* User Feeds Section */}
        <View style={styles.feedsSection}>
          <Text style={styles.feedsSectionTitle}>My Posts</Text>
          {feedsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : userFeeds.length > 0 ? (
            userFeeds.map((feed, index) => (
              <View key={feed.id || index} style={styles.feedCard}>
                <View style={styles.feedHeader}>
                  <Text style={styles.feedDate}>
                    {feed.createdAt ? new Date(feed.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
                
                {feed.text && (
                  <Text style={styles.feedContent} numberOfLines={3}>
                    {feed.text}
                  </Text>
                )}
                
                {feed.type === 'RECIPE' && feed.recipe?.photo ? (
                  <Image source={{ uri: feed.recipe.photo }} style={styles.feedImage} />
                ) : feed.image && (
                  <Image source={{ uri: feed.image }} style={styles.feedImage} />
                )}
                
              
                
                <View style={styles.feedStats}>
                  <Text style={[styles.feedStat, feed.likedByCurrentUser && styles.likedStat]}>
                    {feed.likedByCurrentUser ? '❤️' : '🤍'} {feed.likeCount || 0} likes
                  </Text>
                  <Text style={styles.feedStat}>
                    💬 {feed.commentCount || 0} comments
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyFeedsContainer}>
              <Text style={styles.emptyFeedsText}>No posts yet</Text>
              <Text style={styles.emptyFeedsSubtext}>Start sharing your recipes and experiences!</Text>
            </View>
          )}
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Gender</Text>
            {genderOptions.map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderOption,
                  editData.gender === gender && styles.selectedGenderOption
                ]}
                onPress={() => handleGenderSelect(gender)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    editData.gender === gender && styles.selectedGenderOptionText
                  ]}
                >
                  {gender}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.cancelModalButton}
              onPress={() => setShowGenderModal(false)}
            >
              <Text style={styles.cancelModalButtonText}>Cancel</Text>
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
          <View style={styles.datePickerModal}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date of Birth</Text>
              <TouchableOpacity
                style={styles.datePickerCloseButton}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.datePickerCloseText}>✕</Text>
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
              <View style={styles.datePickerActions}>
                <TouchableOpacity
                  style={styles.datePickerCancelButton}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={styles.datePickerCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.datePickerConfirmButton}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={styles.datePickerConfirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: textColors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: borderColors.light,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  editButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
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
    borderColor: colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: colors.gray[400],
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  imageActionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  removeImageButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  removeImageText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.backgroundPaper,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: borderColors.light,
    shadowColor: colors.black,
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
    color: textColors.secondary,
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    color: textColors.primary,
  },
  input: {
    fontSize: 16,
    color: textColors.primary,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: borderColors.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: borderColors.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  dateSelectorText: {
    fontSize: 16,
    color: textColors.primary,
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
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: borderColors.medium,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  genderSelectorText: {
    fontSize: 16,
    color: textColors.primary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: textColors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  datePickerModal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    width: '90%',
    maxWidth: 350,
    shadowColor: colors.black,
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
    borderBottomColor: borderColors.light,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.primary,
  },
  datePickerCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerCloseText: {
    fontSize: 16,
    color: textColors.secondary,
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
    borderTopColor: borderColors.light,
  },
  datePickerCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderColors.medium,
    alignItems: 'center',
    marginRight: 8,
  },
  datePickerCancelText: {
    color: textColors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    marginLeft: 8,
  },
  datePickerConfirmText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  genderOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: borderColors.light,
  },
  selectedGenderOption: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderOptionText: {
    fontSize: 16,
    color: textColors.primary,
    textAlign: 'center',
  },
  selectedGenderOptionText: {
    color: colors.white,
    fontWeight: '600',
  },
  cancelModalButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: borderColors.medium,
  },
  cancelModalButtonText: {
    fontSize: 16,
    color: textColors.secondary,
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
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: borderColors.medium,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cancelButtonText: {
    color: textColors.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  feedsSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: borderColors.light,
  },
  feedsSectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 16,
  },
  feedCard: {
    backgroundColor: colors.backgroundPaper,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: borderColors.light,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: textColors.primary,
    flex: 1,
    marginRight: 8,
  },
  feedDate: {
    fontSize: 12,
    color: textColors.secondary,
  },
  feedContent: {
    fontSize: 14,
    color: textColors.primary,
    lineHeight: 20,
    marginBottom: 8,
  },
  feedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.gray[100],
  },
  feedStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: borderColors.light,
  },
  feedStat: {
    fontSize: 12,
    color: textColors.secondary,
  },
  likedStat: {
    color: colors.error,
  },
  recipeContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: borderColors.light,
  },
  recipeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: textColors.secondary,
    marginBottom: 4,
  },
  recipeName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  recipeDescription: {
    fontSize: 12,
    color: textColors.primary,
    lineHeight: 16,
  },
  emptyFeedsContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyFeedsText: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.secondary,
    marginBottom: 8,
  },
  emptyFeedsSubtext: {
    fontSize: 14,
    color: textColors.hint,
    textAlign: 'center',
  },
});

