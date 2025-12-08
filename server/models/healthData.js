import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
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

export default mongoose.model('HealthData', healthDataSchema);