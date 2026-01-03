import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useGoalStore } from '../../store/goalStore';
import Button from '../../components/ui/Button';

export default function HealthInsightsScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { insights, isLoading, error, fetchTodayInsights } = useGoalStore();

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  useEffect(() => {
    fetchTodayInsights();
  }, []);

  const ProgressRow = ({ label, percent, icon }: { label: string; percent: number; icon: keyof typeof MaterialIcons.glyphMap }) => {
    const safe = Math.max(0, Math.min(100, percent || 0));
    const isComplete = safe >= 100;
    
    return (
      <View className="mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <MaterialIcons name={icon} size={18} color="#9333EA" />
            <Text className="ml-2 text-gray-800 dark:text-gray-200 font-semibold">{label}</Text>
          </View>
          <View className="flex-row items-center">
            {isComplete && (
              <MaterialIcons name="check-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
            )}
            <Text className={isComplete ? 'text-green-600 dark:text-green-400 font-semibold' : 'text-gray-500 dark:text-gray-400'}>
              {Math.round(safe)}%
            </Text>
          </View>
        </View>
        <View className="h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          <View 
            style={{ width: `${safe}%` }} 
            className={`h-3 rounded-full ${isComplete ? 'bg-green-500' : 'bg-purple-600'}`} 
          />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <MaterialIcons name="arrow-back" size={24} color={iconColor} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white">Daily Insights</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/screens/health-goals')}>
          <MaterialIcons name="settings" size={24} color="#9333EA" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 dark:text-gray-400 mb-4">
          Your progress vs your goals for today.
        </Text>

        {isLoading && !insights && (
          <View className="py-6 items-center">
            <ActivityIndicator size="large" color="#9333EA" />
          </View>
        )}

        {!!error && (
          <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">
            <Text className="text-red-600 dark:text-red-300">{error}</Text>
          </View>
        )}

        {insights && (
          <View className="bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <ProgressRow label="Steps" percent={insights.progress.steps_percent} icon="directions-walk" />
            <ProgressRow label="Calories Burned" percent={insights.progress.calories_percent} icon="local-fire-department" />
            <ProgressRow label="Sleep" percent={insights.progress.sleep_percent} icon="bedtime" />
            <ProgressRow label="Water" percent={insights.progress.water_percent} icon="water-drop" />
          </View>
        )}

        {insights?.insights?.length ? (
          <View className="mt-4 bg-gray-50 dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800">
            <View className="flex-row items-center mb-3">
              <MaterialIcons name="lightbulb" size={20} color="#9333EA" />
              <Text className="ml-2 text-lg font-bold text-gray-900 dark:text-white">Insights</Text>
            </View>
            {insights.insights.map((msg, idx) => (
              <View key={idx} className="flex-row items-start mb-2">
                <Text className="text-purple-600 dark:text-purple-400 mr-2">•</Text>
                <Text className="text-gray-700 dark:text-gray-200 flex-1">{msg}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Button
          title={isLoading ? 'Loading...' : 'Refresh'}
          onPress={fetchTodayInsights}
          loading={isLoading}
          className="mt-6"
        />

        {/* Quick Actions */}
        <View className="mt-6">
          <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
            Quick Actions
          </Text>
          <TouchableOpacity 
            onPress={() => router.push('/screens/health-goals')}
            className="flex-row items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl"
          >
            <View className="flex-row items-center">
              <MaterialIcons name="flag" size={24} color="#9333EA" />
              <Text className="ml-3 text-purple-800 dark:text-purple-300 font-medium">Edit Health Goals</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#9333EA" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
