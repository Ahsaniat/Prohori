import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import ScreenWrapper from '../../components/ScreenWrapper';
import { API_URL } from '../../constants/Config';
import authService from '../../services/authService';

interface MealItem {
  spoonacularId: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  servings?: number;
  calories?: number;
  protein?: number;
  healthScore?: number;
}

interface MealPlan {
  _id: string;
  breakfast: MealItem[];
  lunch: MealItem[];
  dinner: MealItem[];
  snacks: MealItem[];
  generatedAt: string;
}

interface MealSectionProps {
  title: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  meals: MealItem[];
  onMealPress: (meal: MealItem) => void;
}

function MealCard({ meal, onPress }: { meal: MealItem; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm mr-4 overflow-hidden"
      style={{ width: 200 }}
    >
      <Image
        source={{ uri: meal.image }}
        className="w-full h-28"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1" numberOfLines={2}>
          {meal.title}
        </Text>
        <View className="flex-row items-center">
          {meal.readyInMinutes && (
            <View className="flex-row items-center mr-3">
              <MaterialIcons name="schedule" size={12} color="#6B7280" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {meal.readyInMinutes}m
              </Text>
            </View>
          )}
          {meal.calories && (
            <View className="flex-row items-center">
              <MaterialIcons name="local-fire-department" size={12} color="#EF4444" />
              <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                {Math.round(meal.calories)} cal
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function MealSection({ title, icon, color, meals, onMealPress }: MealSectionProps) {
  if (!meals || meals.length === 0) return null;

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3 px-4">
        <MaterialIcons name={icon} size={20} color={color} />
        <Text className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {meals.map((meal) => (
          <MealCard key={meal.spoonacularId} meal={meal} onPress={() => onMealPress(meal)} />
        ))}
      </ScrollView>
    </View>
  );
}

export default function MealScreen() {
  const router = useRouter();
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlan = useCallback(async () => {
    const token = authService.getToken();
    
    if (!token) {
      setLoading(false);
      setError('Please log in to view your meal plan');
      return;
    }

    try {
      setError(null);
      
      const response = await fetch(`${API_URL}/api/meals/plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch meal plan');
      }
      
      const data = await response.json();
      setMealPlan(data);
    } catch (err: any) {
      console.error('Error fetching meal plan:', err);
      setError(err.message || 'Unable to load meal plan');
    } finally {
      setLoading(false);
    }
  }, []);

  const regenerateMealPlan = async () => {
    const token = authService.getToken();
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/meals/plan/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to regenerate meal plan');
      }
      
      const data = await response.json();
      setMealPlan(data);
    } catch (err: any) {
      console.error('Error regenerating meal plan:', err);
      setError('Unable to regenerate meal plan');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMealPlan();
    }, [fetchMealPlan])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMealPlan();
    setRefreshing(false);
  }, [fetchMealPlan]);

  const handleMealPress = (meal: MealItem) => {
    router.push({
      pathname: '/screens/recipe-details' as const,
      params: { id: meal.spoonacularId.toString() }
    } as any);
  };

  const handlePreferencesPress = () => {
    router.push('/screens/preferences' as any);
  };

  const hasAnyMeals = mealPlan && (
    mealPlan.breakfast.length > 0 ||
    mealPlan.lunch.length > 0 ||
    mealPlan.dinner.length > 0 ||
    mealPlan.snacks.length > 0
  );

  return (
    <ScreenWrapper bg="bg-gray-50 dark:bg-black">
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-4 mt-4 mb-4 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">Meal Plan</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {mealPlan?.generatedAt 
                ? `Updated ${new Date(mealPlan.generatedAt).toLocaleDateString()}`
                : 'Personalized for you'}
            </Text>
          </View>
          <View className="flex-row">
            <TouchableOpacity 
              onPress={regenerateMealPlan}
              className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mr-2"
              disabled={loading}
            >
              <MaterialIcons name="refresh" size={24} color="#9333EA" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handlePreferencesPress}
              className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl"
            >
              <MaterialIcons name="tune" size={24} color="#9333EA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Banner */}
        <TouchableOpacity 
          onPress={handlePreferencesPress}
          className="mx-4 bg-purple-600 rounded-2xl p-4 mb-6 flex-row items-center"
        >
          <View className="bg-white/20 p-2 rounded-xl mr-3">
            <MaterialIcons name="restaurant-menu" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold">Update Preferences</Text>
            <Text className="text-purple-200 text-sm">Get new personalized recipes</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="white" />
        </TouchableOpacity>

        {/* Loading State */}
        {loading && (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#9333EA" />
            <Text className="mt-4 text-gray-500 dark:text-gray-400">
              Preparing your meal plan...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !loading && (
          <View className="mx-4 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl mb-4">
            <Text className="text-red-600 dark:text-red-400 text-center mb-3">{error}</Text>
            <TouchableOpacity 
              onPress={fetchMealPlan}
              className="bg-red-100 dark:bg-red-900/30 py-2 rounded-xl"
            >
              <Text className="text-red-600 dark:text-red-400 text-center font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Meal Sections */}
        {!loading && !error && hasAnyMeals && (
          <>
            <MealSection
              title="Breakfast"
              icon="wb-sunny"
              color="#F59E0B"
              meals={mealPlan?.breakfast || []}
              onMealPress={handleMealPress}
            />
            <MealSection
              title="Lunch"
              icon="restaurant"
              color="#10B981"
              meals={mealPlan?.lunch || []}
              onMealPress={handleMealPress}
            />
            <MealSection
              title="Dinner"
              icon="dinner-dining"
              color="#3B82F6"
              meals={mealPlan?.dinner || []}
              onMealPress={handleMealPress}
            />
            <MealSection
              title="Snacks"
              icon="cookie"
              color="#8B5CF6"
              meals={mealPlan?.snacks || []}
              onMealPress={handleMealPress}
            />
          </>
        )}

        {/* Empty State */}
        {!loading && !error && !hasAnyMeals && (
          <View className="py-12 items-center px-4">
            <MaterialIcons name="restaurant" size={48} color="#9CA3AF" />
            <Text className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300 text-center">
              No Meal Plan Yet
            </Text>
            <Text className="mt-2 text-gray-500 dark:text-gray-400 text-center">
              Set your preferences to get personalized meal recommendations
            </Text>
            <TouchableOpacity 
              onPress={handlePreferencesPress}
              className="mt-4 bg-purple-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Set Preferences</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="h-6" />
      </ScrollView>
    </ScreenWrapper>
  );
}