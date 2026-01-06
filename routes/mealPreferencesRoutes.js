// routes/mealPreferencesRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserMealPreferences,
  upsertUserMealPreferences,
} from "../controllers/mealPreferencesControllers.js";

const router = Router();

// GET current user's meal prefs
router.get("/", protect, getUserMealPreferences);

// PUT (create/update) current user's meal prefs
router.put("/", protect, upsertUserMealPreferences);

export default router;
