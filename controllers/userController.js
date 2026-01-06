import asyncHandler from "express-async-handler";
import UserProfile from "../models/userProfile.js";
import UserSettings from "../models/userSettings.js";
import HealthData from "../models/healthData.js";
import User from "../models/User.js";

// @desc   Get user profile
// @route  GET /api/user/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOne({ user_id: req.user._id });
  const user = req.user; // Auth middleware attaches user

  if (profile) {
    const profileData = profile.toObject();
    // Map fields for client
    res.json({
      ...profileData,
      name: profileData.display_name || user.name,
      email: user.email,
      phone: profileData.phone,
      address: prfileData.address,
      dateOfBirth: profileData.date_of_birth
    });
  } else {
    // Return basic user info if profile doesn't exist yet
    res.json({
      name: user.name,
      email: user.email,
      phone: '',
      address: '',
      dateOfBirth: ''
    });
  }
});

// @desc   Create or Update user profile
// @route  PUT /api/user/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { 
    display_name, name, // Client sends name
    avatar_url, bio, height, weight, age, gender, fitness_level, goals, theme_preference,
    phone, dateOfBirth // Client sends these
  } = req.body;

  let profile = await UserProfile.findOne({ user_id: req.user._id });

  const finalDisplayName = display_name || name;

  if (profile) {
    profile.display_name = finalDisplayName || profile.display_name;
    profile.avatar_url = avatar_url || profile.avatar_url;
    profile.bio = bio || profile.bio;
    profile.height = height || profile.height;
    profile.weight = weight || profile.weight;
    profile.age = age || profile.age;
    profile.gender = gender || profile.gender;
    profile.fitness_level = fitness_level || profile.fitness_level;
    profile.goals = goals || profile.goals;
    profile.theme_preference = theme_preference || profile.theme_preference;
    profile.phone = phone || profile.phone;
    profile.address = address || profile.address;
    profile.date_of_birth = dateOfBirth || profile.date_of_birth;
    profile.updated_at = Date.now();

    const updatedProfile = await profile.save();
    
    // Also update User model name if changed
    if (finalDisplayName) {
        req.user.name = finalDisplayName;
        await req.user.save();
    }

    res.json(updatedProfile);
  } else {
    profile = await UserProfile.create({
      user_id: req.user._id,
      display_name: finalDisplayName,
      avatar_url,
      bio,
      height,
      weight,
      age,
      gender,
      fitness_level,
      goals,
      theme_preference,
      address,
      phone,
      date_of_birth: dateOfBirth
    });
    
    // Also update User model name if changed
    if (finalDisplayName) {
        req.user.name = finalDisplayName;
        await req.user.save();
    }
    
    res.status(201).json(profile);
  }
});

// @desc   Get user settings
// @route  GET /api/user/settings
// @access Private
export const getUserSettings = asyncHandler(async (req, res) => {
  const settings = await UserSettings.find({ user_id: req.user._id });
  res.json(settings);
});

// @desc   Update or Create a setting
// @route  POST /api/user/settings
// @access Private
export const updateUserSettings = asyncHandler(async (req, res) => {
  const { key, value } = req.body; // Expecting { key: "notification_push", value: true }

  if (!key) {
    res.status(400);
    throw new Error("Settings key is required");
  }

  // Check if setting exists
  let setting = await UserSettings.findOne({ user_id: req.user._id, settings_key: key });

  if (setting) {
    setting.settings_value = value;
    setting.updated_at = Date.now();
    await setting.save();
    res.json(setting);
  } else {
    setting = await UserSettings.create({
      user_id: req.user._id,
      settings_key: key,
      settings_value: value
    });
    res.status(201).json(setting);
  }
});

// @desc   Get health data (latest or by date)
// @route  GET /api/user/health
// @access Private
export const getHealthData = asyncHandler(async (req, res) => {
  // Optional: filter by date ?date=YYYY-MM-DD
  const { date } = req.query;
  let query = { user_id: req.user._id };
  
  // Note: healthData model has 'date' as Date type now.
  // Querying by date range might be needed if strictly equality fails due to time.
  // For simplicity, let's just return all or sorted by latest.
  
  const data = await HealthData.find(query).sort({ created_at: -1 });
  res.json(data);
});

