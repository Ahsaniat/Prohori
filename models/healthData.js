import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    // Activity data
    steps: Number,
    distance: Number, // in kilometers
    calories_burned: Number,
    active_minutes: Number,
    // Heart rate data
    heart_rate_avg: Number,
    heart_rate_max: Number,
    heart_rate_min: Number,
    resting_heart_rate: Number,
    // Sleep data
    sleep_hours: Number,
    sleep_quality: String, // Good, Fair, Poor
    // Hydration and nutrition
    water_intake: Number, // in liters
    // Body measurements
    weight: Number, // in kg
    height: Number, // in cm
    // Vitals
    blood_pressure_systolic: Number,
    blood_pressure_diastolic: Number,
    oxygen_saturation: Number, // SpO2 percentage
    body_temperature: Number,
    // Additional metadata (for extra Health Connect data)
    metadata: {
        source: String, // 'health_connect', 'manual', etc.
        lastSyncTime: Date,
        deviceInfo: mongoose.Schema.Types.Mixed
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { collection: 'health_data' });

// Index for efficient queries
healthDataSchema.index({ user_id: 1, date: -1 });

export default mongoose.model('HealthData', healthDataSchema);