// models/Meal.js
import mongoose from "mongoose";

const mealSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // you can temporarily make this false if you want to test without auth
    },
    spoonacularId: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    image: String,
    sourceUrl: String,
    readyInMinutes: Number,
    servings: Number,
    rawData: Object, // optional: store the full Spoonacular object
  },
  {
    timestamps: true,
  }
);

const Meal = mongoose.model("Meal", mealSchema);
export default Meal;
