import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface EmptySavedRecipesProps {
  onBrowseRecipes: () => void;
}

export default function EmptySavedRecipes({ onBrowseRecipes }: EmptySavedRecipesProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="bookmark-outline" size={80} color="#d1d5db" />
      </View>
      <Text style={styles.title}>No Saved Recipes</Text>
      <Text style={styles.subtitle}>
        You haven't saved any recipes yet.{'\n'}Browse recipes and save ones you like!
      </Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onBrowseRecipes}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.buttonText}>Browse Recipes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8f9fa',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f3f4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: width * 0.8,
  },
  button: {
    backgroundColor: '#169873',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#169873',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
