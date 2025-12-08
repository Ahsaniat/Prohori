import React, { useState, useEffect } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { useNotifications } from '../../hooks/useNotifications';
import notificationService from '../../services/notificationService';

export default function NotificationsScreen() {
  const { expoPushToken } = useNotifications();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);

  useEffect(() => {
    if (expoPushToken) {
      console.log('Push Token:', expoPushToken);
      notificationService.savePushToken(expoPushToken)
        .then(() => console.log('Push token saved successfully'))
        .catch(error => console.error('Failed to save push token:', error));
    }
  }, [expoPushToken]);

  const handlePushToggle = async (value: boolean) => {
    setPushEnabled(value);
    
    if (value && expoPushToken) {
      try {
        await notificationService.savePushToken(expoPushToken);
        console.log('Push token saved successfully');
      } catch (error) {
        console.error('Failed to save push token:', error);
      }
    }
  };

  const NotificationItem = ({ title, description, value, onValueChange }: any) => (
      <View className="flex-row items-center justify-between py-4 border-b border-gray-100 dark:border-gray-800">
          <View className="flex-1 mr-4">
              <Text className="text-gray-800 dark:text-gray-200 font-medium text-base mb-1">{title}</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-sm">{description}</Text>
          </View>
          <Switch 
            value={value} 
            onValueChange={onValueChange} 
            trackColor={{ false: "#767577", true: "#9333ea" }}
            thumbColor={value ? "#ffffff" : "#f4f3f4"}
          />
      </View>
  );

  return (
    <ScreenWrapper bg="bg-white dark:bg-black">
      <ScrollView className="px-5" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-2">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">General</Text>
            <NotificationItem 
                title="Push Notifications" 
                description="Receive alerts on your device"
                value={pushEnabled}
                onValueChange={handlePushToggle}
            />
            <NotificationItem 
                title="Email Notifications" 
                description="Receive updates via email"
                value={emailEnabled}
                onValueChange={setEmailEnabled}
            />
        </View>

        <View className="mt-6">
            <Text className="text-gray-500 dark:text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Reminders</Text>
            <NotificationItem 
                title="Workout Reminders" 
                description="Get notified for scheduled workouts"
                value={workoutReminders}
                onValueChange={setWorkoutReminders}
            />
            <NotificationItem 
                title="Meal Reminders" 
                description="Don't forget to log your meals"
                value={mealReminders}
                onValueChange={setMealReminders}
            />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}