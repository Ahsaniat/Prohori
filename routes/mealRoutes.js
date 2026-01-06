// routes/mealRoutes.js
import { Router } from "express";
import {
  searchMeals,
  getMealDetails,
  saveMeal,
  getSavedMeals,
  getAllMealsDebug,
  getMealPlan,
  regenerateMealPlan,
} from "../controllers/mealControllers.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Meal plan routes (authenticated)
router.get("/plan", protect, getMealPlan);
router.post("/plan/regenerate", protect, regenerateMealPlan);

// public Spoonacular proxy
router.get("/search", searchMeals);
router.get("/:id", getMealDetails);

// private DB-backed routes
router.post("/save", protect, saveMeal);
router.get("/saved", protect, getSavedMeals);
router.get("/debug/all", protect, getAllMealsDebug);

export default router;
