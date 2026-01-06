import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getGoals, upsertGoals, getTodayInsights } from '../controllers/goalController.js';

const router = express.Router();

router.get('/', protect, getGoals);
router.put('/', protect, upsertGoals);
router.get('/insights/today', protect, getTodayInsights);

export default router;
