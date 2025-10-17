import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile Page</Text>
        <Text style={styles.subtitle}>User Profile</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>John Doe</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>john@example.com</Text>
        </View>
        <Text style={styles.description}>
          This is a template profile page. Add user information, settings, and preferences here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginTop: 20,
  },
});

