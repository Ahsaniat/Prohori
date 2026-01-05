// Step 4: Food Preferences (Cuisines, Dislikes, Favorites)
import React from 'react';
import { View, ScrollView, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences, CUISINES } from './PreferencesContext';
import { WizardHeader, WizardFooter, MultiSelectChip, TextInputField } from './PreferencesComponents';
import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight';

interface Step4Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step4FoodPrefs({ onNext, onBack }: Step4Props) {
  const { preferences, updateMeal } = usePreferences();
  const { favoriteCuisines, avoidedCuisines, favoriteFoods, dislikedIngredients } = preferences.meal;
  const { top, bottom } = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  // Parse comma-separated strings to arrays
  const favoriteCuisineList = favoriteCuisines ? favoriteCuisines.split(',').map(s => s.trim()).filter(Boolean) : [];
  const avoidedCuisineList = avoidedCuisines ? avoidedCuisines.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleCuisine = (cuisine: string, type: 'favorite' | 'avoided') => {
    if (type === 'favorite') {
      const newList = favoriteCuisineList.includes(cuisine)
        ? favoriteCuisineList.filter(c => c !== cuisine)
        : [...favoriteCuisineList, cuisine];
      // Remove from avoided if adding to favorites
      if (!favoriteCuisineList.includes(cuisine)) {
        const newAvoided = avoidedCuisineList.filter(c => c !== cuisine);
        updateMeal('avoidedCuisines', newAvoided.join(', '));
      }
      updateMeal('favoriteCuisines', newList.join(', '));
    } else {
      const newList = avoidedCuisineList.includes(cuisine)
        ? avoidedCuisineList.filter(c => c !== cuisine)
        : [...avoidedCuisineList, cuisine];
      // Remove from favorites if adding to avoided
      if (!avoidedCuisineList.includes(cuisine)) {
        const newFavorites = favoriteCuisineList.filter(c => c !== cuisine);
        updateMeal('favoriteCuisines', newFavorites.join(', '));
      }
      updateMeal('avoidedCuisines', newList.join(', '));
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: top, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <WizardHeader
          currentStep={4}
          totalSteps={5}
          title="Food Preferences"
          subtitle="What cuisines and foods do you love?"
          onBack={onBack}
        />

        {/* Favorite Cuisines */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Favorite Cuisines 💚
        </Text>
        <View className="flex-row flex-wrap mb-6">
          {CUISINES.map((cuisine) => (
            <MultiSelectChip
              key={`fav-${cuisine}`}
              label={cuisine}
              selected={favoriteCuisineList.includes(cuisine)}
              onToggle={() => toggleCuisine(cuisine, 'favorite')}
            />
          ))}
        </View>

        {/* Avoided Cuisines */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Cuisines to Avoid 🚫
        </Text>
        <View className="flex-row flex-wrap mb-6">
          {CUISINES.map((cuisine) => (
            <MultiSelectChip
              key={`avoid-${cuisine}`}
              label={cuisine}
              selected={avoidedCuisineList.includes(cuisine)}
              onToggle={() => toggleCuisine(cuisine, 'avoided')}
            />
          ))}
        </View>

        {/* Favorite Foods */}
        <TextInputField
          label="Favorite Foods (comma separated)"
          value={favoriteFoods}
          onChangeText={(v) => updateMeal('favoriteFoods', v)}
          placeholder="e.g., pasta, salads, chicken, rice bowls"
          multiline
        />

        {/* Disliked Ingredients */}
        <TextInputField
          label="Ingredients You Dislike (comma separated)"
          value={dislikedIngredients}
          onChangeText={(v) => updateMeal('dislikedIngredients', v)}
          placeholder="e.g., mushrooms, olives, cilantro"
          multiline
        />
      </ScrollView>
      
      <Animated.View style={{ marginBottom: keyboardHeight, paddingBottom: bottom, paddingHorizontal: 16 }}>
        <WizardFooter onNext={onNext} showSkip onSkip={onNext} />
      </Animated.View>
    </View>
  );
}
