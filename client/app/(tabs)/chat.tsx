import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';

export default function ChatScreen() {
  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black">
      <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center items-center mt-20">
            <View className="h-32 w-32 bg-purple-100 dark:bg-purple-900/30 rounded-full items-center justify-center mb-6">
                <Text className="text-5xl">💬</Text>
            </View>
            <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 text-center mb-2">How can I help you today?</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center px-10">Ask me about your diet, workout plan, or general health questions.</Text>
            
            <View className="w-full mt-10">
                <View className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-3 border border-gray-100 dark:border-gray-800">
                    <Text className="text-gray-700 dark:text-gray-300">&quot;Suggest a healthy dinner for tonight&quot;</Text>
                </View>
                <View className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm mb-3 border border-gray-100 dark:border-gray-800">
                    <Text className="text-gray-700 dark:text-gray-300">&quot;How to improve my sleep quality?&quot;</Text>
                </View>
            </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}