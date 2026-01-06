import asyncHandler from 'express-async-handler';
import HealthGoal from '../models/HealthGoal.js';
import HealthData from '../models/healthData.js';

// GET /api/goals
// Returns user goals (creates defaults if missing)
export const getGoals = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let goals = await HealthGoal.findOne({ user_id: userId });

  if (!goals) {
    goals = await HealthGoal.create({ user_id: userId });
  }

  res.json(goals);
});

// PUT /api/goals
// Upsert (create if missing) and update goals
export const upsertGoals = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const {
    steps_goal,
    calories_burn_goal,
    sleep_hours_goal,
    water_liters_goal,
    target_weight,
    target_date,
  } = req.body || {};

  const update = {
    updated_at: new Date(),
  };

  // Only set if provided (prevents overwriting with undefined)
  if (steps_goal !== undefined) update.steps_goal = Number(steps_goal);
  if (calories_burn_goal !== undefined) update.calories_burn_goal = Number(calories_burn_goal);
  if (sleep_hours_goal !== undefined) update.sleep_hours_goal = Number(sleep_hours_goal);
  if (water_liters_goal !== undefined) update.water_liters_goal = Number(water_liters_goal);

  // Destination goal fields can be null
  if (target_weight !== undefined) update.target_weight = target_weight === null ? null : Number(target_weight);
  if (target_date !== undefined) update.target_date = target_date ? new Date(target_date) : null;

  const goals = await HealthGoal.findOneAndUpdate(
    { user_id: userId },
    { $set: update, $setOnInsert: { user_id: userId, created_at: new Date() } },
    { new: true, upsert: true }
  );

  res.json(goals);
});

// GET /api/goals/insights/today
// Compares today's health data to goals and returns progress + simple guidance
export const getTodayInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Ensure goals exist
  let goals = await HealthGoal.findOne({ user_id: userId });
  if (!goals) goals = await HealthGoal.create({ user_id: userId });

  // Get latest health record for today
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const today = await HealthData.findOne({
    user_id: userId,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  const todayData = today || null;

  const safeNum = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
  const capPercent = (x) => Math.max(0, Math.min(100, x));

  const steps = safeNum(todayData?.steps);
  const calories = safeNum(todayData?.calories_burned);
  const sleep = safeNum(todayData?.sleep_hours);
  const water = safeNum(todayData?.water_intake);

  const stepsGoal = safeNum(goals.steps_goal) || 10000;
  const caloriesGoal = safeNum(goals.calories_burn_goal) || 2000;
  const sleepGoal = safeNum(goals.sleep_hours_goal) || 8;
  const waterGoal = safeNum(goals.water_liters_goal) || 2;

  const progress = {
    steps_percent: capPercent((steps / stepsGoal) * 100),
    calories_percent: capPercent((calories / caloriesGoal) * 100),
    sleep_percent: capPercent((sleep / sleepGoal) * 100),
    water_percent: capPercent((water / waterGoal) * 100),
  };

  const insights = [];

  // Steps insight
  if (stepsGoal > 0) {
    if (progress.steps_percent >= 100) {
      insights.push('Steps goal achieved. Great job!');
    } else {
      insights.push(`Steps: ${steps}/${stepsGoal} (${Math.round(progress.steps_percent)}%). Keep going.`);
    }
  }

  // Calories insight
  if (caloriesGoal > 0) {
    if (progress.calories_percent >= 100) {
      insights.push('Calories goal achieved for today.');
    } else {
      insights.push(`Calories: ${calories}/${caloriesGoal} (${Math.round(progress.calories_percent)}%).`);
    }
  }

  // Sleep insight
  if (sleepGoal > 0) {
    if (progress.sleep_percent >= 100) {
      insights.push('Sleep goal achieved. Nice recovery.');
    } else {
      insights.push(`Sleep: ${sleep}h / ${sleepGoal}h (${Math.round(progress.sleep_percent)}%).`);
    }
  }

  // Water insight
  if (waterGoal > 0) {
    if (progress.water_percent >= 100) {
      insights.push('Hydration goal achieved.');
    } else {
      insights.push(`Water: ${water}L / ${waterGoal}L (${Math.round(progress.water_percent)}%).`);
    }
  }

  // Optional destination goal insight
  if (goals.target_weight && todayData?.weight) {
    const currentWeight = safeNum(todayData.weight);
    const targetWeight = safeNum(goals.target_weight);
    const diff = currentWeight - targetWeight;
    if (diff > 0) {
      insights.push(`Weight target: ${currentWeight}kg. ${diff.toFixed(1)}kg to reach ${targetWeight}kg.`);
    } else {
      insights.push(`Weight target reached (current: ${currentWeight}kg, target: ${targetWeight}kg).`);
    }
  }

  res.json({
    date: start.toISOString(),
    goals,
    todayData,
    progress,
    insights,
  });
});
