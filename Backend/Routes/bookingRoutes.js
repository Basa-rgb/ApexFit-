const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

const {
  createBooking,
  getBookingOptions,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingById,
  deleteBookingById,
  getMyBookingOptions,
  createMyBookingOption,
  updateMyBookingOption,
  deleteMyBookingOption,
} = require("../controllers/bookingController");

// Booking options are read from the database by the public booking form.
router.get("/options", getBookingOptions);

// Trainers manage their OWN session types from their dashboard.
router.get("/options/mine", protect, getMyBookingOptions);
router.post("/options/mine", protect, createMyBookingOption);
router.put("/options/mine/:id", protect, updateMyBookingOption);
router.delete("/options/mine/:id", protect, deleteMyBookingOption);

// Create Booking (login required)
router.post("/", protect, createBooking);

// Signed-in member's own bookings
router.get("/mine", protect, getMyBookings);

// Get All Bookings (Admin only)
router.get("/", protect, isAdmin, getAllBookings);

// Get Booking By ID (owner or admin)
router.get("/:id", protect, getBookingById);

// Update Booking (owner or admin)
router.put("/:id", protect, updateBookingById);

// Delete Booking (owner or admin)
router.delete("/:id", protect, deleteBookingById);

module.exports = router;