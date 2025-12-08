import { Router } from "express";
import {
  getMealPlans,
  createMealPlan,
  getMealPlanById,
  updateMealPlan,
  deleteMealPlan,
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe
} from "../controllers/mealController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Plans
router.route("/plans")
  .get(protect, getMealPlans)
  .post(protect, createMealPlan);

router.route("/plans/:id")
  .get(protect, getMealPlanById)
  .put(protect, updateMealPlan)
  .delete(protect, deleteMealPlan);

// Recipes
router.route("/recipes")
  .get(protect, getRecipes)
  .post(protect, createRecipe);

router.route("/recipes/:id")
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);

export default router;
