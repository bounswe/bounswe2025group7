import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, TextInput, Modal, Image, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchImageLibraryAsync, MediaTypeOptions, requestMediaLibraryPermissionsAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { authService } from '../services/authService';
import { interestFormService } from '../services/interestFormService';
import { colors, textColors, borderColors } from '../constants/theme';

interface InterestFormData {
  name: string;
  surname: string;
  dateOfBirth: string;
  height: number;
  weight: number;
  gender: string;
  profilePhoto?: string;
}

export default function FirstLoginProfileScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<InterestFormData>({
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

  const genderOptions = ['Male', 'Female', 'Other'];

  useEffect(() => {
    // Check if user is authenticated
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await authService.getAccessToken();
      if (!token) {
        router.replace('/auth/sign-in' as any);
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      Alert.alert('Authentication Error', 'Please log in again');
      router.replace('/auth/sign-in' as any);
    }
  };

  const handleGenderSelect = (gender: string) => {
    setFormData({ ...formData, gender });
    setShowGenderModal(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDateModal(false);
    }
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      setFormData({ ...formData, dateOfBirth: formattedDate });
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Select date of birth';
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
    if (formData.dateOfBirth) {
      setSelectedDate(new Date(formData.dateOfBirth));
    } else {
      setSelectedDate(new Date());
    }
    setShowDateModal(true);
  };

  const convertImageToBase64 = async (uri: string): Promise<string> => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
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
      const { status } = await requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant permission to access your photo library');
        return;
      }

      const result = await launchImageLibraryAsync({
        mediaTypes: MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setProfileImageUri(uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setProfileImageUri(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return false;
    }
    if (!formData.surname.trim()) {
      Alert.alert('Validation Error', 'Please enter your surname');
      return false;
    }
    if (!formData.dateOfBirth) {
      Alert.alert('Validation Error', 'Please select your date of birth');
      return false;
    }
    if (!formData.gender) {
      Alert.alert('Validation Error', 'Please select your gender');
      return false;
    }
    if (!formData.height || formData.height <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid height');
      return false;
    }
    if (!formData.weight || formData.weight <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid weight');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const dataToSend = { ...formData };
      
      // Convert image to base64 if selected
      if (profileImageUri) {
        const base64Image = await convertImageToBase64(profileImageUri);
        dataToSend.profilePhoto = base64Image;
      }
      
      await interestFormService.createInterestForm(dataToSend);
      
      Alert.alert('Success', 'Profile created successfully!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)' as any)
        }
      ]);
    } catch (error: any) {
      console.error('Failed to create profile:', error);
      if (error.response?.status === 403) {
        Alert.alert('Authentication Error', 'Your session has expired. Please log in again.');
        router.replace('/auth/sign-in' as any);
      } else if (error.response?.status === 400) {
        Alert.alert('Validation Error', 'Please check your input and try again.');
      } else {
        Alert.alert('Error', 'Failed to create profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Creating your profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Let's get to know you better</Text>
      </View>

      {/* Profile Photo Section */}
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Profile Photo (Optional)</Text>
        <View style={styles.profileImageWrapper}>
          {profileImageUri ? (
            <Image 
              source={{ uri: profileImageUri }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}
        </View>
        <View style={styles.imageActions}>
          <TouchableOpacity style={styles.imageActionButton} onPress={pickImage}>
            <Text style={styles.imageActionText}>Add Photo</Text>
          </TouchableOpacity>
          {profileImageUri && (
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Form Fields */}
      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.card}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Enter your name"
            placeholderTextColor={textColors.hint}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Surname *</Text>
          <TextInput
            style={styles.input}
            value={formData.surname}
            onChangeText={(text) => setFormData({ ...formData, surname: text })}
            placeholder="Enter your surname"
            placeholderTextColor={textColors.hint}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Date of Birth *</Text>
          <TouchableOpacity style={styles.dateSelector} onPress={openDatePicker}>
            <Text style={styles.dateSelectorText}>
              {formatDisplayDate(formData.dateOfBirth)}
            </Text>
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Gender *</Text>
          <TouchableOpacity
            style={styles.genderSelector}
            onPress={() => setShowGenderModal(true)}
          >
            <Text style={styles.genderSelectorText}>
              {formData.gender || 'Select gender'}
            </Text>
            <Text style={styles.dropdownArrow}>▼</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Height (cm) *</Text>
          <TextInput
            style={styles.input}
            value={formData.height.toString()}
            onChangeText={(text) => setFormData({ ...formData, height: parseInt(text) || 0 })}
            placeholder="Enter height in cm"
            placeholderTextColor={textColors.hint}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            value={formData.weight.toString()}
            onChangeText={(text) => setFormData({ ...formData, weight: parseInt(text) || 0 })}
            placeholder="Enter weight in kg"
            placeholderTextColor={textColors.hint}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>Complete Profile</Text>
      </TouchableOpacity>

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
                  formData.gender === gender && styles.selectedGenderOption
                ]}
                onPress={() => handleGenderSelect(gender)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    formData.gender === gender && styles.selectedGenderOptionText
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
    paddingBottom: 40,
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
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: textColors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: textColors.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImageWrapper: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 32,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
  },
  imageActionButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  imageActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  removeImageButton: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  formSection: {
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: borderColors.light,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: borderColors.light,
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: textColors.primary,
    backgroundColor: '#f9f9f9',
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: borderColors.light,
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateSelectorText: {
    fontSize: 16,
    color: textColors.primary,
  },
  calendarIcon: {
    fontSize: 16,
  },
  genderSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: borderColors.light,
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  genderSelectorText: {
    fontSize: 16,
    color: textColors.primary,
  },
  dropdownArrow: {
    fontSize: 12,
    color: textColors.secondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  genderOption: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  selectedGenderOption: {
    backgroundColor: colors.primaryLight,
  },
  genderOptionText: {
    fontSize: 16,
    color: textColors.primary,
    textAlign: 'center',
  },
  selectedGenderOptionText: {
    color: colors.primary,
    fontWeight: '600',
  },
  cancelModalButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  cancelModalButtonText: {
    fontSize: 16,
    color: textColors.secondary,
    textAlign: 'center',
  },
  datePickerModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.primary,
  },
  datePickerCloseButton: {
    padding: 4,
  },
  datePickerCloseText: {
    fontSize: 18,
    color: textColors.secondary,
  },
  datePickerComponent: {
    alignSelf: 'center',
  },
  datePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  datePickerCancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  datePickerCancelText: {
    fontSize: 16,
    color: textColors.secondary,
    textAlign: 'center',
  },
  datePickerConfirmButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 6,
    flex: 1,
    marginLeft: 8,
  },
  datePickerConfirmText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
