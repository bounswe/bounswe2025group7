import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, Image, View, TouchableOpacity, Modal, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import ErrorMessage from '@/components/ui/ErrorMessage';
import interestFormService from '@/services/interestFormService';
import { authService } from '@/services/authService';
import { ProfileData } from '@/models/User';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', icon: '👨' },
  { value: 'female', label: 'Female', icon: '👩' },
  { value: 'other', label: 'Other', icon: '👤' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  const insets = useSafeAreaInsets();
  
  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    weight: undefined,
    height: undefined,
    dateOfBirth: '',
    gender: '',
    profilePhoto: '',
  });
  
  const [errors, setErrors] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Load existing profile data
  useEffect(() => {
    
    // Clear previous data when authentication state changes
    setFormData({
      firstName: '',
      lastName: '',
      weight: undefined,
      height: undefined,
      dateOfBirth: '',
      gender: '',
      profilePhoto: '',
    });
    setPreviewUrl('');
    setError(null);
    
    // Wait for authentication to complete
    if (authLoading) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.replace('/auth/sign-in');
      return;
    }

    

    const loadProfileData = async () => {
      try {
        setLoading(true);
        
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
        
        // Check if the profile data belongs to the current user
        const currentUsername = token ? JSON.parse(atob(token.split('.')[1])).sub : null;
        
        if (currentUsername && (data as any)?.user?.username && currentUsername !== (data as any).user.username) {
        }
        
        const profile = interestFormService.toProfileData(data);
        
        setFormData(profile);
        if (profile.profilePhoto) {
          setPreviewUrl(profile.profilePhoto);
        }
      } catch (err: any) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [isAuthenticated, authLoading]);

  const validateField = (name: keyof ProfileData, value: any): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return value && value.trim().length < 2 ? 'Must be at least 2 characters' : '';
      case 'weight':
        const weight = parseFloat(value);
        return value && (isNaN(weight) || weight < 20 || weight > 300) 
          ? 'Weight must be between 20 and 300 kg' : '';
      case 'height':
        const height = parseFloat(value);
        return value && (isNaN(height) || height < 100 || height > 250) 
          ? 'Height must be between 100 and 250 cm' : '';
      case 'dateOfBirth':
        if (!value) return '';
        
        // Handle different date formats
        let date: Date;
        if (value.includes('-')) {
          // Handle YYYY-MM-DD format from backend
          date = new Date(value);
        } else if (value.includes('/')) {
          // Handle MM/DD/YYYY format
          date = new Date(value);
        } else {
          // Try to parse as-is
          date = new Date(value);
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
          return 'Invalid date format';
        }
        
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        
        // Adjust age calculation for more accuracy
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
          age--;
        }
        
        return age < 13 || age > 120 ? 'Age must be between 13 and 120 years' : '';
      default:
        return '';
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (name: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = formatDate(date);
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate as any }));
      setErrors(prev => ({ ...prev, dateOfBirth: validateField('dateOfBirth', formattedDate) as any }));
    }
  };

  const handlePhotoChange = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const base64 = `data:image/jpeg;base64,${asset.base64}`;
        setFormData(prev => ({ ...prev, profilePhoto: base64 }));
        setPreviewUrl(asset.uri || '');
      }
    } catch (err: any) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const interestFormData = interestFormService.fromProfileData(formData);
      
      // Validate the data format
      const errorsFound: string[] = [];
      (['firstName', 'lastName', 'weight', 'height', 'dateOfBirth'] as Array<keyof ProfileData>).forEach((field) => {
        const message = validateField(field, (formData as any)[field]);
        if (message) errorsFound.push(`${field}: ${message}`);
      });
      if (errorsFound.length > 0) {
        Alert.alert('Validation Error', errorsFound.join('\n'));
        return;
      }
      
      // Try update first, if it fails, try create
      try {
        await interestFormService.updateInterestForm(interestFormData);
      } catch (updateError) {
        try {
          await interestFormService.createInterestForm(interestFormData);
        } catch (createError) {
          
          // Test if we can make any authenticated requests at all
          try {
            await interestFormService.testAuthentication();
          } catch (authError) {
          }
          
          Alert.alert('Error', 'Failed to save profile. Please try again.');
          throw createError;
        }
      }

      Alert.alert('Success', 'Profile saved successfully');
    } catch (err: any) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Loader />
        <ThemedText>Loading profile...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage message={error} />
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['left','right','bottom']}> 
      <StatusBar barStyle="light-content" backgroundColor="#127d5d" translucent />
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>←</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.title}>Edit Profile</ThemedText>
          <View style={styles.backButton} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Photo Section */}
          <View style={styles.photoContainer}>
          <View style={styles.photoWrapper}>
            {previewUrl ? (
              <Image source={{ uri: previewUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <ThemedText style={styles.placeholderText}>👤</ThemedText>
              </View>
            )}
            <TouchableOpacity 
              style={styles.changePhotoButton}
              onPress={handlePhotoChange}
            >
              <ThemedText style={styles.changePhotoIcon}>📷</ThemedText>
            </TouchableOpacity>
          </View>
          <ThemedText style={styles.photoHint}>Tap camera icon to change photo</ThemedText>
        </View>

        {/* Form Sections */}
        <View style={styles.formContainer}>
          {/* Personal Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <ThemedText style={styles.inputLabel}>First Name</ThemedText>
                <Input
                  value={formData.firstName}
                  onChangeText={(value) => handleChange('firstName', value)}
                  error={errors.firstName}
                  placeholder="Enter first name"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.inputHalf}>
                <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                <Input
                  value={formData.lastName}
                  onChangeText={(value) => handleChange('lastName', value)}
                  error={errors.lastName}
                  placeholder="Enter last name"
                  style={styles.input}
                />
              </View>
            </View>
            
            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Date of Birth</ThemedText>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText style={formData.dateOfBirth ? styles.dateInputText : styles.dateInputPlaceholder}>
                  {formData.dateOfBirth || 'Select your date of birth'}
                </ThemedText>
                <ThemedText style={styles.calendarIcon}>📅</ThemedText>
              </TouchableOpacity>
              {errors.dateOfBirth && (
                <ThemedText style={styles.errorText}>{errors.dateOfBirth}</ThemedText>
              )}
            </View>

            <View style={styles.inputContainer}>
              <ThemedText style={styles.inputLabel}>Gender</ThemedText>
              <View style={styles.genderContainer}>
                {GENDER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.genderOption,
                      formData.gender === option.value && styles.genderOptionSelected
                    ]}
                    onPress={() => handleChange('gender', option.value)}
                  >
                    <ThemedText style={styles.genderIcon}>{option.icon}</ThemedText>
                    <ThemedText style={[
                      styles.genderText,
                      formData.gender === option.value && styles.genderTextSelected
                    ]}>
                      {option.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && (
                <ThemedText style={styles.errorText}>{errors.gender}</ThemedText>
              )}
            </View>
          </View>

          {/* Physical Information */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Physical Information</ThemedText>
            
            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <ThemedText style={styles.inputLabel}>Weight (kg)</ThemedText>
                <Input
                  value={formData.weight?.toString() || ''}
                  onChangeText={(value) => handleChange('weight', value)}
                  error={errors.weight as unknown as string}
                  placeholder="e.g., 70"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
              
              <View style={styles.inputHalf}>
                <ThemedText style={styles.inputLabel}>Height (cm)</ThemedText>
                <Input
                  value={formData.height?.toString() || ''}
                  onChangeText={(value) => handleChange('height', value)}
                  error={errors.height as unknown as string}
                  placeholder="e.g., 175"
                  keyboardType="numeric"
                  style={styles.input}
                />
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonSection}>
            <Button
              title={saving ? "Saving..." : "Save Changes"}
              onPress={handleSave}
              disabled={saving}
              style={styles.saveButton}
            />
            <Button
              title="Cancel"
              onPress={() => router.back()}
              style={styles.cancelButton}
            />
          </View>
        </View>
        </ScrollView>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Select Date of Birth</ThemedText>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
                
                {Platform.OS === 'ios' && (
                  <View style={styles.modalActions}>
                    <Button
                      title="Done"
                      onPress={() => setShowDatePicker(false)}
                      style={styles.modalButton}
                    />
                  </View>
                )}
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#127d5d',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fffe',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#127d5d',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  // Photo Section Styles
  photoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  photoWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#127d5d',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8f5f0',
    borderWidth: 4,
    borderColor: '#127d5d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    color: '#127d5d',
  },
  changePhotoButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#127d5d',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  changePhotoIcon: {
    fontSize: 20,
  },
  photoHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  // Form Container Styles
  formContainer: {
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#127d5d',
    marginBottom: 20,
  },
  
  // Input Styles
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputHalf: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#127d5d',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e8f5f0',
    borderRadius: 12,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Date Picker Styles
  dateInput: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e8f5f0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dateInputPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
  },
  calendarIcon: {
    fontSize: 20,
    color: '#127d5d',
  },
  
  // Gender Selection Styles
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e8f5f0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  genderOptionSelected: {
    backgroundColor: '#f0fff4',
    borderColor: '#127d5d',
    shadowColor: '#127d5d',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  genderIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  genderTextSelected: {
    color: '#127d5d',
    fontWeight: '600',
  },
  
  // Button Section Styles
  buttonSection: {
    marginTop: 8,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#127d5d',
    shadowColor: '#127d5d',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#127d5d',
    shadowOpacity: 0,
    elevation: 0,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#127d5d',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f8fffe',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8f5f0',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#127d5d',
    fontWeight: '600',
  },
  modalActions: {
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#127d5d',
  },
});