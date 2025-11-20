
const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    user_id: String,
    name: String,
    description: String,
    ingredients: [{
        name: String,
        quantity: Number,
        unit: String
    }],
    instructions: [String],
    prep_time: Number,
    cook_time: Number,
    servings: Number,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
    image_url: String,
    tags: [String],
    is_suggested: Boolean,
    is_favorite: Boolean,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'recipes' });

module.exports = mongoose.model('Recipe', recipeSchema);
