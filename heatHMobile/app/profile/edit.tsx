import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Alert, Image } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Screen from '@/components/layout/Screen';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { interestFormService } from '@/services/interestFormService';
import { ProfileData } from '@/models/User';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function EditProfileScreen() {
  const router = useRouter();
  const effectRan = useRef(false);
  
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
    if (effectRan.current) return;
    effectRan.current = true;

    const loadProfileData = async () => {
      try {
        setLoading(true);
        const data = await interestFormService.getInterestForm();
        const profile = interestFormService.toProfileData(data);
        
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
  }, []);

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
        const date = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age < 13 || age > 120 ? 'Invalid date of birth' : '';
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
      const interestFormData = interestFormService.fromProfileData(formData);
      await interestFormService.updateInterestForm(interestFormData);
      
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