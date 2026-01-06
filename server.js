// server.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

// Vercel/Serverless safe connection helper
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected');
    geminiService.initialize();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Middleware to ensure DB is connected before handling requests
app.use(async (req, res, next) => {
  if (MONGO_URI) {
    try {
      await connectDB();
    } catch (err) {
      console.error("Database connection failed in middleware:", err);
      return res.status(500).json({ message: "Database connection failed" });
    }
  }
  next();
});

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import notificationTestRoutes from './routes/notificationTestRoutes.js';
import commonPreferencesRoutes from './routes/commonPreferencesRoutes.js';
import mealPreferencesRoutes from './routes/mealPreferencesRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import geminiService from './services/geminiService.js';

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', chatRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-test', notificationTestRoutes);
app.use('/api/preferences/common', commonPreferencesRoutes);
app.use('/api/preferences/meals', mealPreferencesRoutes);
app.use('/api/goals', goalRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Export app for Vercel
export default app;


// Start server only if run directly (Local Development)
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (MONGO_URI) {
    connectDB()
      .then(() => {
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`Server running on port ${PORT}`);
        });
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err.message);
      });
  } else {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  }
}



