import mongoose from 'mongoose';

const healthGoalSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: { unique: true } },

    // Daily goals
    steps_goal: { type: Number, default: 10000 },
    calories_burn_goal: { type: Number, default: 2000 },
    sleep_hours_goal: { type: Number, default: 8 },
    water_liters_goal: { type: Number, default: 2 },

    // Destination goal (optional)
    target_weight: { type: Number, default: null }, // kg
    target_date: { type: Date, default: null },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { collection: 'health_goals' }
);

export default mongoose.model('HealthGoal', healthGoalSchema);
