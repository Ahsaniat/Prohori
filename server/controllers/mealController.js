import asyncHandler from "express-async-handler";
import MealPlan from "../models/mealPlan.js";
import Recipe from "../models/recipe.js";

// --- MEAL PLANS ---

// @desc   Get user meal plans
// @route  GET /api/meals/plans
// @access Private
export const getMealPlans = asyncHandler(async (req, res) => {
  const plans = await MealPlan.find({ user_id: req.user._id }).sort({ date: -1 });
  res.json(plans);
});

// @desc   Create a meal plan
// @route  POST /api/meals/plans
// @access Private
export const createMealPlan = asyncHandler(async (req, res) => {
  const { name, description, date, meals, total_calories } = req.body;

  const plan = await MealPlan.create({
    user_id: req.user._id,
    name,
    description,
    date: date || new Date(),
    meals,
    total_calories
  });

  res.status(201).json(plan);
});

// @desc   Get single meal plan
// @route  GET /api/meals/plans/:id
// @access Private
export const getMealPlanById = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);

  if (plan) {
    if (plan.user_id.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to view this plan');
    }
    res.json(plan);
  } else {
    res.status(404);
    throw new Error('Meal plan not found');
  }
});

// @desc   Update meal plan
// @route  PUT /api/meals/plans/:id
// @access Private
export const updateMealPlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);

  if (!plan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }

  if (plan.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedPlan = await MealPlan.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedPlan);
});

// @desc   Delete meal plan
// @route  DELETE /api/meals/plans/:id
// @access Private
export const deleteMealPlan = asyncHandler(async (req, res) => {
  const plan = await MealPlan.findById(req.params.id);

  if (!plan) {
    res.status(404);
    throw new Error('Meal plan not found');
  }

  if (plan.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await plan.deleteOne();
  res.json({ message: 'Meal plan removed' });
});

// --- RECIPES ---

// @desc   Get recipes (user's + suggested?)
// @route  GET /api/meals/recipes
// @access Private
export const getRecipes = asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ user_id: req.user._id });
  res.json(recipes);
});

// @desc   Create recipe
// @route  POST /api/meals/recipes
// @access Private
export const createRecipe = asyncHandler(async (req, res) => {
  const { name, ingredients, instructions, calories, prep_time, cook_time } = req.body;

  const recipe = await Recipe.create({
    user_id: req.user._id,
    name,
    ingredients,
    instructions,
    calories,
    prep_time,
    cook_time
  });

  res.status(201).json(recipe);
});

// @desc   Update recipe
// @route  PUT /api/meals/recipes/:id
// @access Private
export const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  if (recipe.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedRecipe = await Recipe.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedRecipe);
});

// @desc   Delete recipe
// @route  DELETE /api/meals/recipes/:id
// @access Private
export const deleteRecipe = asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);

  if (!recipe) {
    res.status(404);
    throw new Error('Recipe not found');
  }

  if (recipe.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await recipe.deleteOne();
  res.json({ message: 'Recipe removed' });
});
