import asyncHandler from 'express-async-handler';
import notificationService from '../services/notificationService.js';
import User from '../models/User.js';

// @desc    Send a push notification to a specific user (Internal/Test use)
// @route   POST /api/notifications/send
// @access  Private (Admin/System)
export const sendPushNotification = asyncHandler(async (req, res) => {
  const { userId, title, body, data } = req.body;

  if (!userId) {
    res.status(400);
    throw new Error('User ID is required');
  }

  await notificationService.sendToUser(userId, title, body, data);
  res.status(200).json({ success: true, message: 'Notification sent (if user has token and prefs allow)' });
});

// @desc    Send bulk notifications (e.g. Marketing)
// @route   POST /api/notifications/send-bulk
// @access  Private (Admin)
export const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { title, body, data } = req.body;

  // Example: Find all users who have a token and marketing enabled
  const users = await User.find({ 
    pushToken: { $exists: true },
    'notificationPreferences.marketing': true 
  }).select('_id pushToken'); // Only need ID and Token

  if (users.length === 0) {
     return res.status(200).json({ success: true, message: 'No users found for this broadcast.' });
  }

  // Map to the structure expected by sendBatch: [{ userId, pushToken }]
  const recipients = users.map(u => ({ userId: u._id, pushToken: u.pushToken }));

  const tickets = await notificationService.sendBatch(recipients, title, body, { ...data, type: 'offer' });
  res.status(200).json({ success: true, count: recipients.length, tickets });
});

// @desc    Save/Register Push Token
// @route   POST /api/notifications/token
// @access  Private
export const savePushToken = asyncHandler(async (req, res) => {
  const { pushToken } = req.body;
  
  req.user.pushToken = pushToken;
  await req.user.save();

  res.status(200).json({ success: true, message: 'Push token saved' });
});

// @desc    Get Notification Preferences
// @route   GET /api/notifications/preferences
// @access  Private
export const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json(user.notificationPreferences);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Update Notification Preferences
// @route   PUT /api/notifications/preferences
// @access  Private
export const updatePreferences = asyncHandler(async (req, res) => {
  const { marketing, security, updates } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    user.notificationPreferences = {
      marketing: marketing !== undefined ? marketing : user.notificationPreferences.marketing,
      security: security !== undefined ? security : user.notificationPreferences.security,
      updates: updates !== undefined ? updates : user.notificationPreferences.updates,
    };

    const updatedUser = await user.save();
    res.json(updatedUser.notificationPreferences);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
