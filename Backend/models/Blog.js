const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    excerpt: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: [
        "Workout",
        "Nutrition",
        "Weight Loss",
        "Muscle Gain",
        "Lifestyle",
        "Motivation"
      ],
      required: true,
    },

    tags: [
      {
        type: String,
      },
    ],

    author: {
      type: String,
      default: "ApexFit",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    views: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    publishedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Blog", blogSchema);