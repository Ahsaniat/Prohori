import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    display_name: String,
    avatar_url: String,
    bio: String,
    height: Number,
    weight: Number,
    age: Number,
    gender: String,
    fitness_level: String,
    goals: [String],
    theme_preference: String,
    phone: String,
    date_of_birth: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'user_profiles' });

export default mongoose.model('UserProfile', userProfileSchema);