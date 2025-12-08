import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error("MONGO_URI is missing in .env");
    process.exit(1);
}

mongoose.connect(MONGO_URI).then(async () => {
  console.log('Connected to DB');
  const count = await User.countDocuments();
  console.log(`User count: ${count}`);
  if (count > 0) {
    const users = await User.find({}, 'email name');
    console.log('Users:', users);
  } else {
    console.log("No users found.");
  }
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
