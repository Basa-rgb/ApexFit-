const mongoose = require("mongoose");
const Booking = require("../models/Bookings");
const User = require("../models/User");
const Trainer = require("../models/Trainer");
const Payment = require("../models/Payments");
const BookingOption = require("../models/BookingOption");

const parseTimeToHour = (time) => {
  const value = String(time || "").trim().toUpperCase();
  const match = value.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/);
  if (!match) return null;

  let hour = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (minutes > 0) hour += minutes / 60;
  if (match[3] === "PM" && hour < 12) hour += 12;
  if (match[3] === "AM" && hour === 12) hour = 0;
  return hour;
};

const formatHour = (hour) => {
  const normalizedHour = Number(hour) % 24;
  const suffix = normalizedHour >= 12 ? "PM" : "AM";
  const displayHour = normalizedHour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:00 ${suffix}`;
};

const getSlotStartHour = (slot) => {
  let hour = Number(slot.startHour);
  const period = String(slot.label || "").toLowerCase();

  if ((period.includes("afternoon") || period.includes("evening")) && hour < 12) {
    hour += 12;
  }

  return hour;
};

const getSlotLabel = (slot) =>
  Number.isFinite(Number(slot.startHour))
    ? `${formatHour(getSlotStartHour(slot))} - ${formatHour(getSlotStartHour(slot) + 1)}`
    : slot.label;

// Public booking options are managed in MongoDB, not in the frontend.
const getBookingOptions = async (req, res) => {
  try {
    const { trainerId } = req.query;
    let options;

    if (trainerId && mongoose.Types.ObjectId.isValid(trainerId)) {
      options = await BookingOption.find({
        trainerId,
        isActive: true,
      }).sort({ name: 1 });
    } else {
      options = [];
    }

    return res.status(200).json({ success: true, options });
  } catch (error) {
    console.error("Get Booking Options Error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not load booking options.",
    });
  }
};

const createBookingOption = async (req, res) => {
  try {
    const {
      trainerId = null,
      name,
      price,
      timeSlots = [],
      isActive = true,
    } = req.body;

    if (!name || price === undefined || !Array.isArray(timeSlots)) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and timeSlots are required.",
      });
    }

    if (trainerId) {
      if (!mongoose.Types.ObjectId.isValid(trainerId)) {
        return res.status(400).json({ success: false, message: "Invalid trainer ID." });
      }

      const trainer = await Trainer.findOne({ _id: trainerId, isActive: true });
      if (!trainer) {
        return res.status(404).json({ success: false, message: "Active trainer not found." });
      }
    }

    const option = await BookingOption.create({
      trainerId,
      name,
      price,
      timeSlots,
      isActive,
    });

    return res.status(201).json({
      success: true,
      message: "Booking option created successfully.",
      option,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A booking option with this name already exists.",
      });
    }

    console.error("Create Booking Option Error:", error);
    return res.status(500).json({
      success: false,
      message: "Could not create booking option.",
    });
  }
};

// Create Booking
const createBooking = async (req, res) => {
  try {
    // const {
    //   userId,
    //   trainerId,
    //   bookingDate,
    //   timeSlot,
    //   sessionType,
    //   notes,
    // } = req.body;

    const userId = req.user.id;
    const {
      trainerId,
      bookingOptionId,
      bookingDate,
      timeSlot,
      notes,
      paymentMethod = "eSewa",
    } = req.body;

    // Validate required fields
    if (!userId || !trainerId || !bookingOptionId || !bookingDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid booking option and complete all required fields.",
      });
    }

    if (!["eSewa", "Cash"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(trainerId) ||
      !mongoose.Types.ObjectId.isValid(bookingOptionId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user, trainer, or booking option ID",
      });
    }

    const bookingOption = await BookingOption.findOne({
      _id: bookingOptionId,
      isActive: true,
      $or: [{ trainerId }, { trainerId: null }, { trainerId: { $exists: false } }],
    });

    if (!bookingOption) {
      return res.status(404).json({
        success: false,
        message: "Selected booking option is not available.",
      });
    }

    const selectedSlot = bookingOption.timeSlots.find(
      (slot) => slot.label === timeSlot || getSlotLabel(slot) === timeSlot,
    );

    if (!selectedSlot) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is not available for this session.",
      });
    }

    const selectedSessionType = bookingOption.name;
    const amount = bookingOption.price;

    // Check user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check trainer
    const trainer = await Trainer.findOne({ _id: trainerId, isActive: true });
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: "Trainer not found or is not active",
      });
    }

    const bookingDateObject = new Date(`${bookingDate}T00:00:00`);
    if (Number.isNaN(bookingDateObject.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    if (
      trainer.availableDays?.length &&
      !trainer.availableDays.includes(
        bookingDateObject.toLocaleDateString("en-US", { weekday: "long" }),
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Trainer is not available on the selected day.",
      });
    }

    const slotStart = getSlotStartHour(selectedSlot);
    const trainerStart = parseTimeToHour(trainer.availableTime?.start);
    const trainerEnd = parseTimeToHour(trainer.availableTime?.end);
    const slotEnd = slotStart + 1;

    if (
      trainerStart !== null &&
      trainerEnd !== null &&
      (slotStart < trainerStart || slotEnd > trainerEnd)
    ) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is outside the trainer's availability.",
      });
    }

    // Check duplicate booking
    const existingBooking = await Booking.findOne({
      trainerId,
      bookingDate,
      timeSlot,
      status: { $in: ["Pending", "Confirmed"] },
      paymentStatus: { $ne: "Failed" },
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
      bookingOptionId,
      bookingDate,
      timeSlot,
      sessionType: selectedSessionType,
      notes,
      amount,
      paymentMethod,
      paymentStatus: "Pending",
      status: "Pending",
    });

    if (paymentMethod === "Cash") {
      await Payment.create({
        userId,
        bookingId: booking._id,
        amount,
        paymentMethod: "Cash",
        status: "Pending",
      });
    }

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

// Get All Bookings (Admin sees every booking)
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email")
      .populate("trainerId", "fullName specialization")
      .sort({ createdAt: -1 });

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

// Get the signed-in user's own bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("trainerId", "fullName specialization profileImage")
      .sort({ bookingDate: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.log("Get My Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Load a booking and confirm the requester owns it, is an admin,
// or is the assigned trainer of that session.
const findBookingForRequester = async (req) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return { error: "Invalid Booking ID" };
  const booking = await Booking.findById(req.params.id);
  if (!booking) return { error: "Booking not found", status: 404 };

  if (req.user.role === "admin") return { booking };
  if (String(booking.userId) === String(req.user.id)) return { booking };

  // Trainers manage sessions booked with their own Trainer profile.
  if (req.user.role === "trainer") {
    const account = await User.findById(req.user.id).select("email");
    const profile = account ? await Trainer.findOne({ email: account.email }) : null;
    if (profile && String(booking.trainerId) === String(profile._id)) {
      return { booking, isTrainer: true };
    }
  }

  return { error: "You are not allowed to manage this booking.", status: 403 };
};

// Get Booking By ID
const getBookingById = async (req, res) => {
  try {
    const result = await findBookingForRequester(req);
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }

    await result.booking.populate([
      { path: "userId", select: "name email" },
      { path: "trainerId", select: "fullName specialization" },
    ]);

    return res.status(200).json({
      success: true,
      booking: result.booking,
    });
  } catch (error) {
    console.log("Get Booking By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update Booking By ID (owner or admin)
const updateBookingById = async (req, res) => {
  try {
    const result = await findBookingForRequester(req);
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }
    const booking = result.booking;
    const isAdmin = req.user.role === "admin";

    // Read request body
    const { bookingDate, timeSlot, sessionType, status, notes } = req.body;

    // The assigned trainer can only confirm, complete, or cancel sessions.
    if (result.isTrainer && (bookingDate !== undefined || timeSlot !== undefined || sessionType !== undefined || notes !== undefined)) {
      return res.status(403).json({
        success: false,
        message: "Trainers can only change the booking status.",
      });
    }

    // Regular members can only reschedule or cancel their own booking.
    if (!isAdmin && !result.isTrainer && (sessionType !== undefined || (status !== undefined && status !== "Cancelled"))) {
      return res.status(403).json({
        success: false,
        message: "You can only change the date, time slot, notes, or cancel your booking.",
      });
    }

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
      !["Pending", "Confirmed", "Completed", "Cancelled"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // Validate a new date
    let bookingDateObject = null;
    if (bookingDate !== undefined) {
      bookingDateObject = new Date(`${bookingDate}T00:00:00`);
      if (Number.isNaN(bookingDateObject.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid booking date",
        });
      }
    }

    // If the slot changed, make sure it belongs to the booked option.
    const nextTimeSlot = timeSlot !== undefined ? timeSlot : booking.timeSlot;
    if (timeSlot !== undefined || bookingDate !== undefined) {
      const option = await BookingOption.findById(booking.bookingOptionId);
      const slot = option?.timeSlots.find(
        (s) => s.label === nextTimeSlot || getSlotLabel(s) === nextTimeSlot,
      );
      if (!slot) {
        return res.status(400).json({
          success: false,
          message: "Selected time slot is not available for this session.",
        });
      }

      const trainer = await Trainer.findById(booking.trainerId);
      const checkDate = bookingDateObject || new Date(`${booking.bookingDate.toISOString().split("T")[0]}T00:00:00`);
      if (
        trainer?.availableDays?.length &&
        !trainer.availableDays.includes(
          checkDate.toLocaleDateString("en-US", { weekday: "long" }),
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Trainer is not available on the selected day.",
        });
      }

      // Block double-booking the same trainer/date/slot.
      const clash = await Booking.findOne({
        _id: { $ne: booking._id },
        trainerId: booking.trainerId,
        bookingDate: bookingDate !== undefined ? bookingDate : booking.bookingDate,
        timeSlot: nextTimeSlot,
        status: { $in: ["Pending", "Confirmed"] },
        paymentStatus: { $ne: "Failed" },
      });
      if (clash) {
        return res.status(409).json({
          success: false,
          message: "Trainer is already booked for this date and time slot.",
        });
      }
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
      booking.notes = String(notes).trim();
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

// Delete Booking By ID (owner or admin)
const deleteBookingById = async (req, res) => {
  try {
    const result = await findBookingForRequester(req);
    if (result.error) {
      return res.status(result.status || 400).json({ success: false, message: result.error });
    }

    // Remove related payments so history stays clean.
    await Payment.deleteMany({ bookingId: result.booking._id });

    await result.booking.deleteOne();

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

// Signed-in trainers manage their OWN session types (booking options).
const getOwnTrainerProfile = async (req) => {
  const user = await User.findById(req.user.id);
  if (!user || user.role !== "trainer") return null;
  return Trainer.findOne({ email: user.email });
};

const getMyBookingOptions = async (req, res) => {
  try {
    const trainer = await getOwnTrainerProfile(req);
    if (!trainer) {
      return res.status(403).json({ success: false, message: "Trainer accounts only." });
    }

    const options = await BookingOption.find({ trainerId: trainer._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, options });
  } catch (error) {
    console.error("Get my booking options error:", error);
    return res.status(500).json({ success: false, message: "Could not load your session types." });
  }
};

const normalizeTimeSlots = (rawSlots) =>
  (Array.isArray(rawSlots) ? rawSlots : [])
    .map((slot) => ({
      label: String(slot?.label || "").trim(),
      startHour: Number(slot?.startHour),
    }))
    .filter((slot) => slot.label && Number.isFinite(slot.startHour) && slot.startHour >= 0 && slot.startHour <= 23);

const createMyBookingOption = async (req, res) => {
  try {
    const trainer = await getOwnTrainerProfile(req);
    if (!trainer) {
      return res.status(403).json({ success: false, message: "Trainer accounts only." });
    }

    const { name, price, timeSlots = [], isActive = true } = req.body;
    if (!name || price === undefined || price === "" || Number(price) < 0) {
      return res.status(400).json({ success: false, message: "Session name and a valid price are required." });
    }

    const slots = normalizeTimeSlots(timeSlots);
    if (!slots.length) {
      return res.status(400).json({ success: false, message: "Add at least one time slot (Label | start hour)." });
    }

    const option = await BookingOption.create({
      trainerId: trainer._id,
      name,
      price: Number(price),
      timeSlots: slots,
      isActive,
    });

    return res.status(201).json({ success: true, message: "Session type created.", option });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You already have a session type with this name." });
    }
    console.error("Create my booking option error:", error);
    return res.status(500).json({ success: false, message: "Could not create the session type." });
  }
};

const updateMyBookingOption = async (req, res) => {
  try {
    const trainer = await getOwnTrainerProfile(req);
    if (!trainer) {
      return res.status(403).json({ success: false, message: "Trainer accounts only." });
    }

    const option = await BookingOption.findOne({ _id: req.params.id, trainerId: trainer._id });
    if (!option) {
      return res.status(404).json({ success: false, message: "Session type not found." });
    }

    const { name, price, timeSlots, isActive } = req.body;
    if (name !== undefined) option.name = name;
    if (price !== undefined && price !== "") option.price = Number(price);
    if (timeSlots !== undefined) {
      const slots = normalizeTimeSlots(timeSlots);
      if (!slots.length) {
        return res.status(400).json({ success: false, message: "Keep at least one valid time slot." });
      }
      option.timeSlots = slots;
    }
    if (isActive !== undefined) option.isActive = Boolean(isActive);

    await option.save();
    return res.status(200).json({ success: true, message: "Session type updated.", option });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You already have a session type with this name." });
    }
    console.error("Update my booking option error:", error);
    return res.status(500).json({ success: false, message: "Could not update the session type." });
  }
};

const deleteMyBookingOption = async (req, res) => {
  try {
    const trainer = await getOwnTrainerProfile(req);
    if (!trainer) {
      return res.status(403).json({ success: false, message: "Trainer accounts only." });
    }

    const option = await BookingOption.findOneAndDelete({ _id: req.params.id, trainerId: trainer._id });
    if (!option) {
      return res.status(404).json({ success: false, message: "Session type not found." });
    }

    return res.status(200).json({ success: true, message: "Session type deleted." });
  } catch (error) {
    console.error("Delete my booking option error:", error);
    return res.status(500).json({ success: false, message: "Could not delete the session type." });
  }
};

module.exports = {
  getBookingOptions,
  createBookingOption,
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingById,
  deleteBookingById,
  getMyBookingOptions,
  createMyBookingOption,
  updateMyBookingOption,
  deleteMyBookingOption,
};
