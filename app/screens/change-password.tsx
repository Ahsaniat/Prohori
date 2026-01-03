import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import authService from '../../services/authService';
import { API_URL } from '../../constants/Config';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';
  const bottomPadding = Math.max(bottom, 20);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) {
        Alert.alert('Error', 'Not authenticated');
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/update-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password updated successfully', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to update password');
      }
    } catch (error: any) {
      console.error('[ChangePassword] Error:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Change Password</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: bottomPadding + 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-gray-500 dark:text-gray-400 mb-6">
            Enter your current password and choose a new password.
          </Text>

          <Input
            label="Current Password"
            placeholder="Enter current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />

          <Input
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />

          <Input
            label="Confirm New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title={loading ? 'Updating...' : 'Update Password'}
            onPress={handleChangePassword}
            loading={loading}
            className="mt-4"
          />

          {/* Info Card */}
          <View className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 mt-6">
            <View className="flex-row items-start">
              <MaterialIcons name="info" size={20} color="#9333EA" />
              <View className="flex-1 ml-3">
                <Text className="text-sm font-medium text-purple-800 dark:text-purple-300">
                  Password Requirements
                </Text>
                <Text className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Your password must be at least 6 characters long. Use a combination of letters, numbers, and symbols for better security.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
