import mongoose from 'mongoose';

const workoutRoutineSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'Daily Workout' }, // Overall title, e.g., "Morning Cardio"
    focus: String, // e.g., "Cardio", "Strength", "Yoga"
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    
    // The core AI-generated content
    videos: [{
        youtubeId: { type: String, required: true },
        title: { type: String, required: true },
        thumbnail: String,
        duration: String, // e.g., "15:30" or "15 min"
        channelName: String
    }],

    // Metadata
    totalDuration: Number, // Total minutes estimated
    caloriesBurned: Number, // Estimated total
    
    is_completed: { type: Boolean, default: false },
    completed_at: Date,
    
    generatedAt: { type: Date, default: Date.now }
}, { 
    collection: 'workout_routines',
    timestamps: true 
});

export default mongoose.model('WorkoutRoutine', workoutRoutineSchema);