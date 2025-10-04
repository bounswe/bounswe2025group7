import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuthContext } from '@/context/AuthContext';

export default function SignUpScreen() {
  const { register } = useAuthContext();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
    
    if (field === 'password') {
      setPasswordError(value.length < 6 ? 'Password must be at least 6 characters' : '');
    } else if (field === 'username') {
      setEmailError(value.length < 1 ? 'Email cannot be empty' : '');
    }
  };

  const handleSubmit = async () => {
    if (!form.username || !form.password) {
      setError('Please fill in all fields');
      return;
    }

    if (passwordError || emailError) {
      setError('Please fix the errors above');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(form.username, form.password);
      router.replace('/auth/sign-in?success=Registration successful! Please sign in.');
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.response?.status === 409 || err.response?.status === 403) {
        setError('An account already exists. Please sign in instead.');
      } else {
        setError(err.response?.data?.message || err.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.push('/auth/sign-in');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.content}>
        <ThemedText style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Sign up to get started</ThemedText>

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
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : null}

        {passwordError ? (
          <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
        ) : null}

        {emailError ? (
          <ThemedText style={styles.errorText}>{emailError}</ThemedText>
        ) : null}

        <Button
          title={loading ? 'Creating Account...' : 'Create Account'}
          onPress={handleSubmit}
          disabled={loading || !!passwordError || !!emailError || !form.username || !form.password}
          style={styles.button}
        />

        <ThemedText style={styles.signInText}>
          Already have an account?{' '}
          <ThemedText style={styles.signInLink} onPress={handleSignIn}>
            Sign In
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
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  signInText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  signInLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});


