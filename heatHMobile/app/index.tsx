import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { authService } from '../services/authService';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const token = await authService.getAccessToken();
      console.log('Token:', token ? 'Found' : 'Not found');
      
      if (token) {
        router.replace('/(tabs)' as any);
      } else {
        router.replace('/auth/sign-in' as any);
      }
    } catch (error) {
      router.replace('/auth/sign-in' as any);
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#FF6347" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

