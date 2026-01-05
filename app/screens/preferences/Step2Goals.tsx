// Step 2: Goals (Activity Level, Primary Goal, Target Weight)
import React from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences, ACTIVITY_LEVELS, PRIMARY_GOALS, TRACKING_STRICTNESS } from './PreferencesContext';
import { WizardHeader, WizardFooter, SelectOption, NumberInput } from './PreferencesComponents';
import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight';

interface Step2Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Goals({ onNext, onBack }: Step2Props) {
  const { preferences, updateCommon } = usePreferences();
  const { activityLevel, primaryGoal, targetWeightKg, goalTimeframeWeeks, trackingStrictness } = preferences.common;
  const { top, bottom } = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-black">
      <ScrollView 
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: top, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <WizardHeader
          currentStep={2}
          totalSteps={5}
          title="Your Goals"
          subtitle="What are you working towards?"
          onBack={onBack}
        />

        <View className="mb-6">
          <View className="mb-4">
            {PRIMARY_GOALS.map((option) => (
              <SelectOption
                key={option.value}
                label={option.label}
                value={option.value}
                selected={primaryGoal === option.value}
                onSelect={() => updateCommon('primaryGoal', option.value)}
              />
            ))}
          </View>
        </View>

        <View className="mb-6">
          {ACTIVITY_LEVELS.map((option) => (
            <SelectOption
              key={option.value}
              label={option.label}
              value={option.value}
              selected={activityLevel === option.value}
              onSelect={() => updateCommon('activityLevel', option.value)}
            />
          ))}
        </View>

        {(primaryGoal === 'lose_weight' || primaryGoal === 'gain_weight') && (
          <>
            <NumberInput
              label="Target Weight"
              value={targetWeightKg}
              onChangeText={(v) => updateCommon('targetWeightKg', v)}
              placeholder="65"
              unit="kg"
            />
            <NumberInput
              label="Goal Timeframe"
              value={goalTimeframeWeeks}
              onChangeText={(v) => updateCommon('goalTimeframeWeeks', v)}
              placeholder="12"
              unit="weeks"
            />
          </>
        )}

        <View className="mb-6">
          {TRACKING_STRICTNESS.map((option) => (
            <SelectOption
              key={option.value}
              label={`${option.label} Tracking`}
              value={option.value}
              selected={trackingStrictness === option.value}
              onSelect={() => updateCommon('trackingStrictness', option.value)}
            />
          ))}
        </View>
      </ScrollView>
      
      <Animated.View style={{ marginBottom: keyboardHeight, paddingBottom: bottom, paddingHorizontal: 16 }}>
        <WizardFooter onNext={onNext} />
      </Animated.View>
    </View>
  );
}
