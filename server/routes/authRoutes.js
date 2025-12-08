// routes/authRoutes.js
import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
} from "../controllers/authControllers.js";

import { protect } from "../middleware/authMiddleware.js"; // optional: protect middleware to set req.user

const router = Router();

// POST /api/auth/register  (keeps controller naming)
router.post("/register", registerUser);

// If you prefer the path "/signup", also add an alias:
router.post("/signup", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// POST /api/auth/logout
router.post("/logout", logoutUser);

// GET /api/auth/me  (protected: client must send JWT in Authorization header)
router.get("/me", protect, getMe); // remove 'protect' if you don't have that middleware

export default router;
