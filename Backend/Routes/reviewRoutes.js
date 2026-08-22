const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const {
  getReviews,
  getMyReview,
  createReview,
  deleteReview,
} = require("../controllers/reviewController");

// Public review list for the website.
router.get("/", getReviews);

// Signed-in member's own review.
router.get("/mine", protect, getMyReview);

// Create or update your review (login required).
router.post("/", protect, createReview);

// Delete a review (owner or admin).
router.delete("/:id", protect, deleteReview);

module.exports = router;
