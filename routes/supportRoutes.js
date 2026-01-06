import { Router } from "express";
import {
  getSupportSessions,
  createSupportSession,
  getSupportMessages,
  sendSupportMessage,
  deleteSupportSession
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Support Chat Sessions
router.route("/sessions")
  .get(protect, getSupportSessions)
  .post(protect, createSupportSession);

router.route("/sessions/:id")
  .delete(protect, deleteSupportSession);

// Support Messages
router.route("/sessions/:sessionId/messages")
  .get(protect, getSupportMessages)
  .post(protect, sendSupportMessage);

export default router;
