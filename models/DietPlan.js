const mongoose = require("mongoose");

const dietPlanSchema = new mongoose.Schema(
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
    },

    goal: {
      type: String,
      enum: [
        "Weight Loss",
        "Muscle Gain",
        "Maintenance",
        "Healthy Lifestyle"
      ],
      required: true,
    },

    duration: {
      type: String,
      required: true,
    },

    meals: [
      {
        mealType: {
          type: String,
          enum: [
            "Breakfast",
            "Lunch",
            "Dinner",
            "Snacks"
          ],
          required: true,
        },

        foodItems: [
          {
            type: String,
            required: true,
          }
        ],

        calories: {
          type: Number,
          required: true,
        }
      }
    ],

    status: {
      type: String,
      enum: [
        "Active",
        "Completed"
      ],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("DietPlan", dietPlanSchema);