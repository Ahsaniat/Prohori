import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    settings_key: String,
    settings_value: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'user_settings' });

export default mongoose.model('UserSettings', userSettingsSchema);