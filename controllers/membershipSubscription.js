const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const MembershipPlan = require("../models/MembershipPlan");
const MembershipSubscription = require("../models/MembershipSubscription");

// Create a new membership subscription

const createMembershipSubscription = async (req, res) => {
  try {
    const { userId, membershipPlanId } = req.body;

    // validate the required fields
    if (!userId || !membershipPlanId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Membership Plan ID are required.",
      });
    }

    // validate ObjectId
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(membershipPlanId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID or Membership Plan ID format.",
      });
    }

    // Find the User
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }
    // find the Membership Plan
    const membershipPlan = await MembershipPlan.findById(membershipPlanId);
    if (!membershipPlan) {
      return res.status(404).json({
        success: false,
        message: "Membership Plan not found.",
      });
    }

    // check the active subscription for the user
    const activeSubscription = await MembershipSubscription.findOne({
      userId: userId,
      status: "Active",
    });

    // If the user has an active subscription, return an error
    if (activeSubscription) {
      return res.status(409).json({
        success: false,
        message: "User already has an active subscription.",
      });
    }

    // Generate the start and end dates for the subscription
    const startDate = new Date();
    const endDate = new Date(startDate);

    endDate.setMonth(endDate.getMonth() + membershipPlan.duration);

    // Create a new membership subscription
    const newSubscription = new MembershipSubscription({
      userId: userId,
      membershipPlanId: membershipPlanId,
      startDate: startDate,
      endDate: endDate,
      status: "Active",
    });

    // Save the new subscription to the database
    await newSubscription.save();

    // Return a success response with the new subscription details
    return res.status(201).json({
      success: true,
      message: "Membership subscription created successfully.",
      data: newSubscription,
    });
  } catch (error) {
    console.error("Error creating membership subscription:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the membership subscription.",
    });
  }
};

// Get all membership subscriptions


const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await MembershipSubscription.find()
      .populate("userId", "fullName email")
      .populate("membershipPlanId", "name duration price");

    if (subscriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No membership subscriptions found.",
      });
    }

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      message: "Membership subscriptions retrieved successfully.",
      data: subscriptions,
    });
  } catch (error) {
    console.error("Error retrieving membership subscriptions:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


// Get a membership subscription by ID

const getSubscriptionById = async (req, res) => {
  try {
    // Validate subscription ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID.",
      });
    }

    // Find subscription by ID and populate related data
    const subscription = await MembershipSubscription.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("membershipPlanId", "name duration price");

    // Check if subscription exists
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Subscription retrieved successfully.",
      data: subscription,
    });
  } catch (error) {
    console.error("Error retrieving subscription:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};



// Update a membership subscription by ID


const updateMembershipSubscription = async (req, res) => {
  try {
    // Validate subscription ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID.",
      });
    }

    // Find subscription
    const subscription = await MembershipSubscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    // Read request body
    const { status } = req.body;

    // Validate status
    if (status === undefined) {
      return res.status(400).json({
        success: false,
        message: "Status is required.",
      });
    }

    if (!["Active", "Expired", "Cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status.",
      });
    }

    // Update status
    subscription.status = status;

    // Save
    await subscription.save();

    // Return response
    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully.",
      data: subscription,
    });
  } catch (error) {
    console.error("Error updating subscription:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


// Delete a membership subscription by ID


const deleteMembershipSubscription = async (req, res) => {
  try {
    // Validate subscription ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription ID.",
      });
    }

    // Find subscription
    const subscription = await MembershipSubscription.findById(req.params.id);

    // Check if subscription exists
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found.",
      });
    }

    // Delete subscription
    await subscription.deleteOne();

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting subscription:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};


module.exports = {
  createMembershipSubscription,
  getAllSubscriptions,
  getSubscriptionById,
  updateMembershipSubscription,
  deleteMembershipSubscription,
};
