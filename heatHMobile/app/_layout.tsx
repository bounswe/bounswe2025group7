import { Stack } from 'expo-router';
import React from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { useFonts } from '../hooks/useFonts';
import { View, Text, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const fontsLoaded = useFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

