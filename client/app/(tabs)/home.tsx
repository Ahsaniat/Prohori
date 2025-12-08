import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function HomeScreen() {
  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black">
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <View className="mt-4 mb-6">
          {/* Headers removed */}
        </View>

        {/* Dashboard Cards */}
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
            <Text className="text-gray-500 dark:text-gray-400 font-medium mb-1">Calories</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">1,250</Text>
            <Text className="text-xs text-green-500 mt-1">Left to goal</Text>
          </View>
          <View className="w-[48%] bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
            <Text className="text-gray-500 dark:text-gray-400 font-medium mb-1">Steps</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">5,432</Text>
            <Text className="text-xs text-purple-500 mt-1">65% of goal</Text>
          </View>
          <View className="w-[48%] bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
            <Text className="text-gray-500 dark:text-gray-400 font-medium mb-1">Water</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">1.2L</Text>
            <Text className="text-xs text-purple-400 mt-1">+200ml</Text>
          </View>
          <View className="w-[48%] bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm mb-4">
            <Text className="text-gray-500 dark:text-gray-400 font-medium mb-1">Sleep</Text>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">7h 20m</Text>
            <Text className="text-xs text-purple-500 mt-1">Good quality</Text>
          </View>
        </View>
        
        <View className="mt-4 bg-purple-600 rounded-2xl p-6 shadow-md">
            <Text className="text-white text-xl font-bold mb-2">Daily Challenge</Text>
            <Text className="text-purple-100 mb-4">Walk 2000 more steps to reach your daily milestone!</Text>
            <View className="bg-white/20 p-2 rounded-lg self-start">
                <Text className="text-white font-bold">View Details</Text>
            </View>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}