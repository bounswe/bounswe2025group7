import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Screen from '@/components/layout/Screen';
import Section from '@/components/layout/Section';
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthContext();
  
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

  // Load existing profile data
  useEffect(() => {
    console.log('EditProfile: useEffect triggered - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
    
    // Clear previous data when authentication state changes
    console.log('EditProfile: Clearing form data due to auth state change');
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
      console.log('EditProfile: Waiting for auth to complete...');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      console.log('EditProfile: User not authenticated, redirecting');
      router.replace('/auth/sign-in');
      return;
    }

    console.log('EditProfile: User authenticated, loading profile data...');

    const loadProfileData = async () => {
      try {
        setLoading(true);
        
        // Debug: Check what user is currently authenticated
        const token = await authService.getAccessToken();
        console.log('EditProfile: Current token:', token ? `Token exists (${token.substring(0, 20)}...)` : 'No token');
        
        // Debug: Decode JWT to see username
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('EditProfile: JWT payload:', payload);
            console.log('EditProfile: Current username from JWT:', payload.sub);
          } catch (e) {
            console.log('EditProfile: Could not decode JWT:', e);
          }
        }
        
        const data = await interestFormService.getInterestForm();
        console.log('EditProfile: Profile data received:', data);
        console.log('EditProfile: User in profile data:', data?.user);
        console.log('EditProfile: Username in profile data:', data?.user?.username);
        console.log('EditProfile: Profile ID:', data?.id);
        
        // Check if the profile data belongs to the current user
        const currentUsername = token ? JSON.parse(atob(token.split('.')[1])).sub : null;
        console.log('EditProfile: Current username from JWT:', currentUsername);
        console.log('EditProfile: Profile username:', data?.user?.username);
        
        if (currentUsername && data?.user?.username && currentUsername !== data.user.username) {
          console.log('EditProfile: WARNING - Profile data does not match current user!');
          console.log('EditProfile: This suggests a backend issue where wrong profile is returned');
        }
        
        const profile = interestFormService.toProfileData(data);
        console.log('EditProfile: Profile data converted:', profile);
        console.log('EditProfile: Date of birth format:', profile.dateOfBirth);
        
        setFormData(profile);
        if (profile.profilePhoto) {
          setPreviewUrl(profile.profilePhoto);
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
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

  const handleChange = (name: keyof ProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
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
        setPreviewUrl(asset.uri);
        setFormData(prev => ({ ...prev, profilePhoto: base64 }));
      }
    } catch (err: any) {
      console.error('Error picking image:', err);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleSave = async () => {
    // Validate all fields
    const newErrors: Partial<ProfileData> = {};
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof ProfileData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    try {
      setSaving(true);
      console.log('EditProfile: Starting save process with form data:', formData);
      const interestFormData = interestFormService.fromProfileData(formData);
      console.log('EditProfile: Converted to interest form data:', interestFormData);
      
      // Validate the data format
      if (!interestFormData.name || !interestFormData.surname) {
        throw new Error('Name and surname are required');
      }
      
      console.log('EditProfile: Data validation passed');
      
      // Try update first, if it fails, try create
      try {
        console.log('EditProfile: Attempting to update existing form');
        await interestFormService.updateInterestForm(interestFormData);
        console.log('EditProfile: Update successful');
      } catch (updateError) {
        console.log('EditProfile: Update failed, trying create instead:', updateError);
        try {
          await interestFormService.createInterestForm(interestFormData);
          console.log('EditProfile: Create successful');
        } catch (createError) {
          console.log('EditProfile: Create also failed:', createError);
          
          // Test if we can make any authenticated requests at all
          console.log('EditProfile: Testing basic authentication...');
          try {
            await interestFormService.testAuthentication();
            console.log('EditProfile: Basic authentication test passed');
          } catch (authError) {
            console.log('EditProfile: Basic authentication test failed:', authError);
          }
          
          throw createError;
        }
      }
      
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

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

  if (error) {
    return (
      <Screen>
        <ThemedView style={styles.errorContainer}>
          <ErrorMessage message={error} />
          <Button title="Go Back" onPress={() => router.back()} />
        </ThemedView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView style={styles.container}>
        <Section style={styles.header}>
          <ThemedText style={styles.title}>Edit Profile</ThemedText>
        </Section>

        {/* Profile Photo */}
        <Section style={styles.photoSection}>
          <ThemedText style={styles.sectionTitle}>Profile Photo</ThemedText>
          {previewUrl ? (
            <Image source={{ uri: previewUrl }} style={styles.profileImage} />
          ) : (
            <ThemedView style={styles.placeholderImage}>
              <ThemedText>No photo</ThemedText>
            </ThemedView>
          )}
          <Button 
            title="Change Photo" 
            onPress={handlePhotoChange}
            style={styles.photoButton}
          />
        </Section>

        {/* Personal Information */}
        <Section style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
          
          <Input
            label="First Name"
            value={formData.firstName}
            onChangeText={(value) => handleChange('firstName', value)}
            error={errors.firstName}
            placeholder="Enter your first name"
          />
          
          <Input
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value) => handleChange('lastName', value)}
            error={errors.lastName}
            placeholder="Enter your last name"
          />
          
          <Input
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChangeText={(value) => handleChange('dateOfBirth', value)}
            error={errors.dateOfBirth}
            placeholder="YYYY-MM-DD"
          />
          
          <Input
            label="Gender"
            value={formData.gender}
            onChangeText={(value) => handleChange('gender', value)}
            error={errors.gender}
            placeholder="Enter your gender"
          />
        </Section>

        {/* Physical Information */}
        <Section style={styles.formSection}>
          <ThemedText style={styles.sectionTitle}>Physical Information</ThemedText>
          
          <Input
            label="Weight (kg)"
            value={formData.weight?.toString() || ''}
            onChangeText={(value) => handleChange('weight', value)}
            error={errors.weight}
            placeholder="Enter your weight"
            keyboardType="numeric"
          />
          
          <Input
            label="Height (cm)"
            value={formData.height?.toString() || ''}
            onChangeText={(value) => handleChange('height', value)}
            error={errors.height}
            placeholder="Enter your height"
            keyboardType="numeric"
          />
        </Section>

        {/* Action Buttons */}
        <Section style={styles.buttonSection}>
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
        </Section>
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
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  photoSection: {
    padding: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  photoButton: {
    marginTop: 10,
  },
  formSection: {
    padding: 20,
  },
  buttonSection: {
    padding: 20,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#8E8E93',
  },
});