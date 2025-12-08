import { Router } from "express";
import {
  getSessions,
  createSession,
  getMessages,
  sendMessage,
  updateSession,
  deleteSession,
  getTasks,
  updateTask,
  deleteTask,
  getSuggestions,
  updateSuggestion,
  deleteSuggestion
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Chat Sessions
router.route("/sessions")
  .get(protect, getSessions)
  .post(protect, createSession);

router.route("/sessions/:id")
  .put(protect, updateSession)
  .delete(protect, deleteSession);

// Messages
router.route("/sessions/:sessionId/messages")
  .get(protect, getMessages)
  .post(protect, sendMessage);

// AI Tasks
router.route("/tasks")
  .get(protect, getTasks);

router.route("/tasks/:id")
  .put(protect, updateTask)
  .delete(protect, deleteTask);

// AI Suggestions
router.route("/suggestions")
  .get(protect, getSuggestions);

router.route("/suggestions/:id")
  .put(protect, updateSuggestion)
  .delete(protect, deleteSuggestion);

export default router;
