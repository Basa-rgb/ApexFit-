const mongoose = require("mongoose");

const bookingOptionSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trainer",
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    timeSlots: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        startHour: {
          type: Number,
          required: true,
          min: 0,
          max: 23,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

bookingOptionSchema.index({ trainerId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("BookingOption", bookingOptionSchema);
