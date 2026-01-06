import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings,
  getHealthData,
  addHealthData,
  updateHealthData,
  deleteHealthData,
  deleteUser
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.route("/account")
  .delete(protect, deleteUser);

router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route("/settings")
  .get(protect, getUserSettings)
  .post(protect, updateUserSettings);

router.route("/health")
  .get(protect, getHealthData)
  .post(protect, addHealthData);

router.route("/health/:id")
  .put(protect, updateHealthData)
  .delete(protect, deleteHealthData);

export default router;
