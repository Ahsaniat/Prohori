// Step 1: Basic Info (Sex, Age, Height, Weight)
import React from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePreferences, SEX_OPTIONS } from './PreferencesContext';
import { WizardHeader, WizardFooter, SelectOption, NumberInput } from './PreferencesComponents';
import { useKeyboardHeight } from '../../../hooks/useKeyboardHeight';

interface Step1Props {
  onNext: () => void;
  onBack: () => void;
}

export default function Step1BasicInfo({ onNext, onBack }: Step1Props) {
  const { preferences, updateCommon } = usePreferences();
  const { sex, age, heightCm, weightKg } = preferences.common;
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
          currentStep={1}
          totalSteps={5}
          title="Let's Get Started"
          subtitle="Tell us about yourself to personalize your experience"
          onBack={onBack}
          showBack={false}
        />

        <View className="mb-6">
          {SEX_OPTIONS.map((option) => (
            <SelectOption
              key={option.value}
              label={option.label}
              value={option.value}
              selected={sex === option.value}
              onSelect={() => updateCommon('sex', option.value)}
            />
          ))}
        </View>

        <NumberInput
          label="Age"
          value={age}
          onChangeText={(v) => updateCommon('age', v)}
          placeholder="25"
          unit="years"
        />

        <NumberInput
          label="Height"
          value={heightCm}
          onChangeText={(v) => updateCommon('heightCm', v)}
          placeholder="170"
          unit="cm"
        />

        <NumberInput
          label="Weight"
          value={weightKg}
          onChangeText={(v) => updateCommon('weightKg', v)}
          placeholder="70"
          unit="kg"
        />
      </ScrollView>
      
      <Animated.View style={{ marginBottom: keyboardHeight, paddingBottom: bottom, paddingHorizontal: 16 }}>
        <WizardFooter onNext={onNext} />
      </Animated.View>
    </View>
  );
}