// @desc   Add health data log
// @route  POST /api/user/health
// @access Private
export const addHealthData = asyncHandler(async (req, res) => {
  const { 
    steps, distance, calories_burned, active_minutes, 
    heart_rate_avg, heart_rate_max, heart_rate_min, resting_heart_rate,
    sleep_hours, sleep_quality, water_intake, weight, height,
    blood_pressure_systolic, blood_pressure_diastolic,
    oxygen_saturation, body_temperature, metadata
  } = req.body;

  // Find record for TODAY to ensure we merge data into a daily summary
  // rather than creating fragmented records (which causes UI to lose previous data).
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const existingRecord = await HealthData.findOne({
    user_id: req.user._id,
    created_at: { $gte: startOfDay }
  }).sort({ created_at: -1 });

  if (existingRecord) {
    // Update existing record
    existingRecord.steps = steps ?? existingRecord.steps;
    existingRecord.distance = distance ?? existingRecord.distance;
    existingRecord.calories_burned = calories_burned ?? existingRecord.calories_burned;
    existingRecord.active_minutes = active_minutes ?? existingRecord.active_minutes;
    existingRecord.heart_rate_avg = heart_rate_avg ?? existingRecord.heart_rate_avg;
    existingRecord.heart_rate_max = heart_rate_max ?? existingRecord.heart_rate_max;
    existingRecord.heart_rate_min = heart_rate_min ?? existingRecord.heart_rate_min;
    existingRecord.resting_heart_rate = resting_heart_rate ?? existingRecord.resting_heart_rate;
    existingRecord.sleep_hours = sleep_hours ?? existingRecord.sleep_hours;
    existingRecord.sleep_quality = sleep_quality ?? existingRecord.sleep_quality;
    existingRecord.water_intake = water_intake ?? existingRecord.water_intake;
    existingRecord.weight = weight ?? existingRecord.weight;
    existingRecord.height = height ?? existingRecord.height;
    existingRecord.blood_pressure_systolic = blood_pressure_systolic ?? existingRecord.blood_pressure_systolic;
    existingRecord.blood_pressure_diastolic = blood_pressure_diastolic ?? existingRecord.blood_pressure_diastolic;
    existingRecord.oxygen_saturation = oxygen_saturation ?? existingRecord.oxygen_saturation;
    existingRecord.body_temperature = body_temperature ?? existingRecord.body_temperature;
    existingRecord.metadata = { ...existingRecord.metadata, ...(metadata || {}) };
    existingRecord.updated_at = Date.now();

    const updatedData = await existingRecord.save();
    return res.status(200).json(updatedData);
  }

  // Create new record if no record exists for today
  const healthData = await HealthData.create({
    user_id: req.user._id,
    steps,
    distance,
    calories_burned,
    active_minutes,
    heart_rate_avg,
    heart_rate_max,
    heart_rate_min,
    resting_heart_rate,
    sleep_hours,
    sleep_quality,
    water_intake,
    weight,
    height,
    blood_pressure_systolic,
    blood_pressure_diastolic,
    oxygen_saturation,
    body_temperature,
    metadata: metadata || { source: 'manual' },
    date: new Date()
  });

  res.status(201).json(healthData);
});

// @desc   Update health data log
// @route  PUT /api/user/health/:id
// @access Private
export const updateHealthData = asyncHandler(async (req, res) => {
  const healthData = await HealthData.findById(req.params.id);

  if (!healthData) {
    res.status(404);
    throw new Error('Health data log not found');
  }

  if (healthData.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedData = await HealthData.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedData);
});

// @desc   Delete health data log
// @route  DELETE /api/user/health/:id
// @access Private
export const deleteHealthData = asyncHandler(async (req, res) => {
  const healthData = await HealthData.findById(req.params.id);

  if (!healthData) {
    res.status(404);
    throw new Error('Health data log not found');
  }

  if (healthData.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await healthData.deleteOne();

  res.json({ message: 'Health data removed' });
});

// @desc   Delete user account
// @route  DELETE /api/user/account
// @access Private
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Delete all related data (optional but recommended)
  // await HealthData.deleteMany({ user_id: req.user._id });
  // await UserProfile.deleteOne({ user_id: req.user._id });
  // await UserSettings.deleteMany({ user_id: req.user._id });
  
  // Note: For a "clean" deletion, you should ideally delete all related documents. 
  // For now, we just delete the user record as requested.
  
  await user.deleteOne();

  res.json({ message: 'User account deleted successfully' });
});
