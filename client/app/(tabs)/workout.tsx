import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function WorkoutScreen() {
  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black">
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-6">
            {/* Header removed */}
        </View>

        <View className="flex-row mb-6 overflow-hidden">
             <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
                {['All', 'Cardio', 'Strength', 'Yoga', 'HIIT'].map((category, index) => (
                    <View key={index} className={`px-5 py-2 rounded-full mr-3 ${index === 0 ? 'bg-purple-600' : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800'}`}>
                        <Text className={`font-medium ${index === 0 ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>{category}</Text>
                    </View>
                ))}
             </ScrollView>
        </View>

        <View className="mb-4">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Recommended for You</Text>
            <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
                <View className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3 w-full"></View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Full Body HIIT</Text>
                <Text className="text-gray-500 dark:text-gray-400">20 mins • High Intensity</Text>
            </View>
            <View className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
                <View className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl mb-3 w-full"></View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">Morning Yoga Flow</Text>
                <Text className="text-gray-500 dark:text-gray-400">15 mins • Beginner</Text>
            </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}