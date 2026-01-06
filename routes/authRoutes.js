// routes/authRoutes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updatePassword,
} from "../controllers/authControllers.js";

import { protect } from "../middleware/authMiddleware.js";
import { authRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.post("/register", authRateLimiter, registerUser);

router.post("/signup", authRateLimiter, registerUser);

router.post("/login", authRateLimiter, loginUser);

router.post("/logout", logoutUser);

router.put("/update-password", protect, updatePassword);

router.get("/me", protect, getMe);

export default router;
