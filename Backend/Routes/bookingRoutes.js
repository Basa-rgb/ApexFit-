const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");

const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingById,
  deleteBookingById,
} = require("../controllers/BookingController");

// Create Booking
router.post("/", protect, createBooking);

// Get All Bookings
router.get("/", protect, getAllBookings);

// Get Booking By ID
router.get("/:id", protect, getBookingById);

// Update Booking
router.put("/:id", protect, updateBookingById);

// Delete Booking
router.delete("/:id", protect, deleteBookingById);

module.exports = router;