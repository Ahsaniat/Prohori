// server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import { Expo } from 'expo-server-sdk';
import User from './models/User.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// 👇 This now matches the default export
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import notificationTestRoutes from './routes/notificationTestRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-test', notificationTestRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(async () => {
      console.log('MongoDB connected');
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });
      
      // Auto-start notification test
      setTimeout(async () => {
        try {
          const expo = new Expo();
          const users = await User.find({ pushToken: { $exists: true, $ne: null } });
          
          if (users.length > 0) {
            console.log(`Starting auto notifications for ${users.length} users`);
            
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
            
            let messageIndex = 0;
            
            setInterval(async () => {
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
                  console.log(`✅ Sent: ${message.title}`);
                } catch (error) {
                  console.error('Error sending notifications:', error);
                }
              }

              messageIndex++;
            }, 5000);
          } else {
            console.log('No users with push tokens found');
          }
        } catch (error) {
          console.error('Error starting auto notifications:', error);
        }
      }, 3000);
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
    });
} else {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
