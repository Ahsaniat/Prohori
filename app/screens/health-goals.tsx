import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useGoalStore } from '../../store/goalStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function HealthGoalsScreen() {
  const router = useRouter();
  const { top, bottom } = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const { goals, isLoading, error, fetchGoals, saveGoals } = useGoalStore();

  const [stepsGoal, setStepsGoal] = useState('10000');
  const [caloriesGoal, setCaloriesGoal] = useState('2000');
  const [sleepGoal, setSleepGoal] = useState('8');
  const [waterGoal, setWaterGoal] = useState('2');

  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  useEffect(() => {
    if (goals) {
      setStepsGoal(String(goals.steps_goal ?? 10000));
      setCaloriesGoal(String(goals.calories_burn_goal ?? 2000));
      setSleepGoal(String(goals.sleep_hours_goal ?? 8));
      setWaterGoal(String(goals.water_liters_goal ?? 2));

      setTargetWeight(goals.target_weight ? String(goals.target_weight) : '');
      if (goals.target_date) {
        const d = new Date(goals.target_date);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setTargetDate(`${yyyy}-${mm}-${dd}`);
      } else {
        setTargetDate('');
      }
    }
  }, [goals]);

  const onSave = async () => {
    const payload = {
      steps_goal: Number(stepsGoal) || 10000,
      calories_burn_goal: Number(caloriesGoal) || 2000,
      sleep_hours_goal: Number(sleepGoal) || 8,
      water_liters_goal: Number(waterGoal) || 2,
      target_weight: targetWeight.trim() ? Number(targetWeight) : null,
      target_date: targetDate.trim() ? new Date(targetDate).toISOString() : null,
    };

    await saveGoals(payload);
    if (!useGoalStore.getState().error) {
      router.back();
    }
  };

  const iconColor = colorScheme === 'dark' ? '#E5E7EB' : '#374151';

  return (
    <View className="flex-1 bg-white dark:bg-black" style={{ paddingTop: top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <MaterialIcons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">Health Goals</Text>
      </View>

      <ScrollView 
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-gray-500 dark:text-gray-400 mb-4">
          Set daily goals and an optional destination goal.
        </Text>

        {isLoading && !goals && (
          <View className="py-4 items-center">
            <ActivityIndicator color="#9333EA" />
          </View>
        )}

        {!!error && (
          <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">
            <Text className="text-red-600 dark:text-red-300">{error}</Text>
          </View>
        )}

        {/* Daily Goals Section */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-4 mb-2">
          Daily Goals
        </Text>

        <Input
          label="Steps per day"
          placeholder="10000"
          value={stepsGoal}
          onChangeText={setStepsGoal}
          keyboardType="numeric"
        />
        <Input
          label="Calories burned per day (kcal)"
          placeholder="2000"
          value={caloriesGoal}
          onChangeText={setCaloriesGoal}
          keyboardType="numeric"
        />
        <Input
          label="Sleep per day (hours)"
          placeholder="8"
          value={sleepGoal}
          onChangeText={setSleepGoal}
          keyboardType="numeric"
        />
        <Input
          label="Water per day (liters)"
          placeholder="2"
          value={waterGoal}
          onChangeText={setWaterGoal}
          keyboardType="numeric"
        />

        {/* Destination Goal Section */}
        <Text className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Destination Goal (Optional)
        </Text>

        <Input
          label="Target weight (kg)"
          placeholder="e.g., 55"
          value={targetWeight}
          onChangeText={setTargetWeight}
          keyboardType="numeric"
        />
        <Input
          label="Target date (YYYY-MM-DD)"
          placeholder="e.g., 2026-03-01"
          value={targetDate}
          onChangeText={setTargetDate}
        />

        <Button
          title={isLoading ? 'Saving...' : 'Save Goals'}
          onPress={onSave}
          loading={isLoading}
          className="mt-4"
        />

        {/* Info Card */}
        <View className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 mt-6">
          <View className="flex-row items-start">
            <MaterialIcons name="info" size={20} color="#9333EA" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-medium text-purple-800 dark:text-purple-300">
                About Goals
              </Text>
              <Text className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Your daily goals help track progress on the insights screen. The destination goal is optional and helps you work toward a specific target.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
