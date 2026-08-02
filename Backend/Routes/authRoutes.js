const express = require("express");
const router = express.Router();

const otpLimiter = require("../middlewares/otpLimiter");
const { protect } = require("../middlewares/authMiddleware");

const {
  sendRegistrationOtp,
  verifyRegistrationOtp,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  changePassword,
} = require("../controllers/authController");

// Registration
router.post("/register/send-otp", otpLimiter, sendRegistrationOtp);
router.post("/register/verify-otp", verifyRegistrationOtp);

// Authentication
router.post("/login", loginUser);
router.post("/logout", logoutUser);

// Forgot Password
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Change Password (Protected)
router.put("/change-password", protect, changePassword);

module.exports = router;