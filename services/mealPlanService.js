import axios from "axios";
import crypto from "crypto";
import MealPlan from "../models/MealPlan.js";
import MealPreferences from "../models/MealPreferences.js";
import CommonPreferences from "../models/CommonPreferences.js";

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

class MealPlanService {
  
  // Calculate BMR and TDEE
  calculateDailyCalories(commonPrefs) {
    if (!commonPrefs || !commonPrefs.weightKg || !commonPrefs.heightCm || !commonPrefs.age || !commonPrefs.sex) {
      return 2000; // Default fallback
    }

    const { weightKg, heightCm, age, sex, activityLevel, primaryGoal } = commonPrefs;

    // Mifflin-St Jeor Equation
    let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
    
    if (sex === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }

    // Activity Multiplier
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'athlete': 1.9
    };
    
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.2);

    // Goal Adjustment
    let targetCalories = tdee;
    switch (primaryGoal) {
      case 'lose_weight':
        targetCalories -= 500;
        break;
      case 'gain_weight':
        targetCalories += 500;
        break;
      case 'performance': // Build muscle
        targetCalories += 250;
        break;
      case 'maintain_weight':
      case 'manage_condition':
      default:
        break;
    }

    // Safety bounds
    return Math.max(1200, Math.round(targetCalories));
  }

  // Generate a hash of preferences to detect changes
  generatePreferencesHash(mealPrefs, commonPrefs) {
    const key = JSON.stringify({
      // Meal Prefs
      dietType: mealPrefs?.dietType,
      allergies: mealPrefs?.allergies,
      intolerances: mealPrefs?.intolerances,
      dislikedIngredients: mealPrefs?.dislikedIngredients,
      maxPrepTimeMinutes: mealPrefs?.maxPrepTimeMinutes,
      planMealsFor: mealPrefs?.planMealsFor,
      // Common Prefs (affect calories)
      goal: commonPrefs?.primaryGoal,
      activity: commonPrefs?.activityLevel,
      weight: commonPrefs?.weightKg,
      target: commonPrefs?.targetWeightKg
    });
    return crypto.createHash('md5').update(key).digest('hex');
  }

  // Map our diet types to Spoonacular diet parameter
  mapDietType(dietType) {
    const mapping = {
      'vegetarian': 'vegetarian',
      'vegan': 'vegan',
      'pescatarian': 'pescatarian',
      'keto': 'ketogenic',
      'paleo': 'paleo',
      'mediterranean': 'whole30', // closest match
      'low_carb': 'low-carb',
      'gluten_free': 'gluten free',
      'none': null,
    };
    return mapping[dietType] || null;
  }

  // Map intolerances to Spoonacular format
  mapIntolerances(intolerances = [], allergies = []) {
    const spoonacularIntolerances = [
      'dairy', 'egg', 'gluten', 'grain', 'peanut', 'seafood', 
      'sesame', 'shellfish', 'soy', 'sulfite', 'tree nut', 'wheat'
    ];
    
    const combined = [...(intolerances || []), ...(allergies || [])];
    return combined
      .map(i => i.toLowerCase())
      .filter(i => spoonacularIntolerances.some(s => i.includes(s) || s.includes(i)))
      .join(',');
  }

  // Fetch recipes from Spoonacular for a meal type
  async fetchRecipesForMealType(mealType, preferences, targetCalories = null, count = 3) {
    try {
      const params = {
        apiKey: process.env.SPOONACULAR_API_KEY,
        type: mealType,
        number: count,
        addRecipeInformation: true,
        addRecipeNutrition: true,
        sort: 'healthiness',
        instructionsRequired: true,
      };

      // Add diet filter
      const diet = this.mapDietType(preferences.dietType);
      if (diet) {
        params.diet = diet;
      }

      // Add intolerances
      const intolerances = this.mapIntolerances(preferences.intolerances, preferences.allergies);
      if (intolerances) {
        params.intolerances = intolerances;
      }

      // Add max prep time
      if (preferences.maxPrepTimeMinutes) {
        params.maxReadyTime = preferences.maxPrepTimeMinutes;
      }

      // Add excluded ingredients
      if (preferences.dislikedIngredients && preferences.dislikedIngredients.length > 0) {
        params.excludeIngredients = preferences.dislikedIngredients.join(',');
      }

      // Add cuisine preference
      if (preferences.favoriteCuisines && preferences.favoriteCuisines.length > 0) {
        params.cuisine = preferences.favoriteCuisines.join(',');
      }

      // Add Calorie constraints
      if (targetCalories) {
        params.minCalories = Math.max(0, targetCalories - 100);
        params.maxCalories = targetCalories + 100;
      }

      const { data } = await axios.get(
        `${SPOONACULAR_BASE_URL}/recipes/complexSearch`,
        { params }
      );

      return (data.results || []).map(recipe => ({
        spoonacularId: recipe.id,
        title: recipe.title,
        image: recipe.image,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        sourceUrl: recipe.sourceUrl,
        vegetarian: recipe.vegetarian,
        vegan: recipe.vegan,
        glutenFree: recipe.glutenFree,
        dairyFree: recipe.dairyFree,
        healthScore: recipe.healthScore,
        calories: recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount,
        protein: recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount,
        fat: recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount,
        carbs: recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount,
      }));
    } catch (error) {
      console.error(`Error fetching ${mealType} recipes:`, error.response?.data || error.message);
      return [];
    }
  }

  // Generate a complete meal plan based on user preferences
  async generateMealPlan(userId) {
    // Get user preferences (Both Meal and Common)
    const [mealPrefs, commonPrefs] = await Promise.all([
      MealPreferences.findOne({ user: userId }),
      CommonPreferences.findOne({ user: userId })
    ]);
    
    // If absolutely no preferences, fallback
    if (!mealPrefs) {
      return this.generateDefaultMealPlan(userId);
    }

    // Calculate Daily Calories
    const dailyCalories = this.calculateDailyCalories(commonPrefs);

    // Distribute calories (Simple split: 30% Breakfast, 35% Lunch, 35% Dinner, Snacks extra or included)
    // Adjusting for snacks: 25% B, 30% L, 30% D, 15% Snacks (split 2 snacks = 7.5% each)
    const planMealsFor = mealPrefs.planMealsFor || {
      breakfast: true, lunch: true, dinner: true, snacks: false
    };

    let breakfastCals = Math.round(dailyCalories * 0.25);
    let lunchCals = Math.round(dailyCalories * 0.35);
    let dinnerCals = Math.round(dailyCalories * 0.35);
    let snackCals = Math.round(dailyCalories * 0.05); // Per snack

    if (planMealsFor.snacks) {
      // Adjust main meals if snacks are included
      breakfastCals = Math.round(dailyCalories * 0.20);
      lunchCals = Math.round(dailyCalories * 0.30);
      dinnerCals = Math.round(dailyCalories * 0.30);
      snackCals = Math.round(dailyCalories * 0.10); // 10% for snacks total (~200 cal)
    }

    const preferencesHash = this.generatePreferencesHash(mealPrefs, commonPrefs);

    // Fetch recipes for each meal type in parallel
    const [breakfast, lunch, dinner, snacks] = await Promise.all([
      planMealsFor.breakfast ? this.fetchRecipesForMealType('breakfast', mealPrefs, breakfastCals, 3) : [],
      planMealsFor.lunch ? this.fetchRecipesForMealType('main course', mealPrefs, lunchCals, 3) : [],
      planMealsFor.dinner ? this.fetchRecipesForMealType('main course', mealPrefs, dinnerCals, 3) : [],
      planMealsFor.snacks ? this.fetchRecipesForMealType('snack', mealPrefs, snackCals, 2) : [],
    ]);

    // Save to database
    const mealPlan = await MealPlan.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        breakfast,
        lunch,
        dinner,
        snacks,
        generatedAt: new Date(),
        preferencesHash,
      },
      { upsert: true, new: true }
    );

    return mealPlan;
  }

  // Generate default meal plan without preferences
  async generateDefaultMealPlan(userId) {
    const defaultPrefs = {
      dietType: 'none',
      maxPrepTimeMinutes: 45,
      intolerances: [],
      allergies: [],
      dislikedIngredients: [],
      favoriteCuisines: [],
    };

    // Default 2000 calorie split
    const [breakfast, lunch, dinner, snacks] = await Promise.all([
      this.fetchRecipesForMealType('breakfast', defaultPrefs, 500, 3),
      this.fetchRecipesForMealType('main course', defaultPrefs, 700, 3),
      this.fetchRecipesForMealType('main course', defaultPrefs, 700, 3),
      this.fetchRecipesForMealType('snack', defaultPrefs, 100, 2),
    ]);

    const mealPlan = await MealPlan.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        breakfast,
        lunch,
        dinner,
        snacks,
        generatedAt: new Date(),
        preferencesHash: 'default',
      },
      { upsert: true, new: true }
    );

    return mealPlan;
  }

  // Get existing meal plan or generate new one
  async getMealPlan(userId) {
    const existingPlan = await MealPlan.findOne({ user: userId });
    
    // Check current preferences
    const [mealPrefs, commonPrefs] = await Promise.all([
      MealPreferences.findOne({ user: userId }),
      CommonPreferences.findOne({ user: userId })
    ]);

    if (existingPlan && mealPrefs) {
      const currentHash = this.generatePreferencesHash(mealPrefs, commonPrefs);
      if (existingPlan.preferencesHash !== currentHash) {
        // Preferences changed, regenerate
        return this.generateMealPlan(userId);
      }
      return existingPlan;
    }

    // No existing plan, generate new one
    return this.generateMealPlan(userId);
  }

  // Force regenerate meal plan
  async regenerateMealPlan(userId) {
    return this.generateMealPlan(userId);
  }
}

export default new MealPlanService();
