const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");

// Public: approved reviews for the website review section.
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isApproved: true })
      .populate("userId", "name profileImage")
      .populate("trainerId", "fullName")
      .sort({ createdAt: -1 })
      .limit(50);
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    return res.status(500).json({ success: false, message: "Could not load reviews." });
  }
};

// Signed-in member's own review.
const getMyReview = async (req, res) => {
  try {
    const review = await Review.findOne({ userId: req.user.id });
    return res.status(200).json({ success: true, review: review || null });
  } catch (error) {
    console.error("Get My Review Error:", error);
    return res.status(500).json({ success: false, message: "Could not load your review." });
  }
};

// Create or replace the signed-in member's review.
const createReview = async (req, res) => {
  try {
    const { rating, comment, trainerId = null } = req.body;

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }

    if (!comment || !String(comment).trim()) {
      return res.status(400).json({ success: false, message: "Please write a short comment." });
    }

    const user = await User.findById(req.user.id).select("name");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    let trainerRef = null;
    if (trainerId) {
      if (!mongoose.Types.ObjectId.isValid(trainerId)) {
        return res.status(400).json({ success: false, message: "Invalid trainer ID." });
      }
      trainerRef = trainerId;
    }

    const existing = await Review.findOne({ userId: req.user.id });
    if (existing) {
      existing.rating = parsedRating;
      existing.comment = String(comment).trim();
      existing.trainerId = trainerRef;
      await existing.save();
      return res.status(200).json({ success: true, message: "Your review was updated.", review: existing });
    }

    const review = await Review.create({
      userId: req.user.id,
      name: user.name,
      rating: parsedRating,
      comment: String(comment).trim(),
      trainerId: trainerRef,
    });

    return res.status(201).json({ success: true, message: "Thanks for your review!", review });
  } catch (error) {
    console.error("Create Review Error:", error);
    return res.status(500).json({ success: false, message: "Could not save your review." });
  }
};

// Delete a review (owner or admin).
const deleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid review ID." });
    }

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: "Review not found." });

    const isAdmin = req.user.role === "admin";
    if (!isAdmin && String(review.userId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "You can only delete your own review." });
    }

    await review.deleteOne();
    return res.status(200).json({ success: true, message: "Review deleted successfully." });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return res.status(500).json({ success: false, message: "Could not delete the review." });
  }
};

module.exports = { getReviews, getMyReview, createReview, deleteReview };
