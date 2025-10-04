import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Screen from '@/components/layout/Screen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Spacer from '@/components/ui/Spacer';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';

export default function SignInScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthContext();
  
  const [formData, setFormData] = useState({
    username: 'test@test.com',
    password: 'test'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!formData.username.includes('@')) {
      newErrors.username = 'Please enter a valid email';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      newErrors.password = 'Password must be at least 3 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      console.log('🔐 SignIn: Attempting login with:', formData);
      
      // Use the AuthContext login function with credentials
      await login(formData);
      
      Alert.alert('Success', 'Login successful!');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('🔐 SignIn: Login failed:', error);
      Alert.alert('Error', `Login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    try {
      setLoading(true);
      console.log('🔐 SignIn: Quick login with test credentials');
      await login();
      Alert.alert('Success', 'Quick login successful!');
      router.replace('/(tabs)');
    } catch (error: any) {
      console.error('🔐 SignIn: Quick login failed:', error);
      Alert.alert('Error', `Quick login failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Screen>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Signing in...</ThemedText>
        </ThemedView>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Card style={styles.card}>
            <ThemedText style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to your account</ThemedText>
            
            <Spacer size={24} />
            
            <Input
              label="Username/Email"
              value={formData.username}
              onChangeText={(value) => handleInputChange('username', value)}
              placeholder="Enter your username or email"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.username}
            />
            
            <Input
              label="Password"
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
            />
            
            <Spacer size={24} />
            
            <Button
              title={loading ? "Signing In..." : "Sign In"}
              onPress={handleSignIn}
              disabled={loading}
              style={styles.signInButton}
            />
            
            <Spacer size={16} />
            
            <Button
              title="Quick Login (Test)"
              onPress={handleQuickLogin}
              disabled={loading}
              style={styles.quickLoginButton}
            />
            
            <Spacer size={16} />
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <ThemedText style={styles.dividerText}>OR</ThemedText>
              <View style={styles.dividerLine} />
            </View>
            
            <Spacer size={16} />
            
            <Button
              title="Go to API Test"
              onPress={() => router.push('/(tabs)/api-test')}
              style={styles.apiTestButton}
            />
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  card: {
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 8,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
  },
  quickLoginButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
  },
  apiTestButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
});


