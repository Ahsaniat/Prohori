import { Expo } from 'expo-server-sdk';
import asyncHandler from 'express-async-handler';

const expo = new Expo();

export const sendPushNotification = asyncHandler(async (req, res) => {
  const { pushToken, title, body, data } = req.body;

  if (!Expo.isExpoPushToken(pushToken)) {
    res.status(400);
    throw new Error('Invalid Expo push token');
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title: title || 'Notification',
    body: body || '',
    data: data || {},
  };

  try {
    const ticket = await expo.sendPushNotificationsAsync([message]);
    res.status(200).json({ success: true, ticket });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to send notification');
  }
});

export const sendBulkNotifications = asyncHandler(async (req, res) => {
  const { notifications } = req.body;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    res.status(400);
    throw new Error('Notifications array is required');
  }

  const messages = [];
  for (const notif of notifications) {
    if (Expo.isExpoPushToken(notif.pushToken)) {
      messages.push({
        to: notif.pushToken,
        sound: 'default',
        title: notif.title || 'Notification',
        body: notif.body || '',
        data: notif.data || {},
      });
    }
  }

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  try {
    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    res.status(200).json({ success: true, tickets });
  } catch (error) {
    res.status(500);
    throw new Error('Failed to send bulk notifications');
  }
});

export const savePushToken = asyncHandler(async (req, res) => {
  const { pushToken } = req.body;
  const userId = req.user._id;

  if (!Expo.isExpoPushToken(pushToken)) {
    res.status(400);
    throw new Error('Invalid Expo push token');
  }

  req.user.pushToken = pushToken;
  await req.user.save();

  res.status(200).json({ success: true, message: 'Push token saved' });
});
