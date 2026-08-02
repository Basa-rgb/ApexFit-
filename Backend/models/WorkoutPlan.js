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

    goal: {
      type: String,
      enum: [
        "Weight Loss",
        "Muscle Gain",
        "Fitness",
        "Strength",
      ],
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

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
      },
    ],

    status: {
      type: String,
      enum: [
        "Active",
        "Completed",
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "WorkoutPlan",
  workoutPlanSchema
);