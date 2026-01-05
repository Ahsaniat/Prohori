// Step 3: Dietary Restrictions (Diet Type, Allergies, Intolerances, Religious Rules)
import React from 'react';
import { View, ScrollView, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  usePreferences, 
  DIET_TYPES, 
  COMMON_ALLERGIES, 
  COMMON_INTOLERANCES, 
  RELIGIOUS_RULES 
} from './PreferencesContext';
import { WizardHeader, WizardFooter, SelectOption, MultiSelectChip } from './PreferencesComponents';
import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight';

interface Step3Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step3Dietary({ onNext, onBack }: Step3Props) {
  const { preferences, updateMeal } = usePreferences();
  const { dietType, allergies, intolerances, religiousRules } = preferences.meal;
  const { top, bottom } = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  // Parse comma-separated strings to arrays
  const allergyList = allergies ? allergies.split(',').map(s => s.trim()).filter(Boolean) : [];
  const intoleranceList = intolerances ? intolerances.split(',').map(s => s.trim()).filter(Boolean) : [];
  const religiousList = religiousRules ? religiousRules.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleItem = (item: string, currentList: string[], updateKey: 'allergies' | 'intolerances' | 'religiousRules') => {
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    updateMeal(updateKey, newList.join(', '));
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
          currentStep={3}
          totalSteps={5}
          title="Dietary Preferences"
          subtitle="Any dietary restrictions we should know about?"
          onBack={onBack}
        />

        {/* Diet Type */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Diet Type
        </Text>
        <View className="mb-6">
          {DIET_TYPES.map((option) => (
            <SelectOption
              key={option.value}
              label={option.label}
              value={option.value}
              selected={dietType === option.value}
              onSelect={() => updateMeal('dietType', option.value)}
            />
          ))}
        </View>

        {/* Allergies */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Food Allergies
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {COMMON_ALLERGIES.map((allergy) => (
            <MultiSelectChip
              key={allergy}
              label={allergy}
              selected={allergyList.includes(allergy)}
              onToggle={() => toggleItem(allergy, allergyList, 'allergies')}
            />
          ))}
        </View>

        {/* Intolerances */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Food Intolerances
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {COMMON_INTOLERANCES.map((intolerance) => (
            <MultiSelectChip
              key={intolerance}
              label={intolerance}
              selected={intoleranceList.includes(intolerance)}
              onToggle={() => toggleItem(intolerance, intoleranceList, 'intolerances')}
            />
          ))}
        </View>

        {/* Religious Rules */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Religious/Cultural Dietary Rules
        </Text>
        <View className="flex-row flex-wrap mb-6">
          {RELIGIOUS_RULES.map((rule) => (
            <MultiSelectChip
              key={rule.value}
              label={rule.label}
              selected={religiousList.includes(rule.value)}
              onToggle={() => toggleItem(rule.value, religiousList, 'religiousRules')}
            />
          ))}
        </View>
      </ScrollView>
      
      <Animated.View style={{ marginBottom: keyboardHeight, paddingBottom: bottom, paddingHorizontal: 16 }}>
        <WizardFooter onNext={onNext} showSkip onSkip={onNext} />
      </Animated.View>
    </View>
  );
}
