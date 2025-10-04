import React, { useState } from 'react';
import { StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import interestFormService, { InterestFormData } from '@/services/interestFormService';

const DIETARY_PREFERENCES = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Mediterranean'
];

const ALLERGIES = [
  'Nuts', 'Dairy', 'Eggs', 'Soy', 'Wheat', 'Shellfish', 'Fish'
];

const COOKING_SKILLS = [
  'Beginner', 'Intermediate', 'Advanced', 'Expert'
];

const CUISINES = [
  'Italian', 'Mexican', 'Asian', 'Indian', 'Mediterranean', 'American', 'French', 'Thai'
];

const COOKING_TIMES = [
  '15 minutes or less', '30 minutes', '1 hour', '2+ hours'
];

const HEALTH_GOALS = [
  'Weight Loss', 'Muscle Gain', 'Heart Health', 'Diabetes Management', 'General Wellness'
];

export default function InterestFormScreen() {
  const [formData, setFormData] = useState<InterestFormData>({
    dietaryPreferences: [],
    allergies: [],
    cookingSkill: '',
    favoriteCuisines: [],
    cookingTime: '',
    healthGoals: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMultiSelect = (field: keyof InterestFormData, value: string) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSingleSelect = (field: keyof InterestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      await interestFormService.createInterestForm(formData);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const renderMultiSelect = (title: string, field: keyof InterestFormData, options: string[]) => (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedView style={styles.optionsContainer}>
        {options.map((option) => (
          <Button
            key={option}
            title={option}
            onPress={() => handleMultiSelect(field, option)}
            variant={(formData[field] as string[])?.includes(option) ? 'default' : 'outline'}
            style={styles.optionButton}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );

  const renderSingleSelect = (title: string, field: keyof InterestFormData, options: string[]) => (
    <ThemedView style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedView style={styles.optionsContainer}>
        {options.map((option) => (
          <Button
            key={option}
            title={option}
            onPress={() => handleSingleSelect(field, option)}
            variant={formData[field] === option ? 'default' : 'outline'}
            style={styles.optionButton}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedView style={styles.content}>
          <ThemedText style={styles.title}>Tell us about your preferences</ThemedText>
          <ThemedText style={styles.subtitle}>
            Help us personalize your cooking experience
          </ThemedText>

          {renderMultiSelect('Dietary Preferences', 'dietaryPreferences', DIETARY_PREFERENCES)}
          {renderMultiSelect('Allergies', 'allergies', ALLERGIES)}
          {renderSingleSelect('Cooking Skill Level', 'cookingSkill', COOKING_SKILLS)}
          {renderMultiSelect('Favorite Cuisines', 'favoriteCuisines', CUISINES)}
          {renderSingleSelect('Preferred Cooking Time', 'cookingTime', COOKING_TIMES)}
          {renderMultiSelect('Health Goals', 'healthGoals', HEALTH_GOALS)}

          {error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : null}

          <Button
            title={loading ? 'Saving...' : 'Save Preferences'}
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
    marginBottom: 32,
    opacity: 0.7,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    marginBottom: 8,
    marginRight: 8,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 32,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});