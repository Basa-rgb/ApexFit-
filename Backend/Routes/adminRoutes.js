const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {isAdmin} = require("../middlewares/adminMiddleware");

const {
  getDashboardStats,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} = require("../controllers/adminController");
const { createBookingOption } = require("../controllers/bookingController");

// Dashboard
router.get("/dashboard", protect, isAdmin , getDashboardStats);
router.get("/users", protect, isAdmin, getAdminUsers);
router.post("/users", protect, isAdmin, createAdminUser);
router.put("/users/:id", protect, isAdmin, updateAdminUser);
router.delete("/users/:id", protect, isAdmin, deleteAdminUser);
router.post("/booking-options", protect, isAdmin, createBookingOption);

module.exports = router;