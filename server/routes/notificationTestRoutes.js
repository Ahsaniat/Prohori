import express from 'express';
import { Expo } from 'expo-server-sdk';
import User from '../models/User.js';

const router = express.Router();
const expo = new Expo();

const funnyMessages = [
  { title: "💪 Workout Time!", body: "Your muscles are getting impatient. Time to pump some iron!" },
  { title: "🥗 Meal Reminder", body: "Your stomach just sent a notification: Feed me!" },
  { title: "💧 Hydration Alert", body: "Water you waiting for? Drink up!" },
  { title: "🏃 Step Goal", body: "Your couch misses you, but your body doesn't. Let's move!" },
  { title: "😴 Sleep Time", body: "Your phone needs rest too. Goodnight!" },
  { title: "🎯 Daily Goal", body: "Champions aren't made in the gym. Just kidding, they are. Get moving!" },
  { title: "🍎 Healthy Tip", body: "An apple a day keeps... well, you know the rest!" },
  { title: "🧘 Mindfulness", body: "Take a deep breath. Unless you're underwater." },
];

let notificationInterval = null;

router.post('/start-test', async (req, res) => {
  if (notificationInterval) {
    return res.status(400).json({ message: 'Test already running' });
  }

  try {
    const users = await User.find({ pushToken: { $exists: true, $ne: null } });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users with push tokens found' });
    }

    let messageIndex = 0;
    
    notificationInterval = setInterval(async () => {
      const message = funnyMessages[messageIndex % funnyMessages.length];
      const messages = [];

      for (const user of users) {
        if (Expo.isExpoPushToken(user.pushToken)) {
          messages.push({
            to: user.pushToken,
            sound: 'default',
            title: message.title,
            body: message.body,
            data: { timestamp: new Date().toISOString() },
          });
        }
      }

      if (messages.length > 0) {
        try {
          const chunks = expo.chunkPushNotifications(messages);
          for (const chunk of chunks) {
            await expo.sendPushNotificationsAsync(chunk);
          }
          console.log(`Sent notification: ${message.title}`);
        } catch (error) {
          console.error('Error sending notifications:', error);
        }
      }

      messageIndex++;
    }, 5000);

    res.status(200).json({ 
      message: 'Test notifications started',
      interval: '5 seconds',
      usersCount: users.length 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start test', error: error.message });
  }
});

router.post('/stop-test', (req, res) => {
  if (notificationInterval) {
    clearInterval(notificationInterval);
    notificationInterval = null;
    res.status(200).json({ message: 'Test notifications stopped' });
  } else {
    res.status(400).json({ message: 'No test running' });
  }
});

export default router;
