import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform, View, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';

export default function SignInScreen() {
  const { login, logout, isAuthenticated } = useAuthContext();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const params = useLocalSearchParams();
  const successMsg = params.success as string || '';

  // Check authentication on mount
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Clear any existing tokens before login
      console.log('SignIn: Clearing existing tokens before login');
      
      // Debug: Check token before logout
      const tokenBeforeLogout = await authService.getAccessToken();
      console.log('SignIn: Token before logout:', tokenBeforeLogout ? `Token exists (${tokenBeforeLogout.substring(0, 20)}...)` : 'No token');
      
      await logout();
      
      // Debug: Check token after logout
      const tokenAfterLogout = await authService.getAccessToken();
      console.log('SignIn: Token after logout:', tokenAfterLogout ? `Token exists (${tokenAfterLogout.substring(0, 20)}...)` : 'No token');
      
      await login(form.username, form.password);
      
      // Debug: Check token after login
      const tokenAfterLogin = await authService.getAccessToken();
      console.log('SignIn: Token after login:', tokenAfterLogin ? `Token exists (${tokenAfterLogin.substring(0, 20)}...)` : 'No token');
      
      // Navigation will be handled by useEffect
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Parse the error message to extract status code
      let statusCode = null;
      if (err.message && err.message.includes('HTTP error! status:')) {
        const match = err.message.match(/HTTP error! status: (\d+)/);
        if (match) {
          statusCode = parseInt(match[1]);
        }
      }
      
      // Handle specific error cases
      if (statusCode === 401) {
        setError('Incorrect email or password. Please check your credentials and try again.');
      } else if (statusCode === 403) {
        setError('Incorrect email or password. Please check your credentials and try again.');
      } else if (statusCode === 404) {
        setError('Account not found. Please check your email address or sign up for a new account.');
      } else if (statusCode === 429) {
        setError('Too many login attempts. Please wait a few minutes before trying again.');
      } else if (statusCode === 500) {
        setError('Server error. Please try again later.');
      } else if (err.message?.includes('Network Error') || err.message?.includes('fetch')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (err.message?.includes('timeout')) {
        setError('Request timed out. Please check your internet connection and try again.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/auth/sign-up');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <ThemedText style={styles.logoText}>H</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to continue your journey</ThemedText>
          </View>

          <View style={styles.formContainer}>
            {successMsg ? (
              <View style={styles.successContainer}>
                <ThemedText style={styles.successText}>{successMsg}</ThemedText>
              </View>
            ) : null}

            <Input
              placeholder="Email Address"
              value={form.username}
              onChangeText={(value) => handleChange('username', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Input
              placeholder="Password"
              value={form.password}
              onChangeText={(value) => handleChange('password', value)}
              secureTextEntry
              style={styles.input}
            />

            {error ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            ) : null}

            <Button
              title={loading ? 'Signing In...' : 'Sign In'}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.button}
            />

            <Button
              title="Forgot Password?"
              onPress={handleForgotPassword}
              style={styles.linkButton}
            />

            <View style={styles.signUpContainer}>
              <ThemedText style={styles.signUpText}>
                Don't have an account?{' '}
                <ThemedText style={styles.signUpLink} onPress={handleSignUp}>
                  Sign Up
                </ThemedText>
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: '#127e5e',
    opacity: 0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#127e5e',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#127e5e',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#127e5e',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    fontWeight: '400',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#127e5e',
    shadowOpacity: 0,
    elevation: 0,
  },
  linkButtonText: {
    color: '#127e5e',
  },
  errorContainer: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    fontWeight: '500',
  },
  successContainer: {
    backgroundColor: '#f0fff4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#48bb78',
  },
  successText: {
    color: '#48bb78',
    textAlign: 'center',
    fontWeight: '500',
  },
  signUpContainer: {
    marginTop: 8,
  },
  signUpText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  signUpLink: {
    color: '#127e5e',
    fontWeight: '600',
  },
});


