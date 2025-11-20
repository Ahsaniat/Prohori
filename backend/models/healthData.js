
const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    date: String,
    steps: Number,
    distance: Number,
    calories_burned: Number,
    active_minutes: Number,
    heart_rate_avg: Number,
    heart_rate_max: Number,
    heart_rate_min: Number,
    sleep_hours: Number,
    sleep_quality: String,
    water_intake: Number,
    weight: Number,
    blood_pressure_systolic: Number,
    blood_pressure_diastolic: Number,
    metadata: mongoose.Schema.Types.Mixed,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'health_data' });

module.exports = mongoose.model('HealthData', healthDataSchema);
