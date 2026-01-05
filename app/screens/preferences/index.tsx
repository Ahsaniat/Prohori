// Main Preferences Wizard - Combines all steps
import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  PreferencesProvider, 
  usePreferences, 
  defaultCommonPreferences, 
  defaultMealPreferences,
} from './PreferencesContext';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Goals from './Step2Goals';
import Step3Dietary from './Step3Dietary';
import Step4FoodPrefs from './Step4FoodPrefs';
import Step5Cooking from './Step5Cooking';
import { API_URL } from '../../../constants/Config';
import authService from '../../../services/authService';

// Empty preferences for fresh start
const emptyCommonPreferences = {
  sex: '',
  age: '',
  heightCm: '',
  weightKg: '',
  activityLevel: '',
  primaryGoal: '',
  targetWeightKg: '',
  goalTimeframeWeeks: '',
  trackingStrictness: '',
  householdSize: '',
};

const emptyMealPreferences = {
  dietType: '',
  religiousRules: '',
  allergies: '',
  intolerances: '',
  dislikedIngredients: '',
  avoidedCuisines: '',
  favoriteFoods: '',
  favoriteCuisines: '',
  cookingSkill: '',
  maxPrepTimeMinutes: '',
  availableEquipment: '',
  planBreakfast: false,
  planLunch: false,
  planDinner: false,
  planSnacks: false,
  daysPerWeek: '',
  mealsPerDay: '',
  allowRepeats: false,
  budgetLevel: '',
  weeklyBudget: '',
};

