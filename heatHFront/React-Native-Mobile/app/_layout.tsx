// app/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle = "light-content"/>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Ensure login is the first screen */}
        <Stack.Screen name= "feed" options = {{}}/>
        <Stack.Screen name= "auth/authentication" options = {{}}/>
        <Stack.Screen name= "form/interestForm" options = {{}}/>
        <Stack.Screen name= "planner" options = {{}}/>
        <Stack.Screen name= "profile" options = {{}}/>
      </Stack>
    </>
  );
}
