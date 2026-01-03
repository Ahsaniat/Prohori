import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from 'nativewind';
import { useNotificationObserver, useLastNotificationResponse } from '../hooks/useNotificationObserver';
import KnockWrapper from '../components/KnockWrapper';

import { useEffect, useState } from 'react';
import authService from '../services/authService';
import { View, ActivityIndicator } from 'react-native';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // Initialize Notification Listeners
  useNotificationObserver();
  useLastNotificationResponse();

  useEffect(() => {
    const initAuth = async () => {
      await authService.init();
      setIsAuthReady(true);
    };
    initAuth();
  }, []);

  // Show loading while auth initializes
  if (!isAuthReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colorScheme === 'dark' ? '#000' : '#fff' }}>
        <ActivityIndicator size="large" color="#9333EA" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <KnockWrapper>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="screens/login" options={{ headerShown: false }} />
          <Stack.Screen name="screens/signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="screens/modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="screens/personal-info" options={{ title: 'Personal Info', headerBackTitle: 'Back' }} />
          <Stack.Screen name="screens/notifications" options={{ title: 'Notifications', headerBackTitle: 'Back' }} />
          <Stack.Screen name="screens/preferences/index" options={{ headerShown: false }} />
          <Stack.Screen name="screens/recipe-details" options={{ headerShown: false }} />
          <Stack.Screen name="screens/privacy-security" options={{ headerShown: false }} />
          <Stack.Screen name="screens/language" options={{ headerShown: false }} />
          <Stack.Screen name="screens/help-center" options={{ headerShown: false }} />
          <Stack.Screen name="screens/about-us" options={{ headerShown: false }} />
          <Stack.Screen name="screens/chat-history" options={{ headerShown: false }} />
          <Stack.Screen name="screens/chat-detail" options={{ headerShown: false }} />
          <Stack.Screen name="screens/health-goals" options={{ headerShown: false }} />
          <Stack.Screen name="screens/health-insights" options={{ headerShown: false }} />
          <Stack.Screen name="screens/preferences/two-factor-auth" options={{ headerShown: false }} />
          <Stack.Screen name="screens/change-password" options={{ headerShown: false }} />
          <Stack.Screen name="screens/live-support" options={{ headerShown: false }} />
        </Stack>
      </KnockWrapper>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
