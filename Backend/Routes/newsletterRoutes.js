const express = require("express");

const router = express.Router();

const {
  subscribeNewsletter,
  getAllSubscribers,
  deleteSubscriber,
} = require("../controllers/newsletterController");

const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

// Logged-in members only
router.post("/subscribe", protect, subscribeNewsletter);

// Admin
router.get("/", protect, isAdmin, getAllSubscribers);
router.delete("/:id", protect, isAdmin, deleteSubscriber);

module.exports = router;