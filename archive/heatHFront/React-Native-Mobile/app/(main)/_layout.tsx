import { Tabs } from "expo-router"
import {Ionicons} from '@expo/vector-icons'

// const theme = Colors[useColorScheme() ?? 'light'];

export default function DashboardLayout() {
  const theme = {
    iconColor: "#A5D6A7", // soft green
    iconColorFocused: "#2E7D32", // deep green for active tab
    tabBarBackground: "#E8F5E9", // light green background
  }

  return (  
    <Tabs screenOptions = {{ headerShown: false,
    tabBarStyle: {
        backgroundColor: theme.tabBarBackground
    }
    }}>
        <Tabs.Screen name = "home" options = {{ 
        title: "",
        tabBarIcon: ({ focused }) => (
        <Ionicons
            // some example config.
            size = {24}
            name = {focused ? 'home' : 'home-outline'}
            color = {focused ? theme.iconColorFocused : theme.iconColor}
        />
        )}}/>

        <Tabs.Screen name = "profile" options = {{ 
        title: "",
        tabBarIcon: ({ focused }) => (
        <Ionicons
            // some example config.
            size = {24}
            name = {focused ? 'person' : 'person-outline'}
            color = {focused ? theme.iconColorFocused : theme.iconColor}
        />
        )}}/>

        <Tabs.Screen name = "save" options = {{ 
        title: "",
        tabBarIcon: ({ focused }) => (
        <Ionicons
            // some example config.
            size = {24}
            name = {focused ? 'restaurant' : 'restaurant-outline'}
            color = {focused ? theme.iconColorFocused : theme.iconColor}
        />
        )}}/>

        <Tabs.Screen name = "recipes" options = {{ 
        title: "",
        tabBarIcon: ({ focused }) => (
        <Ionicons
            // some example config.
            size = {24}
            name = {focused ? 'bookmark' : 'bookmark-outline'}
            color = {focused ? theme.iconColorFocused : theme.iconColor}
        />
        )}}/>

    </Tabs>
  )
}