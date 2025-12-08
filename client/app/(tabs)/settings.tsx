import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function SettingsScreen() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const handleLogout = () => {
      // Clear auth state logic here
      router.replace('/screens/login');
  };

  const SettingsItem = ({ icon, title, type = 'arrow', value = false, color = '#374151', onPress, onValueChange }: any) => (
      <TouchableOpacity 
        onPress={onPress}
        disabled={type === 'switch'}
        className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800"
      >
          <View className="flex-row items-center">
              <View className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mr-3">
                  <Ionicons name={icon} size={20} color={color} />
              </View>
              <Text className="text-gray-700 dark:text-gray-200 font-medium text-base">{title}</Text>
          </View>
          {type === 'arrow' && <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />}
          {type === 'switch' && (
            <Switch 
              value={value} 
              onValueChange={onValueChange} 
              trackColor={{ false: "#767577", true: "#9333ea" }} 
            />
          )}
      </TouchableOpacity>
  );

  return (
    <ScreenWrapper bg="bg-white dark:bg-black">
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-6">
            {/* Header removed */}
        </View>
        
        {/* Profile Section */}
        <View className="flex-row items-center mb-8">
            <View className="h-16 w-16 bg-purple-600 rounded-full items-center justify-center mr-4">
                <Text className="text-white text-2xl font-bold">AA</Text>
            </View>
            <View>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">Anik Ahsan</Text>
                <Text className="text-gray-500 dark:text-gray-400">anik.ahsan@gmail.com</Text>
            </View>
        </View>

        <View className="mb-6">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Account</Text>
            <SettingsItem 
                icon="person-outline" 
                title="Personal Information" 
                color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
                onPress={() => router.push('/screens/personal-info')}
            />
            <SettingsItem 
                icon="notifications-outline" 
                title="Notifications" 
                color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
                onPress={() => router.push('/screens/notifications')}
            />
            <SettingsItem 
              icon="lock-closed-outline" 
              title="Privacy & Security" 
              color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
            />
        </View>

        <View className="mb-6">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Preferences</Text>
            <SettingsItem 
              icon="moon-outline" 
              title="Dark Mode" 
              type="switch" 
              value={colorScheme === 'dark'} 
              color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
              onValueChange={toggleColorScheme}
            />
            <SettingsItem 
              icon="language-outline" 
              title="Language" 
              color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
            />
        </View>

         <View className="mb-8">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Support</Text>
            <SettingsItem 
              icon="help-circle-outline" 
              title="Help Center" 
              color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
            />
            <SettingsItem 
              icon="information-circle-outline" 
              title="About Us" 
              color={colorScheme === 'dark' ? '#E5E7EB' : '#374151'}
            />
        </View>
        
        <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 py-4 rounded-xl mb-10"
        >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold ml-2">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </ScreenWrapper>
  );
}