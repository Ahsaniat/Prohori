import mongoose from "mongoose";

const mealPreferencesSchema = new mongoose.Schema(
  {
    // Still 1:1 with User, but separate from common
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Diet type & religious rules
    dietType: {
      type: String,
      enum: [
        "none",
        "vegetarian",
        "vegan",
        "pescatarian",
        "keto",
        "mediterranean",
        "high_protein",
        "other",
      ],
      default: "none",
    },
    religiousRules: [
      {
        type: String,
        enum: ["halal", "kosher", "no_pork", "no_beef", "other"],
      },
    ],

    // Allergies / intolerances (maps well to Spoonacular filters)
    allergies: [String],      // e.g. ["nuts", "dairy"]
    intolerances: [String],   // e.g. ["gluten", "soy"]

    // Likes / dislikes
    dislikedIngredients: [String],
    avoidedCuisines: [String],
    favoriteFoods: [String],
    favoriteCuisines: [String],

    // Cooking constraints
    cookingSkill: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
    },
    maxPrepTimeMinutes: {
      type: Number,
      default: 30,
    },
    availableEquipment: [String], // ["oven", "microwave", "air_fryer", "blender"]

    // Structure of meal plan
    planMealsFor: {
      breakfast: { type: Boolean, default: true },
      lunch: { type: Boolean, default: true },
      dinner: { type: Boolean, default: true },
      snacks: { type: Boolean, default: false },
    },
    daysPerWeek: { type: Number, default: 7 },
    mealsPerDay: { type: Number, default: 3 },
    allowRepeats: { type: Boolean, default: true },

    // Budget just for food
    budgetLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    weeklyBudget: Number,
  },
  { timestamps: true }
);

const MealPreferences = mongoose.model(
  "MealPreferences",
  mealPreferencesSchema
);

export default MealPreferences;
