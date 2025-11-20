
const mongoose = require('mongoose');

const workoutRoutineSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    name: String,
    description: String,
    exercises: [{
        name: String,
        sets: Number,
        reps: Number,
        weight: Number,
        rest_seconds: Number,
        notes: String,
        duration_minutes: Number,
        intensity: String
    }],
    difficulty: String,
    duration: Number,
    calories_burned: Number,
    tags: [String],
    is_suggested: Boolean,
    is_completed: Boolean,
    completed_at: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'workout_routines' });

module.exports = mongoose.model('WorkoutRoutine', workoutRoutineSchema);
