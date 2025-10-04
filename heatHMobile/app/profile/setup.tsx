import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import interestFormService from '@/services/interestFormService';
import { authService } from '@/services/authService';
import { useAuthContext } from '@/context/AuthContext';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  height: string;
  weight: string;
  dateOfBirth: string;
  gender: string;
}

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Complete Your Profile</ThemedText>
          <ThemedText style={styles.subtitle}>
            Please provide your information to get started
          </ThemedText>

          <ThemedView style={styles.warningBox}>
            <ThemedText style={styles.warningText}>
              You must complete this profile setup before accessing the app.
            </ThemedText>
          </ThemedView>

          <Input
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(value) => handleChange('firstName', value)}
            style={styles.input}
          />
          {errors.firstName ? (
            <ThemedText style={styles.errorText}>{errors.firstName}</ThemedText>
          ) : null}

          <Input
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(value) => handleChange('lastName', value)}
            style={styles.input}
          />
          {errors.lastName ? (
            <ThemedText style={styles.errorText}>{errors.lastName}</ThemedText>
          ) : null}

          <Input
            placeholder="Height (cm)"
            value={formData.height}
            onChangeText={(value) => handleChange('height', value)}
            keyboardType="numeric"
            style={styles.input}
          />
          {errors.height ? (
            <ThemedText style={styles.errorText}>{errors.height}</ThemedText>
          ) : null}

          <Input
            placeholder="Weight (kg)"
            value={formData.weight}
            onChangeText={(value) => handleChange('weight', value)}
            keyboardType="numeric"
            style={styles.input}
          />
          {errors.weight ? (
            <ThemedText style={styles.errorText}>{errors.weight}</ThemedText>
          ) : null}

          <Input
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={formData.dateOfBirth}
            onChangeText={(value) => handleChange('dateOfBirth', value)}
            style={styles.input}
          />
          {errors.dateOfBirth ? (
            <ThemedText style={styles.errorText}>{errors.dateOfBirth}</ThemedText>
          ) : null}

          <ThemedView style={styles.genderContainer}>
            <ThemedText style={styles.genderLabel}>Gender</ThemedText>
            {GENDER_OPTIONS.map((option) => (
              <Button
                key={option.value}
                title={option.label}
                onPress={() => handleChange('gender', option.value)}
                variant={formData.gender === option.value ? 'default' : 'outline'}
                style={styles.genderButton}
              />
            ))}
          </ThemedView>
          {errors.gender ? (
            <ThemedText style={styles.errorText}>{errors.gender}</ThemedText>
          ) : null}

          <Button
            title={loading ? 'Saving Profile...' : 'Save Profile'}
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitButton}
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.7,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
    fontSize: 14,
  },
  input: {
    marginBottom: 8,
  },
  genderContainer: {
    marginBottom: 16,
  },
  genderLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  genderButton: {
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 20,
  },
});
