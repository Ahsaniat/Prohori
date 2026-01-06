// controllers/mealPreferencesController.js
import asyncHandler from "express-async-handler";
import MealPreferences from "../models/MealPreferences.js";
import mealPlanService from "../services/mealPlanService.js";

// @desc    Get current user's meal preferences
// @route   GET /api/preferences/meals
// @access  Private
export const getUserMealPreferences = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const prefs = await MealPreferences.findOne({ user: userId });

  res.json(prefs || null);
});

// @desc    Create or update current user's meal preferences (upsert)
// @route   PUT /api/preferences/meals
// @access  Private
export const upsertUserMealPreferences = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const update = {
    ...req.body,
    user: userId,
  };

  const prefs = await MealPreferences.findOneAndUpdate(
    { user: userId },
    update,
    {
      new: true,
      upsert: true,
    }
  );

  // Regenerate meal plan with new preferences
  try {
    await mealPlanService.regenerateMealPlan(userId);
  } catch (err) {
    console.error('Error regenerating meal plan:', err);
    // Don't fail the preference save if meal plan fails
  }

  res.json(prefs);
});
