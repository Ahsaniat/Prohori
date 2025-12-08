import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from 'nativewind';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="screens/login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="screens/modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="screens/personal-info" options={{ title: 'Personal Info', headerBackTitle: 'Back' }} />
        <Stack.Screen name="screens/notifications" options={{ title: 'Notifications', headerBackTitle: 'Back' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
