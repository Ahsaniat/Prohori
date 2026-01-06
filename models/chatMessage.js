import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'] },
    content: String,
    metadata: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now }
}, { collection: 'chat_messages' });

export default mongoose.model('ChatMessage', chatMessageSchema);