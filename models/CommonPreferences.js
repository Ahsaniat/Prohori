import mongoose from "mongoose";

const commonPreferencesSchema = new mongoose.Schema(
  {
    // 1:1 with User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one common preferences document per user
    },

    // Basic profile for both meals & workouts
    sex: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      default: "prefer_not_to_say",
    },
    age: Number,             // in years
    heightCm: Number,        // store in cm internally
    weightKg: Number,        // store in kg internally

    // General activity (used for calorie + workout suggestions)
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "athlete"],
      default: "sedentary",
    },

    // Main goal (matters for both diet and training)
    primaryGoal: {
      type: String,
      enum: [
        "lose_weight",
        "maintain_weight",
        "gain_weight",
        "performance",
        "manage_condition",
      ],
      default: "maintain_weight",
    },
    targetWeightKg: Number,
    goalTimeframeWeeks: Number,

    // How strict they want to be overall
    trackingStrictness: {
      type: String,
      enum: ["strict", "medium", "relaxed"],
      default: "medium",
    },

    // Household size can affect both meal planning & maybe workout timing
    householdSize: {
      type: Number,
      default: 1,
    },

    // injuries: [String],
    // preferredWorkoutTime: String, // "morning", "evening", etc.
  },
  { timestamps: true }
);

const CommonPreferences = mongoose.model(
  "CommonPreferences",
  commonPreferencesSchema
);

export default CommonPreferences;
