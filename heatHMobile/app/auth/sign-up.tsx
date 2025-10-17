import React, { useState } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
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
      
      // Parse the error message to extract status code
      let statusCode = null;
      if (err.message && err.message.includes('HTTP error! status:')) {
        const match = err.message.match(/HTTP error! status: (\d+)/);
        if (match) {
          statusCode = parseInt(match[1]);
        }
      }
      
      // Handle specific error cases
      if (statusCode === 409) {
        setError('An account with this email already exists. Please sign in instead or use a different email.');
      } else if (statusCode === 403) {
        setError('An account with this email already exists. Please sign in instead or use a different email.');
      } else if (statusCode === 400) {
        setError('Invalid registration data. Please check your email and password format.');
      } else if (statusCode === 422) {
        setError('Invalid email or password format. Please check your input.');
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
        setError('Registration failed. Please try again.');
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
      <View style={styles.background}>
        <View style={styles.gradientOverlay} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <ThemedText style={styles.logoText}>H</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Join our community today</ThemedText>
          </View>

          <View style={styles.formContainer}>
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

            {passwordError ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{passwordError}</ThemedText>
              </View>
            ) : null}

            {emailError ? (
              <View style={styles.errorContainer}>
                <ThemedText style={styles.errorText}>{emailError}</ThemedText>
              </View>
            ) : null}

            <Button
              title={loading ? 'Creating Account...' : 'Create Account'}
              onPress={handleSubmit}
              disabled={loading || !!passwordError || !!emailError || !form.username || !form.password}
              style={styles.button}
            />

            <View style={styles.signInContainer}>
              <ThemedText style={styles.signInText}>
                Already have an account?{' '}
                <ThemedText style={styles.signInLink} onPress={handleSignIn}>
                  Sign In
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
  signInContainer: {
    marginTop: 8,
  },
  signInText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  signInLink: {
    color: '#127e5e',
    fontWeight: '600',
  },
});


