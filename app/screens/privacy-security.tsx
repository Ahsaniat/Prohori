import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import CustomToggle from '../../components/ui/CustomToggle';

export default function PrivacySecurityScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);
  const [analytics, setAnalytics] = useState(true);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  const SettingRow = ({ 
    icon, 
    title, 
    description, 
    type = 'arrow', 
    value, 
    onValueChange,
    onPress 
  }: {
    icon: keyof typeof MaterialIcons.glyphMap;
    title: string;
    description?: string;
    type?: 'arrow' | 'switch';
    value?: boolean;
    onValueChange?: (value: boolean) => void;
    onPress?: () => void;
  }) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={type === 'switch'}
      className="flex-row items-center py-4"
    >
      <MaterialIcons name={icon} size={24} color={iconColor} style={{ marginRight: 12 }} />
      <View className="flex-1 mr-3">
        <Text className="text-base font-medium text-gray-900 dark:text-white">{title}</Text>
        {description && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{description}</Text>
        )}
      </View>
      {type === 'arrow' && (
        <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
      )}
      {type === 'switch' && (
        <CustomToggle value={value || false} onValueChange={onValueChange || (() => {})} />
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#111'} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Privacy & Security</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Section */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4 mb-2">
          Security
        </Text>
        <SettingRow
          icon="fingerprint"
          title="Biometric Login"
          description="Use fingerprint or face ID to login"
          type="switch"
          value={biometricLogin}
          onValueChange={setBiometricLogin}
        />
        <SettingRow
          icon="lock"
          title="Change Password"
          description="Update your account password"
          onPress={() => {}}
        />
        <SettingRow
          icon="security"
          title="Two-Factor Authentication"
          description="Add an extra layer of security"
          onPress={() => router.push('/screens/preferences/two-factor-auth')}
        />

        {/* Privacy Section */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Privacy
        </Text>
        <SettingRow
          icon="share"
          title="Data Sharing"
          description="Share health data with connected apps"
          type="switch"
          value={dataSharing}
          onValueChange={setDataSharing}
        />
        <SettingRow
          icon="analytics"
          title="Usage Analytics"
          description="Help improve the app by sharing usage data"
          type="switch"
          value={analytics}
          onValueChange={setAnalytics}
        />
        <SettingRow
          icon="visibility-off"
          title="Profile Visibility"
          description="Control who can see your profile"
          onPress={() => {}}
        />

        {/* Data Section */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Data Management
        </Text>
        <SettingRow
          icon="download"
          title="Download My Data"
          description="Get a copy of your personal data"
          onPress={() => {}}
        />
        <SettingRow
          icon="delete-forever"
          title="Delete Account"
          description="Permanently delete your account and data"
          onPress={() => {}}
        />

        {/* Info Card */}
        <View className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 mt-6">
          <View className="flex-row items-start">
            <MaterialIcons name="info" size={20} color="#9333EA" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-purple-800 dark:text-purple-300">
                Your Privacy Matters
              </Text>
              <Text className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                We never sell your personal data. Your health information is encrypted and stored securely.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
