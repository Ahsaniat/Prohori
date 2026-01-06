import asyncHandler from "express-async-handler";
import WorkoutRoutine from "../models/workoutRoutine.js";
import CommonPreferences from "../models/CommonPreferences.js";
import geminiService from "../services/geminiService.js";

// @desc   Get today's workout (auto-generate if missing)
// @route  GET /api/workouts/today
// @access Private
export const getTodaysWorkout = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  // 1. Check for existing workout created today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  
  const existingWorkout = await WorkoutRoutine.findOne({
    user_id: userId,
    generatedAt: { $gte: startOfDay }
  }).sort({ generatedAt: -1 });

  if (existingWorkout) {
    return res.json(existingWorkout);
  }

  // 2. If none, generate a new one
  try {
    const commonPrefs = await CommonPreferences.findOne({ user: userId });
    
    // Default context if no prefs
    const userContext = commonPrefs ? {
      age: commonPrefs.age,
      sex: commonPrefs.sex,
      weightKg: commonPrefs.weightKg,
      primaryGoal: commonPrefs.primaryGoal,
      activityLevel: commonPrefs.activityLevel
    } : {};

    const planData = await geminiService.generateWorkoutPlan(userContext);
    
    // Add thumbnails manually if API didn't provide (Gemini can't generate image URLs usually)
    // We can use the standard YouTube thumbnail format: https://img.youtube.com/vi/<ID>/hqdefault.jpg
    const videosWithThumbnails = planData.videos.map(v => ({
      ...v,
      thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
    }));

    const workout = await WorkoutRoutine.create({
      user_id: userId,
      title: planData.title,
      focus: planData.focus,
      difficulty: planData.difficulty,
      totalDuration: planData.totalDuration,
      caloriesBurned: planData.caloriesBurned,
      videos: videosWithThumbnails,
      generatedAt: new Date()
    });

    res.json(workout);

  } catch (error) {
    console.error("Failed to generate workout:", error);
    res.status(500).json({ message: "Failed to generate workout plan" });
  }
});

// @desc   Force regenerate today's workout
// @route  POST /api/workouts/regenerate
// @access Private
export const regenerateWorkout = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const commonPrefs = await CommonPreferences.findOne({ user: userId });
    
    const userContext = commonPrefs ? {
      age: commonPrefs.age,
      sex: commonPrefs.sex,
      weightKg: commonPrefs.weightKg,
      primaryGoal: commonPrefs.primaryGoal,
      activityLevel: commonPrefs.activityLevel
    } : {};

    const planData = await geminiService.generateWorkoutPlan(userContext);
    
    const videosWithThumbnails = planData.videos.map(v => ({
      ...v,
      thumbnail: `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`
    }));

    const workout = await WorkoutRoutine.create({
      user_id: userId,
      title: planData.title,
      focus: planData.focus,
      difficulty: planData.difficulty,
      totalDuration: planData.totalDuration,
      caloriesBurned: planData.caloriesBurned,
      videos: videosWithThumbnails,
      generatedAt: new Date()
    });

    res.json(workout);
  } catch (error) {
    res.status(500);
    throw new Error("Failed to regenerate workout");
  }
});

// @desc   Get user workouts history
// @route  GET /api/workouts
// @access Private
export const getWorkouts = asyncHandler(async (req, res) => {
  const workouts = await WorkoutRoutine.find({ user_id: req.user._id }).sort({ created_at: -1 });
  res.json(workouts);
});

// @desc   Create workout routine (Manual)
// @route  POST /api/workouts
// @access Private
export const createWorkout = asyncHandler(async (req, res) => {
  // Kept for backward compatibility or manual creation
  res.status(501).json({ message: "Use /today or /regenerate endpoints" });
});

// @desc   Get single workout
// @route  GET /api/workouts/:id
// @access Private
export const getWorkoutById = asyncHandler(async (req, res) => {
  const workout = await WorkoutRoutine.findById(req.params.id);

  if (workout) {
    if (workout.user_id.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized');
    }
    res.json(workout);
  } else {
    res.status(404);
    throw new Error('Workout not found');
  }
});

// @desc   Update workout routine
// @route  PUT /api/workouts/:id
// @access Private
export const updateWorkout = asyncHandler(async (req, res) => {
  const workout = await WorkoutRoutine.findById(req.params.id);

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  if (workout.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const updatedWorkout = await WorkoutRoutine.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  res.json(updatedWorkout);
});

// @desc   Delete workout routine
// @route  DELETE /api/workouts/:id
// @access Private
export const deleteWorkout = asyncHandler(async (req, res) => {
  const workout = await WorkoutRoutine.findById(req.params.id);

  if (!workout) {
    res.status(404);
    throw new Error('Workout not found');
  }

  if (workout.user_id.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized');
  }

  await workout.deleteOne();
  res.json({ message: 'Workout removed' });
});
