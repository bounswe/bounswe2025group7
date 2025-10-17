import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6347',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved Recipes',
          tabBarLabel: 'Saved',
        }}
      />
      <Tabs.Screen
        name="api-test"
        options={{
          title: 'API Test',
          tabBarLabel: 'API Test',
        }}
      />
    </Tabs>
  );
}

