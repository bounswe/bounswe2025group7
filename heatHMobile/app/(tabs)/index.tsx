import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textColors } from '../../constants/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HeatH!</Text>
      <Text style={styles.subtitle}>Your healthy rec9ipes companion</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: textColors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: textColors.secondary,
  },
});

