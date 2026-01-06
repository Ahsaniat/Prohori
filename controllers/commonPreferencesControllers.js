// controllers/commonPreferencesController.js
import asyncHandler from "express-async-handler";
import CommonPreferences from "../models/CommonPreferences.js";
import mealPlanService from "../services/mealPlanService.js";

// @desc    Get current user's common preferences
// @route   GET /api/preferences/common
// @access  Private
export const getUserCommonPreferences = asyncHandler(async (req, res) => {
  // protect middleware should have set req.user
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const prefs = await CommonPreferences.findOne({ user: userId });

  // it's okay if null, frontend can show "no prefs yet"
  res.json(prefs || null);
});

// @desc    Create or update current user's common preferences (upsert)
// @route   PUT /api/preferences/common
// @access  Private
export const upsertUserCommonPreferences = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    res.status(401);
    throw new Error("Not authorized");
  }

  // Just trust the body for now, keep it simple
  const update = {
    ...req.body,
    user: userId, // never trust client for user
  };

  // findOneAndUpdate with upsert = true -> create if not exist
  const prefs = await CommonPreferences.findOneAndUpdate(
    { user: userId },
    update,
    {
      new: true,   // return updated doc
      upsert: true // create if doesn't exist
    }
  );

  // Regenerate meal plan since calorie goals might have changed
  try {
    await mealPlanService.regenerateMealPlan(userId);
  } catch (err) {
    console.error('Error regenerating meal plan:', err);
    // Don't fail the preference save if meal plan fails
  }

  res.json(prefs);
});
