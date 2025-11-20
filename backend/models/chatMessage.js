
const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    session_id: { type: String, required: true },
    user_id: { type: String, required: true },
    role: String,
    content: String,
    metadata: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now }
}, { collection: 'chat_messages' });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
