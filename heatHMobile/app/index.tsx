import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { authService } from '../services/authService';
import { interestFormService } from '../services/interestFormService';

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
        // Check if this is the user's first login (needs to fill profile)
        try {
          // returns true if form NOT submitted (first login)
          const isFirstLogin = await interestFormService.checkFirstLogin();
          
          if (isFirstLogin) {
            router.replace('/first-login-profile' as any);
          } else {
            router.replace('/(tabs)' as any);
          }
        } catch (firstLoginError) {
          // If check fails, default to tabs
          router.replace('/(tabs)' as any);
        }
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

