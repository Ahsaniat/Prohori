
const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    title: String,
    last_message_at: Date,
    created_at: { type: Date, default: Date.now }
}, { collection: 'chat_sessions' });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
