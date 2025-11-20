
const mongoose = require('mongoose');

const aiTaskSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    title: String,
    description: String,
    task_type: String,
    priority: String,
    status: String,
    due_date: Date,
    metadata: mongoose.Schema.Types.Mixed,
    completed_at: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'ai_tasks' });

module.exports = mongoose.model('AITask', aiTaskSchema);
