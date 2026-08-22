const mongoose = require("mongoose");

const workoutPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: { type: String, trim: true, default: "" },
    image: { type: String, trim: true, default: "" },

    goal: {
      type: String,
      required: true,
    },

    difficulty: { type: String, trim: true, default: "Beginner" },

    duration: {
      type: String,
      required: true,
    },

    targetAudience: { type: String, trim: true, default: "All fitness levels" },
    daysPerWeek: { type: Number, min: 1 },
    estimatedSessionTime: { type: String, trim: true },
    equipment: [{ type: String, trim: true }],

    exercises: [
      {
        name: {
          type: String,
          required: true,
        },

        sets: {
          type: Number,
          required: true,
        },

        reps: {
          type: Number,
          required: true,
        },
        duration: String,
        restTime: String,
        instructions: String,
        image: String,
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("WorkoutPlan", workoutPlanSchema);
