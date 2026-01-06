// routes/commonPreferencesRoutes.js
import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getUserCommonPreferences,
  upsertUserCommonPreferences,
} from "../controllers/commonPreferencesControllers.js";

const router = Router();

// GET current user's common prefs
router.get("/", protect, getUserCommonPreferences);

// PUT (create/update) current user's common prefs
router.put("/", protect, upsertUserCommonPreferences);

export default router;
