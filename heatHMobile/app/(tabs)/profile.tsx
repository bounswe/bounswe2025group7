import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';

export default function ProfileScreen() {
  const router = useRouter();

  const performLogout = async () => {
    try {
      console.log('Logging out...');
      await authService.logout();
      console.log('Tokens cleared, navigating to sign-in...');
      // Small delay to ensure storage is cleared
      setTimeout(() => {
        router.replace('/auth/sign-in' as any);
      }, 100);
    } catch (error) {
      console.error('Logout error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to logout. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Use native browser confirm for web
      if (confirm('Are you sure you want to logout?')) {
        await performLogout();
      }
    } else {
      // Use Alert.alert for native
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

