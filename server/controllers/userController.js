import asyncHandler from "express-async-handler";
import UserProfile from "../models/userProfile.js";
import UserSettings from "../models/userSettings.js";
import HealthData from "../models/healthData.js";

// @desc   Get user profile
// @route  GET /api/user/profile
// @access Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOne({ user_id: req.user._id });

  if (profile) {
    res.json(profile);
  } else {
    // Return empty profile or create one? 
    // Usually 404 if strict, or empty object. 
    // Let's return 404 to let client know to create one.
    res.status(404);
    throw new Error("User profile not found");
  }
});

// @desc   Create or Update user profile
// @route  PUT /api/user/profile
// @access Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { display_name, avatar_url, bio, height, weight, age, gender, fitness_level, goals, theme_preference } = req.body;

  let profile = await UserProfile.findOne({ user_id: req.user._id });

  if (profile) {
    profile.display_name = display_name || profile.display_name;
    profile.avatar_url = avatar_url || profile.avatar_url;
    profile.bio = bio || profile.bio;
    profile.height = height || profile.height;
    profile.weight = weight || profile.weight;
    profile.age = age || profile.age;
    profile.gender = gender || profile.gender;
    profile.fitness_level = fitness_level || profile.fitness_level;
    profile.goals = goals || profile.goals;
    profile.theme_preference = theme_preference || profile.theme_preference;
    profile.updated_at = Date.now();

    const updatedProfile = await profile.save();
    res.json(updatedProfile);
  } else {
    profile = await UserProfile.create({
      user_id: req.user._id,
      display_name,
      avatar_url,
      bio,
      height,
      weight,
      age,
      gender,
      fitness_level,
      goals,
      theme_preference
    });
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
    heart_rate_avg, sleep_hours, sleep_quality, water_intake, weight 
  } = req.body;

  const healthData = await HealthData.create({
    user_id: req.user._id,
    steps,
    distance,
    calories_burned,
    active_minutes,
    heart_rate_avg,
    sleep_hours,
    sleep_quality,
    water_intake,
    weight,
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
