import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import CustomToggle from '../../components/ui/CustomToggle';
import authService from '../../services/authService';
import { API_URL } from '../../constants/Config';
import auth from '@react-native-firebase/auth';

interface UserProfile {
  name: string;
  email: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const [user, setUser] = useState<UserProfile | null>(null);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = authService.getToken();
        if (!token) return;

        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({ name: data.name, email: data.email });
        }
      } catch (err) {
        console.log('Error fetching user:', err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await auth().signOut();
    } catch (e) {
      console.log('Firebase signout failed', e);
    }
    await authService.logout();
    router.replace('/screens/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SettingsItem = ({ icon, title, type = 'arrow', value = false, onPress, onValueChange }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={type === 'switch'}
      className="flex-row items-center justify-between py-4"
    >
      <View className="flex-row items-center">
        <MaterialIcons name={icon} size={24} color={iconColor} style={{ marginRight: 12 }} />
        <Text className="text-gray-700 dark:text-gray-200 font-medium text-base">{title}</Text>
      </View>
      {type === 'arrow' && <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />}
      {type === 'switch' && (
        <CustomToggle 
          value={value} 
          onValueChange={onValueChange} 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bg="bg-white dark:bg-black">
      <ScrollView 
        className="px-5" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="mt-4 mb-6" />
        
        {/* Profile Section */}
        <View className="flex-row items-center mb-8">
          <View className="h-16 w-16 bg-purple-600 rounded-full items-center justify-center mr-4">
            <Text className="text-white text-2xl font-bold">
              {user ? getInitials(user.name) : '??'}
            </Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.name || 'Loading...'}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400">
              {user?.email || ''}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Account</Text>
          <SettingsItem 
            icon="person-outline" 
            title="Personal Information" 
            onPress={() => router.push('/screens/personal-info')}
          />
          <SettingsItem 
            icon="notifications-none" 
            title="Notifications" 
            onPress={() => router.push('/screens/notifications')}
          />
          <SettingsItem 
            icon="lock-outline" 
            title="Privacy & Security" 
            onPress={() => router.push('/screens/privacy-security')}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Health</Text>
          <SettingsItem 
            icon="flag" 
            title="Health Goals" 
            onPress={() => router.push('/screens/health-goals')}
          />
          <SettingsItem 
            icon="insights" 
            title="Daily Insights" 
            onPress={() => router.push('/screens/health-insights')}
          />
        </View>

        <View className="mb-6">
          <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Preferences</Text>
          <SettingsItem 
            icon="dark-mode" 
            title="Dark Mode" 
            type="switch" 
            value={colorScheme === 'dark'} 
            onValueChange={toggleColorScheme}
          />
        </View>

        <View className="mb-8">
          <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Support</Text>
          <SettingsItem 
            icon="help-outline" 
            title="Help Center" 
            onPress={() => router.push('/screens/help-center')}
          />
          <SettingsItem 
            icon="info-outline" 
            title="About Us" 
            onPress={() => router.push('/screens/about-us')}
          />
        </View>
        
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 py-4 rounded-xl mb-10"
        >
          <MaterialIcons name="logout" size={24} color="#EF4444" />
          <Text className="text-red-500 font-bold ml-2">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenWrapper>
  );
}