import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import interestFormService from '@/services/interestFormService';
import { authService } from '@/services/authService';
import { useAuthContext } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  height: string;
  weight: string;
  dateOfBirth: string;
  gender: string;
}

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male', icon: '👨' },
  { value: 'female', label: 'Female', icon: '👩' },
  { value: 'other', label: 'Other', icon: '👤' },
];

const { width } = Dimensions.get('window');

export default function ProfileSetupScreen() {
  const { checkProfileSetup, isAuthenticated, token, isInitialized, isLoading } = useAuthContext();
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    height: '',
    weight: '',
    dateOfBirth: '',
    gender: '',
  });
  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getFormProgress = () => {
    const fields = ['firstName', 'lastName', 'height', 'weight', 'dateOfBirth', 'gender'];
    const completedFields = fields.filter(field => {
      const value = formData[field as keyof ProfileFormData];
      return value && value.trim() !== '';
    });
    return (completedFields.length / fields.length) * 100;
  };

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Wait for initialization before proceeding
  if (!isInitialized || isLoading) {
    return <Loader />;
  }

  // Check authentication on component mount
  useEffect(() => {
    console.log('ProfileSetup: Component mounted');
    console.log('ProfileSetup: Authentication status:', { isAuthenticated, token: token ? 'Token exists' : 'No token' });
    
    if (!isAuthenticated) {
      console.log('ProfileSetup: User not authenticated, redirecting to sign-in');
      router.replace('/auth/sign-in');
      return;
    }
    
    // Double-check token validity
    const verifyToken = async () => {
      try {
        const currentToken = await authService.getAccessToken();
        if (!currentToken) {
          console.log('ProfileSetup: No token found, redirecting to sign-in');
          router.replace('/auth/sign-in');
          return;
        }
        console.log('ProfileSetup: Token verification passed');
      } catch (error) {
        console.log('ProfileSetup: Token verification failed, redirecting to sign-in');
        router.replace('/auth/sign-in');
      }
    };
    
    verifyToken();
  }, [isAuthenticated, token]);

  // Pre-fill form if data exists
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const data = await interestFormService.getInterestForm();
        if (data && typeof data === 'object') {
          setFormData({
            firstName: (data as any).name || '',
            lastName: (data as any).surname || '',
            height: (data as any).height?.toString() || '',
            weight: (data as any).weight?.toString() || '',
            dateOfBirth: (data as any).dateOfBirth ? (data as any).dateOfBirth.split('T')[0] : '',
            gender: (data as any).gender || '',
          });
        }
      } catch (error) {
        // No existing data, continue with empty form
      }
    };

    loadExistingData();
  }, []);

  const validateField = (name: keyof ProfileFormData, value: string): string => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) return 'Required';
        if (!/^[A-Za-zğüşöçıİĞÜŞÖÇ\s]+$/u.test(value)) return 'Only letters allowed';
        return '';
      case 'height':
        if (!value.trim()) return 'Required';
        const heightNum = parseInt(value);
        if (isNaN(heightNum) || heightNum < 50 || heightNum > 250) return 'Must be 50-250 cm';
        return '';
      case 'weight':
        if (!value.trim()) return 'Required';
        const weightNum = parseFloat(value);
        if (isNaN(weightNum) || weightNum < 10 || weightNum > 300) return 'Must be 10-300 kg';
        return '';
      case 'dateOfBirth':
        if (!value.trim()) return 'Required';
        if (value > new Date().toISOString().split('T')[0]) return 'Cannot be in the future';
        return '';
      case 'gender':
        return value ? '' : 'Required';
      default:
        return '';
    }
  };

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      handleChange('dateOfBirth', dateString);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // Returns YYYY-MM-DD format
  };

  const handleSubmit = async () => {
    console.log('ProfileSetup: handleSubmit called - START');
    
    // Check authentication first
    if (!isAuthenticated) {
      console.log('ProfileSetup: User not authenticated, redirecting to sign-in');
      Alert.alert('Authentication Error', 'You are not authenticated. Please sign in again.');
      router.replace('/auth/sign-in');
      return;
    }

    console.log('ProfileSetup: User is authenticated, proceeding with validation');

    // Validate all fields
    const newErrors: Partial<ProfileFormData> = {};
    Object.keys(formData).forEach(key => {
      const field = key as keyof ProfileFormData;
      newErrors[field] = validateField(field, formData[field]);
    });
    setErrors(newErrors);

    // Check if any errors exist
    if (Object.values(newErrors).some(error => error)) {
      console.log('ProfileSetup: Validation errors found, stopping submission');
      Alert.alert('Validation Error', 'Please fix the highlighted fields first.');
      return;
    }

    console.log('ProfileSetup: Validation passed, setting loading state');
    setLoading(true);

    try {
      // Test authentication first
      console.log('ProfileSetup: Testing authentication before form submission');
      console.log('ProfileSetup: Current auth context state:', { 
        isAuthenticated,
        token: token ? 'Token exists' : 'No token'
      });
      
      // First, let's test if we can get the token
      const currentToken = await authService.getAccessToken();
      console.log('ProfileSetup: Direct token retrieval:', currentToken ? 'Token exists' : 'No token');
      
      if (!currentToken) {
        console.log('ProfileSetup: No token available, throwing error');
        throw new Error('No authentication token available');
      }
      
      console.log('ProfileSetup: Token preview:', currentToken.substring(0, 20) + '...');
      
      // Test basic connectivity first
      console.log('ProfileSetup: Testing basic connectivity to backend');
      try {
        const testResponse = await fetch('http://35.198.76.72:8080/api/auth/exists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'test@test.com' })
        });
        console.log('ProfileSetup: Backend connectivity test result:', testResponse.status);
      } catch (connectivityError) {
        console.log('ProfileSetup: Backend connectivity test failed:', connectivityError);
        throw new Error('Cannot reach backend server. Please check your internet connection.');
      }
      
      // Test authentication with a simple request
      console.log('ProfileSetup: Testing authentication with simple request');
      try {
        const authTestResponse = await fetch('http://35.198.76.72:8080/api/interest-form/check-first-login', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        });
        console.log('ProfileSetup: Authentication test response status:', authTestResponse.status);
        
        if (authTestResponse.status === 401 || authTestResponse.status === 403) {
          throw new Error('Authentication failed: Token is invalid or expired');
        }
        
        console.log('ProfileSetup: Authentication test passed');
      } catch (authError) {
        console.log('ProfileSetup: Authentication test failed:', authError);
        throw authError;
      }
      
      console.log('ProfileSetup: About to call interestFormService.testAuthentication()');
      await interestFormService.testAuthentication();
      console.log('ProfileSetup: Authentication test passed, proceeding with form submission');

      console.log('ProfileSetup: About to call interestFormService.createInterestForm()');
      await interestFormService.createInterestForm({
        name: formData.firstName,
        surname: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        height: parseInt(formData.height),
        weight: parseFloat(formData.weight),
        gender: formData.gender,
        profilePhoto: null, // TODO: Add image upload support
      });
      console.log('ProfileSetup: Form submission completed successfully');

      // Update profile setup status in context
      await checkProfileSetup();
      
      Alert.alert('Success', 'Profile created successfully!', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error: any) {
      console.error('Profile setup error:', error);
      
      // Check if it's an authentication error
      if (error.message?.includes('No authentication token') || error.message?.includes('Authentication test failed')) {
        Alert.alert('Authentication Error', 'Your session has expired. Please sign in again.', [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/sign-in'),
          },
        ]);
      } else if (error.message?.includes('Cannot reach backend server')) {
        Alert.alert('Connection Error', 'Cannot reach the server. Please check your internet connection.');
      } else {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ThemedText style={styles.icon}>👤</ThemedText>
            </View>
            <ThemedText style={styles.title}>Complete Your Profile</ThemedText>
            <ThemedText style={styles.subtitle}>
              Help us personalize your cooking experience
            </ThemedText>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${getFormProgress()}%` }
                  ]} 
                />
              </View>
              <ThemedText style={styles.progressText}>
                {Math.round(getFormProgress())}% Complete
              </ThemedText>
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {/* Personal Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>First Name</ThemedText>
                  <Input
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChangeText={(value) => handleChange('firstName', value)}
                    style={[
                      styles.input,
                      errors.firstName && styles.inputError
                    ]}
                  />
                  {errors.firstName && (
                    <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
                  )}
                </View>
                
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Last Name</ThemedText>
                  <Input
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChangeText={(value) => handleChange('lastName', value)}
                    style={[
                      styles.input,
                      errors.lastName && styles.inputError
                    ]}
                  />
                  {errors.lastName && (
                    <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>
                  )}
                </View>
              </View>
            </View>

            {/* Physical Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Physical Information</ThemedText>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Height (cm)</ThemedText>
                  <Input
                    placeholder="e.g., 175"
                    value={formData.height}
                    onChangeText={(value) => handleChange('height', value)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      errors.height && styles.inputError
                    ]}
                  />
                  {errors.height && (
                    <ThemedText style={styles.errorText}>{errors.height}</ThemedText>
                  )}
                </View>
                
                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Weight (kg)</ThemedText>
                  <Input
                    placeholder="e.g., 70"
                    value={formData.weight}
                    onChangeText={(value) => handleChange('weight', value)}
                    keyboardType="numeric"
                    style={[
                      styles.input,
                      errors.weight && styles.inputError
                    ]}
                  />
                  {errors.weight && (
                    <ThemedText style={styles.errorText}>{errors.weight}</ThemedText>
                  )}
                </View>
              </View>
            </View>

            {/* Additional Information */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Additional Information</ThemedText>
              
              <View style={styles.inputContainer}>
                <ThemedText style={styles.inputLabel}>Date of Birth</ThemedText>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    errors.dateOfBirth && styles.inputError
                  ]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <ThemedText style={[
                    styles.dateInputText,
                    !formData.dateOfBirth && styles.dateInputPlaceholder
                  ]}>
                    {formData.dateOfBirth ? formatDate(new Date(formData.dateOfBirth)) : 'Select your date of birth'}
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
          </View>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              title={loading ? 'Creating Profile...' : 'Complete Profile'}
              onPress={handleSubmit}
              disabled={loading || getFormProgress() < 100}
              style={getFormProgress() < 100 ? styles.submitButtonDisabled : styles.submitButton}
            />
            <ThemedText style={styles.helpText}>
              All fields are required to personalize your experience
            </ThemedText>
          </View>
        </Animated.View>
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
                style={styles.datePicker}
              />
              
              <View style={styles.modalActions}>
                <Button
                  title="Cancel"
                  onPress={() => setShowDatePicker(false)}
                  style={styles.modalButton}
                />
                <Button
                  title="Done"
                  onPress={() => setShowDatePicker(false)}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  
  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#127e5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#127e5e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  icon: {
    fontSize: 32,
    color: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#127e5e',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
    fontWeight: '400',
  },
  
  // Progress Bar Styles
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e8f5f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#127e5e',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  
  // Form Section Styles
  formSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#127e5e',
    marginBottom: 16,
  },
  
  // Input Styles
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#127e5e',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e8f5f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff5f5',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Gender Selection Styles
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  genderOptionSelected: {
    backgroundColor: '#f0fff4',
    borderColor: '#127e5e',
    shadowColor: '#127e5e',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  genderIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
  },
  genderTextSelected: {
    color: '#127e5e',
    fontWeight: '600',
  },
  
  // Submit Section Styles
  submitSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#127e5e',
    borderRadius: 16,
    paddingVertical: 18,
    marginBottom: 16,
    shadowColor: '#127e5e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#a0a0a0',
    shadowOpacity: 0,
    elevation: 0,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
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
    color: '#999',
  },
  calendarIcon: {
    fontSize: 20,
    color: '#127e5e',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
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
    color: '#127e5e',
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
    color: '#127e5e',
    fontWeight: '600',
  },
  datePicker: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
