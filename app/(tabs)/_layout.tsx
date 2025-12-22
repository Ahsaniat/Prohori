import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#9333EA', // purple-600
          tabBarInactiveTintColor: isDark ? '#9CA3AF' : '#6B7280', // gray-400 : gray-500
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: isDark ? '#1F2937' : '#E5E7EB',
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginBottom: 2,
          },
        }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons name={focused ? 'home' : 'home'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="meal"
          options={{
            title: 'Meal',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons name={focused ? 'restaurant' : 'restaurant-menu'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons name={focused ? 'fitness-center' : 'fitness-center'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons name={focused ? 'chat-bubble' : 'chat-bubble-outline'} size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons name={focused ? 'settings' : 'settings'} size={28} color={color} />
            ),
          }}
        />
         {/* Hide explore if it exists or other screens */}
         <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>
  );
}