import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/authService';
import { useThemeColors } from '../../hooks/useThemeColors';
import { colors } from '../../constants/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { colors, textColors, fonts, lineHeights } = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await authService.login({ username: email, password: password });
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        if (status === 403 || status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: textColors.primary, fontFamily: fonts.bold, lineHeight: lineHeights['2xl'] }]}>Welcome Back</Text>
        <Text style={[styles.subtitle, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Sign in to continue</Text>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Email</Text>
          <TextInput
            style={[styles.input, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base, backgroundColor: colors.background, borderColor: colors.gray[300] }]}
            placeholder="Enter your email"
            placeholderTextColor={textColors.secondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: textColors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Password</Text>
          <TextInput
            style={[styles.input, { color: textColors.primary, fontFamily: fonts.regular, lineHeight: lineHeights.base, backgroundColor: colors.background, borderColor: colors.gray[300] }]}
            placeholder="Enter your password"
            placeholderTextColor={textColors.secondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={() => router.push('/auth/reset-password' as any)}
          disabled={loading}
        >
          <Text style={[styles.forgotPasswordText, { color: colors.primary, fontFamily: fonts.medium, lineHeight: lineHeights.base }]}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.primaryContrast} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryContrast, fontFamily: fonts.bold, lineHeight: lineHeights.base }]}>Sign In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/auth/sign-up' as any)}
          disabled={loading}
        >
          <Text style={[styles.linkText, { color: textColors.secondary, fontFamily: fonts.regular, lineHeight: lineHeights.base }]}>Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 24,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  forgotPasswordButton: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

