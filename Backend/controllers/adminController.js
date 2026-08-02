const User = require("../models/User");
const Trainer = require("../models/Trainer");
const MembershipPlan = require("../models/MembershipPlan");
const MembershipSubscription = require("../models/MembershipSubscription");
const Payment = require("../models/Payments");
const Booking = require("../models/Bookings");
const Contact = require("../models/Contacts");

// Dashboard Statistics

const getDashboardStats = async (req, res) => {
  try {
    // Counts

    const totalUsers = await User.countDocuments();
    const totalTrainers = await Trainer.countDocuments();
    const totalMembershipPlans = await MembershipPlan.countDocuments();
    const totalSubscriptions = await MembershipSubscription.countDocuments();
    const activeSubscriptions = await MembershipSubscription.countDocuments({
      status: "Active",
    });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({
      status: "Pending",
    });
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({
      status: "Completed",
    });
    const pendingPayments = await Payment.countDocuments({
      status: "Pending",
    });
    const failedPayments = await Payment.countDocuments({
      status: "Failed",
    });

    const totalContacts = await Contact.countDocuments();

    // Revenue

    const revenue = await Payment.aggregate([
      {
        $match: {
          status: "Completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const totalRevenue = revenue.length > 0 ? revenue[0].totalRevenue : 0;
    return res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalTrainers,
        totalMembershipPlans,
        totalSubscriptions,
        activeSubscriptions,
        totalBookings,
        pendingBookings,
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalContacts,
        totalRevenue,
      },
    });
  } catch (error) {
    console.log("Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getDashboardStats,
};
