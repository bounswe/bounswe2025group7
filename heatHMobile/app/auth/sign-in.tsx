import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
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
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
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
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Welcome Back</ThemedText>
        <ThemedText style={styles.subtitle}>Sign in to your account</ThemedText>

        {successMsg ? (
          <ThemedText style={styles.successText}>{successMsg}</ThemedText>
        ) : null}

        <Input
          placeholder="Email"
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
          <ThemedText style={styles.errorText}>{error}</ThemedText>
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

        <ThemedText style={styles.signUpText}>
          Don't have an account?{' '}
          <ThemedText style={styles.signUpLink} onPress={handleSignUp}>
            Sign Up
          </ThemedText>
        </ThemedText>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 16,
  },
  linkButton: {
    marginBottom: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  successText: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 16,
  },
  signUpText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  signUpLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});


