const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {isAdmin} = require("../middlewares/adminMiddleware");

const {
  getDashboardStats,
} = require("../controllers/adminController");

// Dashboard
router.get("/dashboard", protect, isAdmin , getDashboardStats);

module.exports = router;