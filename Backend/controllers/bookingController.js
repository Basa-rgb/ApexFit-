const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const User = require("../models/User");
const Trainer = require("../models/Trainer");

// Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      userId,
      trainerId,
      bookingDate,
      timeSlot,
      sessionType,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !userId ||
      !trainerId ||
      !bookingDate ||
      !timeSlot ||
      !sessionType
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are mandatory",
      });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(trainerId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID or Trainer ID",
      });
    }

    // Check user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found",
      });
    }

    // Check duplicate booking
    const existingBooking = await Booking.findOne({
      trainerId,
      bookingDate,
      timeSlot,
      status: {
        $in: ["Pending", "Confirmed"],
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: "Trainer is already booked for this date and time slot",
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      trainerId,
      bookingDate,
      timeSlot,
      sessionType,
      notes,
      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.log("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





// Get All Bookings

const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "fullName email")
      .populate("trainerId", "fullName specialization");

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
      });
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log("Get All Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// Get Booking By ID
const getBookingById = async (req, res) => {
  try {
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booking ID",
      });
    }

    // Find booking
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("trainerId", "fullName specialization");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.log("Get Booking By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




// Update Booking By ID
const updateBookingById = async (req, res) => {
  try {
    // Validate Booking ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booking ID",
      });
    }

    // Find booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Read request body
    const {
      bookingDate,
      timeSlot,
      sessionType,
      status,
      notes,
    } = req.body;

    // Validate sessionType
    if (
      sessionType !== undefined &&
      ![
        "Personal Training",
        "Group Training",
        "Diet Consultation",
        "Fitness Assessment",
      ].includes(sessionType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid session type",
      });
    }

    // Validate status
    if (
      status !== undefined &&
      ![
        "Pending",
        "Confirmed",
        "Completed",
        "Cancelled",
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // Update fields
    if (bookingDate !== undefined) {
      booking.bookingDate = bookingDate;
    }

    if (timeSlot !== undefined) {
      booking.timeSlot = timeSlot;
    }

    if (sessionType !== undefined) {
      booking.sessionType = sessionType;
    }

    if (status !== undefined) {
      booking.status = status;
    }

    if (notes !== undefined) {
      booking.notes = notes.trim();
    }

    // Save
    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking,
    });

  } catch (error) {
    console.log("Update Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};





// Delete Booking By ID
const deleteBookingById = async (req, res) => {
  try {
    // Validate Booking ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Booking ID",
      });
    }

    // Find Booking
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Delete Booking
    await booking.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });

  } catch (error) {
    console.log("Delete Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


module.exports ={createBooking , getAllBookings ,getBookingById ,updateBookingById ,deleteBookingById}