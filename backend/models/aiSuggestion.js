
const mongoose = require('mongoose');

const aiSuggestionSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    suggestion_type: String,
    title: String,
    content: String,
    priority: String,
    is_read: Boolean,
    is_acted_upon: Boolean,
    metadata: mongoose.Schema.Types.Mixed,
    expires_at: Date,
    created_at: { type: Date, default: Date.now }
}, { collection: 'ai_suggestions' });

module.exports = mongoose.model('AISuggestion', aiSuggestionSchema);
