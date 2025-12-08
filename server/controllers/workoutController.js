import asyncHandler from "express-async-handler";
import WorkoutRoutine from "../models/workoutRoutine.js";

// @desc   Get user workouts
// @route  GET /api/workouts
// @access Private
export const getWorkouts = asyncHandler(async (req, res) => {
  const workouts = await WorkoutRoutine.find({ user_id: req.user._id }).sort({ created_at: -1 });
  res.json(workouts);
});

// @desc   Create workout routine
// @route  POST /api/workouts
// @access Private
export const createWorkout = asyncHandler(async (req, res) => {
  const { name, description, exercises, difficulty, duration, calories_burned } = req.body;

  const workout = await WorkoutRoutine.create({
    user_id: req.user._id,
    name,
    description,
    exercises,
    difficulty,
    duration,
    calories_burned
  });

  res.status(201).json(workout);
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
