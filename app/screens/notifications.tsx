import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useNotifications } from '../../hooks/useNotifications';
import notificationService from '../../services/notificationService';
import CustomToggle from '../../components/ui/CustomToggle';

export default function NotificationsScreen() {
  // const { expoPushToken } = useNotifications();
  const [loading, setLoading] = useState(true);
  
  // Preferences State
  const [marketing, setMarketing] = useState(true); // Default to true per request
  const [security, setSecurity] = useState(true);
  const [updates, setUpdates] = useState(true);

  // Load Preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        if (!notificationService.getToken()) return; // Skip if not logged in
        
        setLoading(true);
        // Ensure token is set in service if not handled globally
        // assuming auth service handles setting the token in notificationService or similar
        // For now, we rely on the backend call.
        
        const prefs = await notificationService.getPreferences();
        if (prefs) {
            setMarketing(prefs.marketing ?? true);
            setSecurity(prefs.security ?? true);
            setUpdates(prefs.updates ?? true);
        }
      } catch (error) {
        console.error("Failed to load preferences", error);
      } finally {
        setLoading(false);
      }
    };
    loadPreferences();
  }, []);

  const handleToggle = async (key: 'marketing' | 'security' | 'updates', value: boolean) => {
    // Optimistic Update
    if (key === 'marketing') setMarketing(value);
    if (key === 'security') setSecurity(value);
    if (key === 'updates') setUpdates(value);

    try {
      await notificationService.updatePreferences({ [key]: value });
    } catch {
      Alert.alert("Error", "Failed to update preference");
      // Revert logic could go here
    }
  };

  const NotificationItem = ({ title, description, value, onValueChange }: any) => (
      <View className="flex-row items-center justify-between py-4">
          <View className="flex-1 mr-4">
              <Text className="text-gray-800 dark:text-gray-200 font-medium text-base mb-1">{title}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">{description}</Text>
          </View>
          <CustomToggle 
            value={value} 
            onValueChange={onValueChange} 
          />
      </View>
  );

  if (loading) {
      return (
          <ScreenWrapper bg="bg-white dark:bg-black">
              <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#9333ea" />
              </View>
          </ScreenWrapper>
      );
  }

  return (
    <ScreenWrapper bg="bg-white dark:bg-black" includeTop={false}>
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-2">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Marketing & Offers</Text>
            <NotificationItem 
                title="Offers Alert" 
                description="Receive special offers and promotions"
                value={marketing}
                onValueChange={(val: boolean) => handleToggle('marketing', val)}
            />
        </View>

        <View className="mt-6">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">System & Alerts</Text>
            <NotificationItem 
                title="Security Alerts" 
                description="Login attempts and password changes"
                value={security}
                onValueChange={(val: boolean) => handleToggle('security', val)}
            />
            <NotificationItem 
                title="AI Alerts" 
                description="Analysis results and task completions"
                value={updates}
                onValueChange={(val: boolean) => handleToggle('updates', val)}
            />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}