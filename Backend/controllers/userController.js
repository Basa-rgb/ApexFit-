const User = require("../models/User");
const Booking = require("../models/Bookings");
const Payment = require("../models/Payments");
const MembershipSubscription = require("../models/MembershipSubscription");
const WorkoutPlan = require("../models/WorkoutPlan");
const DietPlan = require("../models/DietPlan");
const Trainer = require("../models/Trainer");

// Return only the signed-in user's dashboard data.
const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, bookings, payments, subscriptions, workoutPlans, dietPlans] = await Promise.all([
      User.findById(userId).select("-password"),
      Booking.find({ userId }).populate("trainerId", "fullName specialization").sort({ bookingDate: 1 }),
      Payment.find({ userId }).sort({ createdAt: -1 }),
      MembershipSubscription.find({ userId }).populate("membershipPlanId", "name duration price").sort({ createdAt: -1 }),
      WorkoutPlan.find({ userId }).populate("trainerId", "fullName specialization"),
      DietPlan.find({ userId }).populate("trainerId", "fullName specialization"),
    ]);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({
      success: true,
      dashboard: { user, bookings, payments, subscriptions, workoutPlans, dietPlans },
    });
  } catch (error) {
    console.error("Get user dashboard error:", error);
    return res.status(500).json({ success: false, message: "Could not load user dashboard." });
  }
};

// getting User profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    // Check user exits or not

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // get user profile

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("Get profile error", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update //profile

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    // chcek user exit or not

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get data form req body

    const { name } = req.body;

    // Update the allowed field
if (name !== undefined) {
  if (name.trim() === "") {
    return res.status(400).json({
      success: false,
      message: "Name cannot be empty",
    });
  }

  user.name = name.trim();
}

    // Save update user

    await user.save();

    // return successful response

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Profile

const deleteAccount = async(req, res)=>{
  try {
    const user = await User.findById(req.user.id);

    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }

    // delete user

    await user.deleteOne()

    // send delete response

    return res.status(200).json({
      success:true,
      message:"Account deleted successfully"
    });

  } catch (error) {
    console.log("Delete user error", error);
    return res.status(500).json({
      success:false,
      message:"Internal server error"
    });
  }
}

// Trainer dashboard: profile, session stats, bookings, clients, plans, reviews.
const getTrainerDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.role !== "trainer") {
      return res.status(403).json({ success: false, message: "This dashboard is for trainer accounts only." });
    }

    // Trainer profiles are linked to trainer accounts by matching email.
    let trainer = await Trainer.findOne({ email: user.email });

    // Trainers who just registered have no profile yet — auto-create a
    // starter one so their dashboard loads and is editable immediately.
    if (!trainer) {
      try {
        trainer = await Trainer.create({
          fullName: user.name,
          email: user.email,
          phone: user.phone || "N/A",
        });
      } catch (createError) {
        console.error("Auto-create trainer profile error:", createError.message);
      }
    }

    if (!trainer) {
      return res.status(200).json({
        success: true,
        dashboard: { user, trainer: null, stats: {}, bookings: [], clients: [], workoutPlans: [], dietPlans: [], reviews: [], recentActivities: [] },
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [bookings, dietPlans, workoutPlans, reviews] = await Promise.all([
      Booking.find({ trainerId: trainer._id })
        .populate("userId", "name email phone profileImage")
        .sort({ bookingDate: -1 }),
      DietPlan.find({ trainerId: trainer._id })
        .populate("userId", "name email")
        .sort({ createdAt: -1 }),
      WorkoutPlan.find({ trainerId: trainer._id })
        .populate("userId", "name email")
        .sort({ createdAt: -1 }),
      require("../models/Review").find({ trainerId: trainer._id })
        .populate("userId", "name profileImage")
        .sort({ createdAt: -1 }),
    ]);

    const dateOf = (value) => String(value).split("T")[0];
    const todaysBookings = bookings.filter((booking) => dateOf(booking.bookingDate) === todayStr);
    const upcomingBookings = bookings.filter(
      (booking) =>
        dateOf(booking.bookingDate) >= todayStr &&
        !["Cancelled", "Completed"].includes(booking.status),
    );
    const pendingBookings = bookings.filter((booking) => booking.status === "Pending");
    const completedBookings = bookings.filter((booking) => booking.status === "Completed");
    const cancelledBookings = bookings.filter((booking) => booking.status === "Cancelled");
    const confirmedBookings = bookings.filter((booking) => booking.status === "Confirmed");

    // Unique clients derived from this trainer's bookings.
    const clientMap = new Map();
    bookings.forEach((booking) => {
      const id = String(booking.userId?._id || "");
      if (!id) return;
      if (!clientMap.has(id)) {
        clientMap.set(id, {
          _id: booking.userId._id,
          name: booking.userId.name,
          email: booking.userId.email,
          phone: booking.userId.phone,
          profileImage: booking.userId.profileImage,
          totalBookings: 0,
          completedBookings: 0,
          upcomingBookings: 0,
          lastBookingDate: null,
        });
      }
      const client = clientMap.get(id);
      client.totalBookings += 1;
      if (booking.status === "Completed") client.completedBookings += 1;
      if (!["Cancelled", "Completed"].includes(booking.status) && dateOf(booking.bookingDate) >= todayStr) {
        client.upcomingBookings += 1;
      }
      if (!client.lastBookingDate || dateOf(booking.bookingDate) > dateOf(client.lastBookingDate)) {
        client.lastBookingDate = booking.bookingDate;
      }
    });
    const clients = Array.from(clientMap.values()).sort((a, b) => b.totalBookings - a.totalBookings);

    const paidBookings = bookings.filter((booking) => booking.paymentStatus === "Paid");
    const totalEarnings = paidBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0);
    const monthlyEarnings = paidBookings
      .filter((booking) => new Date(booking.updatedAt || booking.createdAt) >= monthStart)
      .reduce((sum, booking) => sum + (booking.amount || 0), 0);

    return res.status(200).json({
      success: true,
      dashboard: {
        user,
        trainer,
        stats: {
          totalSessions: bookings.length,
          todaysSessions: todaysBookings.length,
          upcomingSessions: upcomingBookings.length,
          pendingRequests: pendingBookings.length,
          confirmedSessions: confirmedBookings.length,
          completedSessions: completedBookings.length,
          cancelledSessions: cancelledBookings.length,
          totalMembers: clients.length,
          activeMembers: clients.filter((client) => client.upcomingBookings > 0).length,
          totalEarnings,
          monthlyEarnings,
          rating: trainer.rating || 0,
          totalReviews: trainer.totalReviews || reviews.length,
        },
        bookings,
        clients,
        workoutPlans,
        dietPlans,
        reviews,
        recentActivities: bookings.slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Get trainer dashboard error:", error);
    return res.status(500).json({ success: false, message: "Could not load trainer dashboard." });
  }
};

module.exports = { getProfile, getUserDashboard, getTrainerDashboard, updateProfile , deleteAccount };
