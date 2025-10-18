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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, textColors, borderColors } from '../../constants/theme';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams();
  const [email, setEmail] = useState(Array.isArray(paramEmail) ? paramEmail[0] || '' : paramEmail || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !otp) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    // OTP validation (6 digits)
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code');
      return false;
    }

    return true;
  };

  const handleVerifyOTP = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual OTP verification API call
      // await authService.verifyCode(email, parseInt(otp));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Verification Successful',
        'Your email has been verified successfully! You can now reset your password.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to reset password page with email parameter
              router.push({
                pathname: '/auth/reset-password',
                params: { email: email }
              });
            }
          }
        ]
      );
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message || error.response.data?.error;
        
        if (status === 400) {
          errorMessage = 'Invalid verification code. Please check your code and try again.';
        } else if (status === 404) {
          errorMessage = 'No verification request found for this email.';
        } else if (status === 429) {
          errorMessage = 'Too many attempts. Please wait before trying again.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }
      
      Alert.alert('Verification Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual resend code API call
      // await authService.sendVerificationCode(email);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Code Sent', 'A new verification code has been sent to your email address.');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit verification code sent to your email address.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!loading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            value={otp}
            onChangeText={setOtp}
            keyboardType="numeric"
            maxLength={6}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>Verify Code</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendCode}
          disabled={loading}
        >
          <Text style={styles.resendText}>Didn't receive code? Resend</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <Text style={styles.linkText}>Back to Forgot Password</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: textColors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: textColors.secondary,
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: textColors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: borderColors.medium,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.backgroundPaper,
    color: textColors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: colors.primaryLight,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  linkButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
});
