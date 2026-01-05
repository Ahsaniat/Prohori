// Shared types and context for preferences wizard
import { createContext, useContext, ReactNode, useState } from 'react';

export interface CommonPreferences {
  sex: string;
  age: string;
  heightCm: string;
  weightKg: string;
  activityLevel: string;
  primaryGoal: string;
  targetWeightKg: string;
  goalTimeframeWeeks: string;
  trackingStrictness: string;
  householdSize: string;
}

export interface MealPreferences {
  dietType: string;
  religiousRules: string;
  allergies: string;
  intolerances: string;
  dislikedIngredients: string;
  avoidedCuisines: string;
  favoriteFoods: string;
  favoriteCuisines: string;
  cookingSkill: string;
  maxPrepTimeMinutes: string;
  availableEquipment: string;
  planBreakfast: boolean;
  planLunch: boolean;
  planDinner: boolean;
  planSnacks: boolean;
  daysPerWeek: string;
  mealsPerDay: string;
  allowRepeats: boolean;
  budgetLevel: string;
  weeklyBudget: string;
}

export interface PreferencesState {
  common: CommonPreferences;
  meal: MealPreferences;
}

export const defaultCommonPreferences: CommonPreferences = {
  sex: 'prefer_not_to_say',
  age: '',
  heightCm: '',
  weightKg: '',
  activityLevel: 'sedentary',
  primaryGoal: 'maintain_weight',
  targetWeightKg: '',
  goalTimeframeWeeks: '',
  trackingStrictness: 'medium',
  householdSize: '1',
};

export const defaultMealPreferences: MealPreferences = {
  dietType: 'none',
  religiousRules: '',
  allergies: '',
  intolerances: '',
  dislikedIngredients: '',
  avoidedCuisines: '',
  favoriteFoods: '',
  favoriteCuisines: '',
  cookingSkill: 'beginner',
  maxPrepTimeMinutes: '30',
  availableEquipment: '',
  planBreakfast: true,
  planLunch: true,
  planDinner: true,
  planSnacks: false,
  daysPerWeek: '7',
  mealsPerDay: '3',
  allowRepeats: true,
  budgetLevel: 'medium',
  weeklyBudget: '',
};

interface PreferencesContextType {
  preferences: PreferencesState;
  updateCommon: (key: keyof CommonPreferences, value: string) => void;
  updateMeal: (key: keyof MealPreferences, value: string | boolean) => void;
  setPreferences: (prefs: PreferencesState) => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferencesState] = useState<PreferencesState>({
    common: defaultCommonPreferences,
    meal: defaultMealPreferences,
  });

  const updateCommon = (key: keyof CommonPreferences, value: string) => {
    setPreferencesState((prev) => ({
      ...prev,
      common: { ...prev.common, [key]: value },
    }));
  };

  const updateMeal = (key: keyof MealPreferences, value: string | boolean) => {
    setPreferencesState((prev) => ({
      ...prev,
      meal: { ...prev.meal, [key]: value },
    }));
  };

  const setPreferences = (prefs: PreferencesState) => {
    setPreferencesState(prefs);
  };

  return (
    <PreferencesContext.Provider value={{ preferences, updateCommon, updateMeal, setPreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
}

// Selection options for dropdowns
export const SEX_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

export const ACTIVITY_LEVELS = [
  { label: 'Sedentary (little or no exercise)', value: 'sedentary' },
  { label: 'Light (1-3 days/week)', value: 'light' },
  { label: 'Moderate (3-5 days/week)', value: 'moderate' },
  { label: 'Active (6-7 days/week)', value: 'active' },
  { label: 'Athlete (twice daily)', value: 'athlete' },
];

export const PRIMARY_GOALS = [
  { label: 'Lose Weight', value: 'lose_weight' },
  { label: 'Maintain Weight', value: 'maintain_weight' },
  { label: 'Gain Weight', value: 'gain_weight' },
  { label: 'Build Muscle', value: 'performance' },
  { label: 'Manage Health Condition', value: 'manage_condition' },
];

export const TRACKING_STRICTNESS = [
  { label: 'Strict', value: 'strict' },
  { label: 'Medium', value: 'medium' },
  { label: 'Relaxed', value: 'relaxed' },
];

export const DIET_TYPES = [
  { label: 'No Restrictions', value: 'none' },
  { label: 'Vegetarian', value: 'vegetarian' },
  { label: 'Vegan', value: 'vegan' },
  { label: 'Pescatarian', value: 'pescatarian' },
  { label: 'Keto', value: 'keto' },
  { label: 'Paleo', value: 'paleo' },
  { label: 'Mediterranean', value: 'mediterranean' },
  { label: 'Low Carb', value: 'low_carb' },
  { label: 'Gluten Free', value: 'gluten_free' },
];

export const COOKING_SKILLS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

export const BUDGET_LEVELS = [
  { label: 'Low Budget', value: 'low' },
  { label: 'Medium Budget', value: 'medium' },
  { label: 'High Budget', value: 'high' },
];

export const COMMON_ALLERGIES = [
  'Peanuts', 'Tree Nuts', 'Dairy', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'
];

export const COMMON_INTOLERANCES = [
  'Gluten', 'Lactose', 'Fructose', 'FODMAP', 'Sulfites'
];

export const RELIGIOUS_RULES = [
  { label: 'Halal', value: 'halal' },
  { label: 'Kosher', value: 'kosher' },
  { label: 'No Pork', value: 'no_pork' },
  { label: 'No Beef', value: 'no_beef' },
  { label: 'No Alcohol', value: 'no_alcohol' },
];

export const CUISINES = [
  'American', 'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 
  'Thai', 'Mediterranean', 'French', 'Korean', 'Vietnamese', 'Greek'
];

export const EQUIPMENT = [
  'Stove', 'Oven', 'Microwave', 'Air Fryer', 'Instant Pot', 'Blender', 
  'Food Processor', 'Grill', 'Slow Cooker', 'Rice Cooker'
];
