// controllers/mealControllers.js
import axios from "axios";
import asyncHandler from "express-async-handler";
import Meal from "../models/Meal.js";
import mealPlanService from "../services/mealPlanService.js";

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com";

// @desc   Get user's meal plan (based on preferences)
// @route  GET /api/meals/plan
// @access Private
export const getMealPlan = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const mealPlan = await mealPlanService.getMealPlan(req.user._id);
  res.json(mealPlan);
});

// @desc   Regenerate meal plan with current preferences
// @route  POST /api/meals/plan/regenerate
// @access Private
export const regenerateMealPlan = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const mealPlan = await mealPlanService.regenerateMealPlan(req.user._id);
  res.json(mealPlan);
});

// @desc   Save a meal for the logged-in user (favorite, etc.)
// @route  POST /api/meals/save
// @access Private
export const saveMeal = asyncHandler(async (req, res) => {
  const { spoonacularId, title, image, sourceUrl, readyInMinutes, servings, rawData } = req.body;

  if (!spoonacularId || !title) {
    res.status(400);
    throw new Error("spoonacularId and title are required");
  }

  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const existing = await Meal.findOne({
    user: req.user._id,
    spoonacularId,
  });

  if (existing) {
    return res.status(200).json(existing); // already saved
  }

  const meal = await Meal.create({
    user: req.user._id,
    spoonacularId,
    title,
    image,
    sourceUrl,
    readyInMinutes,
    servings,
    rawData,
  });

  res.status(201).json(meal);
});

// @desc   Get all saved meals for current user
// @route  GET /api/meals/saved
// @access Private
export const getSavedMeals = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized");
  }

  const meals = await Meal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(meals);
});

// @desc   Search meals from Spoonacular (public)
// @route  GET /api/meals/search
// @access Public
export const searchMeals = asyncHandler(async (req, res) => {
  const query = req.query.query || "healthy";

  try {
    const { data } = await axios.get(
      `${SPOONACULAR_BASE_URL}/recipes/complexSearch`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          query,
          number: 10,
          addRecipeInformation: true,
        },
      }
    );

    res.json(data);
  } catch (error) {
    console.error("Error fetching meals from Spoonacular:", error.response?.data || error.message);
    res.status(500).json({ message: "Error fetching meals from Spoonacular" });
  }
});

// @desc   Get meal details from Spoonacular
// @route  GET /api/meals/:id
// @access Public
export const getMealDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const { data } = await axios.get(
      `${SPOONACULAR_BASE_URL}/recipes/${id}/information`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
          includeNutrition: true,
        },
      }
    );

    res.json(data);
  } catch (error) {
    console.error("Error fetching meal details:", error.response?.data || error.message);
    res.status(500).json({ message: "Error fetching meal details" });
  }
});

export const getAllMealsDebug = asyncHandler(async (req, res) => {
  const meals = await Meal.find().populate("user", "name email");
  res.json(meals);
});