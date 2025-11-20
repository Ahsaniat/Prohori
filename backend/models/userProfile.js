
const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true },
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
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'user_profiles' });

module.exports = mongoose.model('UserProfile', userProfileSchema);
