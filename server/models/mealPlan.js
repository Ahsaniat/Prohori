import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: String,
    description: String,
    date: { type: Date, default: Date.now },
    meals: [{
        type: { type: String }, // e.g., Breakfast, Lunch
        name: { type: String },
        time: { type: String },
        items: [{
            name: { type: String },
            quantity: { type: Number },
            unit: { type: String },
            calories: { type: Number },
            protein: { type: Number },
            carbs: { type: Number },
            fats: { type: Number }
        }]
    }],
    total_calories: Number,
    total_protein: Number,
    total_carbs: Number,
    total_fats: Number,
    is_ai_generated: Boolean,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'meal_plans' });

export default mongoose.model('MealPlan', mealPlanSchema);