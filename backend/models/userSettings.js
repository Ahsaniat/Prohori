
const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    settings_key: String,
    settings_value: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'user_settings' });

module.exports = mongoose.model('UserSettings', userSettingsSchema);
