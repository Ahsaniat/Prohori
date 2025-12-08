import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function MealScreen() {
  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black">
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-6">
            {/* Header removed */}
        </View>

        <View className="mb-6">
            <Text className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">Today&apos;s Meals</Text>
            
            {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((meal, index) => (
                <View key={index} className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4 flex-row items-center">
                    <View className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-xl mr-4"></View>
                    <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 dark:text-white">{meal}</Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-sm">Recommended: 500 kcal</Text>
                    </View>
                    <View className="bg-purple-50 dark:bg-purple-900/20 h-8 w-8 rounded-full items-center justify-center">
                        <Text className="text-purple-600 dark:text-purple-400 font-bold">+</Text>
                    </View>
                </View>
            ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}