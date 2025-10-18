import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, textColors } from '../../constants/theme';

export default function SavedRecipesScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Saved Recipes</Text>
        <Text style={styles.subtitle}>Your Bookmarked Recipes</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No saved recipes yet</Text>
          <Text style={styles.emptyDescription}>
            Recipes you save will appear here
          </Text>
        </View>
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: textColors.primary,
  },
  subtitle: {
    fontSize: 18,
    color: textColors.secondary,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: textColors.disabled,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: textColors.disabled,
  },
});

