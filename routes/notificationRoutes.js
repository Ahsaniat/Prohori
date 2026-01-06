import express from 'express';
import { 
  sendPushNotification, 
  sendBulkNotifications, 
  savePushToken,
  getPreferences,
  updatePreferences
} from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/send', protect, sendPushNotification);
router.post('/send-bulk', protect, sendBulkNotifications);
router.post('/token', protect, savePushToken);
router.get('/preferences', protect, getPreferences);
router.put('/preferences', protect, updatePreferences);

export default router;
