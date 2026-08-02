const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    profileImage: {
      type: String,
      default: "",
    },

    profileImagePublicId: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      trim: true,
    },

    specialization: [
      {
        type: String,
        trim: true,
      },
    ],

    experience: {
      type: Number,
      default: 0,
      min: 0,
    },

    certifications: [
      {
        type: String,
        trim: true,
      },
    ],

    availableDays: [
      {
        type: String,
        enum: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
    ],

    availableTime: {
      start: {
        type: String,
      },
      end: {
        type: String,
      },
    },

    monthlyFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    personalTrainingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    socialLinks: {
      facebook: String,
      instagram: String,
      linkedin: String,
    },

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },

    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Trainer", trainerSchema);
