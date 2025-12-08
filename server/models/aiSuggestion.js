import mongoose from 'mongoose';

const aiSuggestionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

export default mongoose.model('AISuggestion', aiSuggestionSchema);