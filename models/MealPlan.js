import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema({
  spoonacularId: { type: Number, required: true },
  title: { type: String, required: true },
  image: String,
  readyInMinutes: Number,
  servings: Number,
  sourceUrl: String,
  vegetarian: Boolean,
  vegan: Boolean,
  glutenFree: Boolean,
  dairyFree: Boolean,
  healthScore: Number,
  calories: Number,
  protein: Number,
  fat: Number,
  carbs: Number,
});

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    breakfast: [mealItemSchema],
    lunch: [mealItemSchema],
    dinner: [mealItemSchema],
    snacks: [mealItemSchema],
    generatedAt: { type: Date, default: Date.now },
    preferencesHash: String, // To detect if preferences changed
  },
  { timestamps: true }
);

const MealPlan = mongoose.model("MealPlan", mealPlanSchema);
export default MealPlan;
