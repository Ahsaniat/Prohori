// Step 5: Cooking & Planning (Skills, Equipment, Meal Plan Structure, Budget)
import React from 'react';
import { View, ScrollView, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  usePreferences, 
  COOKING_SKILLS, 
  BUDGET_LEVELS, 
  EQUIPMENT 
} from './PreferencesContext';
import { 
  WizardHeader, 
  WizardFooter, 
  SelectOption, 
  MultiSelectChip, 
  NumberInput, 
  ToggleRow 
} from './PreferencesComponents';
import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight';

interface Step5Props {
  onNext: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function Step5Cooking({ onNext, onBack, isSubmitting }: Step5Props) {
  const { preferences, updateMeal, updateCommon } = usePreferences();
  const { 
    cookingSkill, 
    maxPrepTimeMinutes, 
    availableEquipment,
    planBreakfast,
    planLunch,
    planDinner,
    planSnacks,
    daysPerWeek,
    allowRepeats,
    budgetLevel,
    weeklyBudget
  } = preferences.meal;
  const { householdSize } = preferences.common;
  const { top, bottom } = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  // Parse equipment
  const equipmentList = availableEquipment ? availableEquipment.split(',').map(s => s.trim()).filter(Boolean) : [];

  const toggleEquipment = (item: string) => {
    const newList = equipmentList.includes(item)
      ? equipmentList.filter(e => e !== item)
      : [...equipmentList, item];
    updateMeal('availableEquipment', newList.join(', '));
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
          currentStep={5}
          totalSteps={5}
          title="Cooking & Planning"
          subtitle="Let's personalize your meal plans"
          onBack={onBack}
        />

        {/* Cooking Skill */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Cooking Skill Level
        </Text>
        <View className="mb-6">
          {COOKING_SKILLS.map((option) => (
            <SelectOption
              key={option.value}
              label={option.label}
              value={option.value}
              selected={cookingSkill === option.value}
              onSelect={() => updateMeal('cookingSkill', option.value)}
            />
          ))}
        </View>

        {/* Max Prep Time */}
        <NumberInput
          label="Maximum Prep Time"
          value={maxPrepTimeMinutes}
          onChangeText={(v) => updateMeal('maxPrepTimeMinutes', v)}
          placeholder="30"
          unit="minutes"
        />

        {/* Available Equipment */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Kitchen Equipment
        </Text>
        <View className="flex-row flex-wrap mb-6">
          {EQUIPMENT.map((equip) => (
            <MultiSelectChip
              key={equip}
              label={equip}
              selected={equipmentList.includes(equip)}
              onToggle={() => toggleEquipment(equip)}
            />
          ))}
        </View>

        {/* Meal Plan Structure */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Meals to Plan
        </Text>
        <View className="bg-white dark:bg-gray-800 rounded-xl px-4 mb-6">
          <ToggleRow
            label="Breakfast"
            value={planBreakfast}
            onValueChange={(v) => updateMeal('planBreakfast', v)}
          />
          <ToggleRow
            label="Lunch"
            value={planLunch}
            onValueChange={(v) => updateMeal('planLunch', v)}
          />
          <ToggleRow
            label="Dinner"
            value={planDinner}
            onValueChange={(v) => updateMeal('planDinner', v)}
          />
          <ToggleRow
            label="Snacks"
            value={planSnacks}
            onValueChange={(v) => updateMeal('planSnacks', v)}
          />
          <ToggleRow
            label="Allow Repeated Meals"
            description="Same recipe can appear multiple times per week"
            value={allowRepeats}
            onValueChange={(v) => updateMeal('allowRepeats', v)}
          />
        </View>

        <NumberInput
          label="Days per Week to Plan"
          value={daysPerWeek}
          onChangeText={(v) => updateMeal('daysPerWeek', v)}
          placeholder="7"
          unit="days"
        />

        <NumberInput
          label="Household Size"
          value={householdSize}
          onChangeText={(v) => updateCommon('householdSize', v)}
          placeholder="1"
          unit="people"
        />

        {/* Budget */}
        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Budget Level
        </Text>
        <View className="mb-6">
          {BUDGET_LEVELS.map((option) => (
            <SelectOption
              key={option.value}
              label={option.label}
              value={option.value}
              selected={budgetLevel === option.value}
              onSelect={() => updateMeal('budgetLevel', option.value)}
            />
          ))}
        </View>

        <NumberInput
          label="Weekly Food Budget (optional)"
          value={weeklyBudget}
          onChangeText={(v) => updateMeal('weeklyBudget', v)}
          placeholder="50"
          unit="$"
        />
      </ScrollView>
      
      <Animated.View style={{ marginBottom: keyboardHeight, paddingBottom: bottom, paddingHorizontal: 16 }}>
        <WizardFooter 
          onNext={onNext} 
          nextLabel={isSubmitting ? "Saving..." : "Save Preferences"} 
          disabled={isSubmitting}
        />
      </Animated.View>
    </View>
  );
}
