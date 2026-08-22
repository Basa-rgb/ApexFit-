const User = require("../models/User");
const Trainer = require("../models/Trainer");
const MembershipPlan = require("../models/MembershipPlan");
const MembershipSubscription = require("../models/MembershipSubscription");
const Payment = require("../models/Payments");
const Booking = require("../models/Bookings");
const Contact = require("../models/Contacts");
const bcrypt = require("bcrypt");

// List users for the protected admin workspace, with optional search.
const getAdminUsers = async (req, res) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = search
      ? { $or: [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }] }
      : {};
    const users = await User.find(filter).select("-password -resetPasswordToken -resetPasswordExpire").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Get admin users error:", error);
    return res.status(500).json({ success: false, message: "Could not load users." });
  }
};

// Create a verified user from the admin workspace.
const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role = "user", isVerified = true, isActive = true } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    if (!["user", "trainer", "admin"].includes(role)) return res.status(400).json({ success: false, message: "Invalid user role." });
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return res.status(409).json({ success: false, message: "Email is already registered." });
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: await bcrypt.hash(password, 10), role, isVerified, isActive });
    const safeUser = await User.findById(user._id).select("-password -resetPasswordToken -resetPasswordExpire");
    return res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    console.error("Create admin user error:", error);
    return res.status(500).json({ success: false, message: "Could not create user." });
  }
};

// Update editable account fields from the admin workspace.
const updateAdminUser = async (req, res) => {
  try {
    const { name, role, isVerified, isActive } = req.body;
    if (req.params.id === String(req.user.id) && isActive === false) return res.status(400).json({ success: false, message: "You cannot deactivate your own admin account." });
    if (req.params.id === String(req.user.id) && role && role !== "admin") return res.status(400).json({ success: false, message: "You cannot remove your own admin role." });
    const updates = {};
    if (name !== undefined) updates.name = String(name).trim();
    if (role !== undefined) updates.role = role;
    if (isVerified !== undefined) updates.isVerified = Boolean(isVerified);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password -resetPasswordToken -resetPasswordExpire");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Update admin user error:", error);
    return res.status(500).json({ success: false, message: "Could not update user." });
  }
};

// Delete users while preventing an admin from deleting their own account here.
const deleteAdminUser = async (req, res) => {
  try {
    if (req.params.id === String(req.user.id)) return res.status(400).json({ success: false, message: "You cannot delete your own admin account." });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });
    return res.status(200).json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    console.error("Delete admin user error:", error);
    return res.status(500).json({ success: false, message: "Could not delete user." });
  }
};

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
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
};