function PreferencesWizardContent() {
  const router = useRouter();
  const { preferences, setPreferences } = usePreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Load existing preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const token = authService.getToken();
        
        if (!token) {
          // No auth, start with empty preferences
          setPreferences({ common: emptyCommonPreferences, meal: emptyMealPreferences });
          setLoading(false);
          return;
        }
        
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        // Fetch common prefs
        const commonRes = await fetch(`${API_URL}/api/preferences/common`, { headers });
        let commonData = emptyCommonPreferences;
        if (commonRes.ok) {
          const common = await commonRes.json();
          if (common && Object.keys(common).length > 0) {
            commonData = {
              sex: common.sex || '',
              age: common.age ? String(common.age) : '',
              heightCm: common.heightCm ? String(common.heightCm) : '',
              weightKg: common.weightKg ? String(common.weightKg) : '',
              activityLevel: common.activityLevel || '',
              primaryGoal: common.primaryGoal || '',
              targetWeightKg: common.targetWeightKg ? String(common.targetWeightKg) : '',
              goalTimeframeWeeks: common.goalTimeframeWeeks ? String(common.goalTimeframeWeeks) : '',
              trackingStrictness: common.trackingStrictness || '',
              householdSize: common.householdSize ? String(common.householdSize) : '',
            };
          }
        }

        // Fetch meal prefs
        const mealRes = await fetch(`${API_URL}/api/preferences/meals`, { headers });
        let mealData = emptyMealPreferences;
        if (mealRes.ok) {
          const meal = await mealRes.json();
          if (meal && Object.keys(meal).length > 0) {
            const stringifyList = (arr: string[] | undefined) => (Array.isArray(arr) ? arr.join(', ') : '');
            mealData = {
              dietType: meal.dietType || '',
              religiousRules: stringifyList(meal.religiousRules),
              allergies: stringifyList(meal.allergies),
              intolerances: stringifyList(meal.intolerances),
              dislikedIngredients: stringifyList(meal.dislikedIngredients),
              avoidedCuisines: stringifyList(meal.avoidedCuisines),
              favoriteFoods: stringifyList(meal.favoriteFoods),
              favoriteCuisines: stringifyList(meal.favoriteCuisines),
              cookingSkill: meal.cookingSkill || '',
              maxPrepTimeMinutes: meal.maxPrepTimeMinutes ? String(meal.maxPrepTimeMinutes) : '',
              availableEquipment: stringifyList(meal.availableEquipment),
              planBreakfast: meal.planMealsFor?.breakfast ?? false,
              planLunch: meal.planMealsFor?.lunch ?? false,
              planDinner: meal.planMealsFor?.dinner ?? false,
              planSnacks: meal.planMealsFor?.snacks ?? false,
              daysPerWeek: meal.daysPerWeek ? String(meal.daysPerWeek) : '',
              mealsPerDay: meal.mealsPerDay ? String(meal.mealsPerDay) : '',
              allowRepeats: meal.allowRepeats ?? false,
              budgetLevel: meal.budgetLevel || '',
              weeklyBudget: meal.weeklyBudget ? String(meal.weeklyBudget) : '',
            };
          }
        }

        setPreferences({ common: commonData, meal: mealData });
      } catch (err) {
        console.log('Error loading preferences', err);
        // On error, start with empty preferences
        setPreferences({ common: emptyCommonPreferences, meal: emptyMealPreferences });
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [setPreferences]);

  const parseList = (str: string) =>
    str.split(',').map(s => s.trim()).filter(s => s.length > 0);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = authService.getToken();
      
      if (!token) {
        Alert.alert('Error', 'Please login to save preferences');
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const { common, meal } = preferences;

      const commonBody = {
        sex: common.sex || undefined,
        age: common.age ? Number(common.age) : undefined,
        heightCm: common.heightCm ? Number(common.heightCm) : undefined,
        weightKg: common.weightKg ? Number(common.weightKg) : undefined,
        activityLevel: common.activityLevel || undefined,
        primaryGoal: common.primaryGoal || undefined,
        targetWeightKg: common.targetWeightKg ? Number(common.targetWeightKg) : undefined,
        goalTimeframeWeeks: common.goalTimeframeWeeks ? Number(common.goalTimeframeWeeks) : undefined,
        trackingStrictness: common.trackingStrictness || undefined,
        householdSize: common.householdSize ? Number(common.householdSize) : undefined,
      };

      const mealBody = {
        dietType: meal.dietType || undefined,
        religiousRules: parseList(meal.religiousRules),
        allergies: parseList(meal.allergies),
        intolerances: parseList(meal.intolerances),
        dislikedIngredients: parseList(meal.dislikedIngredients),
        avoidedCuisines: parseList(meal.avoidedCuisines),
        favoriteFoods: parseList(meal.favoriteFoods),
        favoriteCuisines: parseList(meal.favoriteCuisines),
        cookingSkill: meal.cookingSkill || undefined,
        maxPrepTimeMinutes: meal.maxPrepTimeMinutes ? Number(meal.maxPrepTimeMinutes) : undefined,
        availableEquipment: parseList(meal.availableEquipment),
        planMealsFor: {
          breakfast: meal.planBreakfast,
          lunch: meal.planLunch,
          dinner: meal.planDinner,
          snacks: meal.planSnacks,
        },
        daysPerWeek: meal.daysPerWeek ? Number(meal.daysPerWeek) : undefined,
        mealsPerDay: meal.mealsPerDay ? Number(meal.mealsPerDay) : undefined,
        allowRepeats: meal.allowRepeats,
        budgetLevel: meal.budgetLevel || undefined,
        weeklyBudget: meal.weeklyBudget ? Number(meal.weeklyBudget) : undefined,
      };

      // Save common preferences
      const commonRes = await fetch(`${API_URL}/api/preferences/common`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(commonBody),
      });

      if (!commonRes.ok) {
        throw new Error('Failed to save common preferences');
      }

      // Save meal preferences
      const mealRes = await fetch(`${API_URL}/api/preferences/meals`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(mealBody),
      });

      if (!mealRes.ok) {
        throw new Error('Failed to save meal preferences');
      }

      // Navigate back to meal page
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/meal');
      }
      
    } catch (err) {
      console.log('Error saving preferences', err);
      Alert.alert('Error', 'Could not save preferences. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-black" style={{ paddingTop: 50 }}>
        <ActivityIndicator size="large" color="#9333EA" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading preferences...</Text>
      </View>
    );
  }

  // Render current step
  switch (currentStep) {
    case 1:
      return <Step1BasicInfo onNext={handleNext} onBack={handleBack} />;
    case 2:
      return <Step2Goals onNext={handleNext} onBack={handleBack} />;
    case 3:
      return <Step3Dietary onNext={handleNext} onBack={handleBack} />;
    case 4:
      return <Step4FoodPrefs onNext={handleNext} onBack={handleBack} />;
    case 5:
      return <Step5Cooking onNext={handleNext} onBack={handleBack} isSubmitting={submitting} />;
    default:
      return <Step1BasicInfo onNext={handleNext} onBack={handleBack} />;
  }
}

export default function PreferencesWizard() {
  return (
    <PreferencesProvider>
      <PreferencesWizardContent />
    </PreferencesProvider>
  );
}
