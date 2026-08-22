const mongoose = require("mongoose");
const otpSchema = new mongoose.Schema(
  {
      
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
    },

    otp: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    action: {
      type: String,
      enum: ["register", "forgot_password"],
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "trainer"],
      default: "user",
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OTP", otpSchema);