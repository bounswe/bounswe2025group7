import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../hooks/useThemeColors';

export default function TabLayout() {
  const { colors, fonts, lineHeights } = useThemeColors();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.gray[200],
        },
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerShown: true,
        tabBarLabelStyle: {
          fontFamily: fonts.regular,
          fontSize: fonts.regular === 'OpenDyslexic-Regular' ? 10 : 8,
          lineHeight: fonts.regular === 'OpenDyslexic-Regular' ? lineHeights.xs : 12,
        },
        headerTitleStyle: {
          fontFamily: fonts.bold,
          fontSize: fonts.regular === 'OpenDyslexic-Regular' ? 16 : 14,
          lineHeight: fonts.regular === 'OpenDyslexic-Regular' ? lineHeights.lg : 18,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HeatH',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved Recipes',
          tabBarLabel: 'Saved',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="myRecipe"
        options={{
          title: 'My Recipes',
          tabBarLabel: 'My Recipes',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="test"
        options={{
          title: 'API TEST',
          tabBarLabel: 'api_tests',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

