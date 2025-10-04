import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import Screen from '@/components/layout/Screen';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Spacer from '@/components/ui/Spacer';
import Divider from '@/components/ui/Divider';
import { interestFormService } from '@/services/interestFormService';
import { feedService } from '@/services/feedService';
import { useAuthContext } from '@/context/AuthContext';
import DebugStorage from '@/components/DebugStorage';

export default function ApiTestScreen() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { isAuthenticated, login, logout, isLoading: authLoading } = useAuthContext();

  // Auto-login when component mounts (only once)
  useEffect(() => {
    console.log('API Test useEffect - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);
    if (!isAuthenticated && !authLoading) {
      console.log('Auto-logging in for API test...');
      login().catch(error => {
        console.error('Auto-login failed:', error);
      });
    }
  }, []); // Empty dependency array to run only once

  const testLogin = async () => {
    try {
      setLoading(true);
      console.log('🧪 API Test: Manual login test starting...');
      await login();
      console.log('🧪 API Test: Manual login completed');
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      console.error('🧪 API Test: Login error:', error);
      Alert.alert('Error', `Login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAutoLogin = async () => {
    try {
      setLoading(true);
      console.log('🧪 API Test: Testing auto-login service directly...');
      const { autoLoginService } = await import('@/services/autoLoginService');
      const result = await autoLoginService.autoLogin();
      console.log('🧪 API Test: Auto-login result:', result);
      Alert.alert('Auto-Login Result', `Success: ${result.success}\nError: ${result.error || 'None'}`);
    } catch (error: any) {
      console.error('🧪 API Test: Auto-login error:', error);
      Alert.alert('Error', `Auto-login failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testProfile = async () => {
    try {
      setLoading(true);
      console.log('Testing profile API...');
      const data = await interestFormService.getInterestForm();
      console.log('Profile API response:', data);
      setResults({ type: 'profile', data });
      Alert.alert('Success', 'Profile API working!');
    } catch (error: any) {
      console.error('Profile API error:', error);
      Alert.alert('Error', `Profile API failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testFeeds = async () => {
    try {
      setLoading(true);
      console.log('Testing feeds API...');
      const data = await feedService.getFeedByUser();
      console.log('Feeds API response:', data);
      setResults({ type: 'feeds', data });
      Alert.alert('Success', 'Feeds API working!');
    } catch (error: any) {
      console.error('Feeds API error:', error);
      Alert.alert('Error', `Feeds API failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testStorage = async () => {
    try {
      setLoading(true);
      console.log('🧪 API Test: Testing storage...');
      
      // Test storage
      const { storage } = await import('@/utils/storage');
      await storage.setItem('test', 'test-value');
      const retrieved = await storage.getItem('test');
      console.log('🧪 API Test: Storage test - stored:', 'test-value', 'retrieved:', retrieved);
      
      // Test token storage specifically
      await storage.setItem('accessToken', 'test-token-123');
      const tokenRetrieved = await storage.getItem('accessToken');
      console.log('🧪 API Test: Token storage test - stored:', 'test-token-123', 'retrieved:', tokenRetrieved);
      
      setResults({ type: 'storage', data: { stored: 'test-value', retrieved, tokenRetrieved } });
      Alert.alert('Storage Test', `Basic: ${retrieved === 'test-value' ? 'PASSED' : 'FAILED'}\nToken: ${tokenRetrieved === 'test-token-123' ? 'PASSED' : 'FAILED'}`);
    } catch (error: any) {
      console.error('🧪 API Test: Storage test error:', error);
      Alert.alert('Error', `Storage test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testAll = async () => {
    try {
      setLoading(true);
      console.log('Testing all APIs...');
      
      // Test login first
      await testLogin();
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test profile
      await testProfile();
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test feeds
      await testFeeds();
      
      Alert.alert('Success', 'All APIs tested!');
    } catch (error: any) {
      console.error('Test error:', error);
      Alert.alert('Error', `Test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <Screen>
        <ThemedView style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Auto-logging in...</ThemedText>
        </ThemedView>
      </Screen>
    );
  }

  console.log('API Test render - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);

  return (
    <Screen>
      <ScrollView style={styles.container}>
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <ThemedText style={styles.title}>API Test</ThemedText>
          <ThemedText style={styles.subtitle}>Test backend connectivity</ThemedText>
          <Spacer size={12} />
          <View style={styles.statusContainer}>
            <Badge label={isAuthenticated ? 'Logged In' : 'Not Logged In'} />
            <ThemedText style={styles.authStatus}>
              {isAuthenticated ? '✅ Connected' : '❌ Disconnected'}
            </ThemedText>
          </View>
        </Card>

        {/* Test Buttons Card */}
        <Card style={styles.buttonsCard}>
          <ThemedText style={styles.sectionTitle}>API Tests</ThemedText>
          <Spacer size={16} />
          
          <Button
            title={loading ? "Testing..." : "Test Storage"}
            onPress={testStorage}
            disabled={loading}
            style={styles.button}
          />
          
          <Button
            title={loading ? "Testing..." : "Test Login"}
            onPress={testLogin}
            disabled={loading || isAuthenticated}
            style={[styles.button, isAuthenticated && styles.disabledButton]}
          />
          
              <Button
                title="Force Login"
                onPress={async () => {
                  console.log('🔄 Force login triggered');
                  try {
                    await login();
                    console.log('🔄 Force login completed');
                  } catch (error) {
                    console.error('🔄 Force login failed:', error);
                  }
                }}
                disabled={loading}
                style={[styles.button, { backgroundColor: '#FF9500' }]}
              />
              
              <Button
                title="Test Auto-Login"
                onPress={testAutoLogin}
                disabled={loading}
                style={[styles.button, { backgroundColor: '#9C27B0' }]}
              />
              
              <Button
                title="Test AuthContext Login"
                onPress={async () => {
                  try {
                    setLoading(true);
                    console.log('🧪 API Test: Testing AuthContext login...');
                    await login({ username: 'test@test.com', password: 'test' });
                    console.log('🧪 API Test: AuthContext login completed');
                    Alert.alert('Success', 'AuthContext login successful!');
                  } catch (error: any) {
                    console.error('🧪 API Test: AuthContext login error:', error);
                    Alert.alert('Error', `AuthContext login failed: ${error.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={[styles.button, { backgroundColor: '#E91E63' }]}
              />
              
              <Button
                title="Test Direct AuthService"
                onPress={async () => {
                  try {
                    setLoading(true);
                    console.log('🧪 API Test: Testing authService directly...');
                    const { authService } = await import('@/services/authService');
                    const result = await authService.login({ username: 'test@test.com', password: 'test' });
                    console.log('🧪 API Test: Direct authService result:', result);
                    Alert.alert('Direct AuthService', `Success! Tokens: ${result.accessToken ? 'Present' : 'Missing'}`);
                  } catch (error: any) {
                    console.error('🧪 API Test: Direct authService error:', error);
                    Alert.alert('Error', `Direct authService failed: ${error.message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={[styles.button, { backgroundColor: '#FF5722' }]}
              />
              
              <Button
                title="Check Auth State"
                onPress={async () => {
                  try {
                    console.log('🧪 API Test: Checking auth state...');
                    const { storage } = await import('@/utils/storage');
                    const accessToken = await storage.getItem('accessToken');
                    const refreshToken = await storage.getItem('refreshToken');
                    console.log('🧪 API Test: Current auth state:', { 
                      isAuthenticated, 
                      authLoading, 
                      accessToken: !!accessToken, 
                      refreshToken: !!refreshToken 
                    });
                    Alert.alert('Auth State', 
                      `Authenticated: ${isAuthenticated}\n` +
                      `Loading: ${authLoading}\n` +
                      `Access Token: ${accessToken ? 'Present' : 'Missing'}\n` +
                      `Refresh Token: ${refreshToken ? 'Present' : 'Missing'}`
                    );
                  } catch (error: any) {
                    console.error('🧪 API Test: Check auth state error:', error);
                    Alert.alert('Error', `Check auth state failed: ${error.message}`);
                  }
                }}
                disabled={loading}
                style={[styles.button, { backgroundColor: '#607D8B' }]}
              />
          
          <Button
            title={loading ? "Testing..." : "Test Profile API"}
            onPress={testProfile}
            disabled={loading || !isAuthenticated}
            style={[styles.button, !isAuthenticated && styles.disabledButton]}
          />
          
          <Button
            title={loading ? "Testing..." : "Test Feeds API"}
            onPress={testFeeds}
            disabled={loading || !isAuthenticated}
            style={[styles.button, !isAuthenticated && styles.disabledButton]}
          />
          
          <Button
            title={loading ? "Testing..." : "Test All APIs"}
            onPress={testAll}
            disabled={loading || !isAuthenticated}
            style={[styles.button, styles.primaryButton, !isAuthenticated && styles.disabledButton]}
          />
          
          <Spacer size={16} />
          <Divider />
          <Spacer size={16} />
          
          <Button
            title="Logout"
            onPress={logout}
            disabled={loading || !isAuthenticated}
            style={[styles.button, styles.logoutButton, !isAuthenticated && styles.disabledButton]}
          />
        </Card>

        {/* Debug Storage Card */}
        <DebugStorage />

        {/* Results Card */}
        {results && (
          <Card style={styles.resultsCard}>
            <ThemedText style={styles.sectionTitle}>Last Results</ThemedText>
            <Spacer size={12} />
            <ThemedText style={styles.resultsText}>
              {JSON.stringify(results, null, 2)}
            </ThemedText>
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  
  // Header Card
  headerCard: {
    margin: 16,
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authStatus: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  
  // Buttons Card
  buttonsCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  button: {
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  
  // Results Card
  resultsCard: {
    margin: 16,
    marginTop: 0,
  },
  resultsText: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
});
