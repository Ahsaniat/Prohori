import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: String,
    last_message_at: { type: Date, default: Date.now },
    created_at: { type: Date, default: Date.now }
}, { collection: 'chat_sessions' });

export default mongoose.model('ChatSession', chatSessionSchema);