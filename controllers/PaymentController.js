const User = require("../models/User");
const Subscription = require("../models/MembershipSubscription");
const Payments = require("../models/Payments");
const { default: mongoose } = require("mongoose");
const MembershipPlan = require("../models/MembershipPlan");
// Create the payement

const createPayment = async (req, res) => {
  try {
    const { userId, subscriptionId, membershipPlanId, amount, paymentMethod } =
      req.body;

    // Check required fields
    if (
      !userId ||
      !subscriptionId ||
      !membershipPlanId ||
      amount === undefined ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(subscriptionId) ||
      !mongoose.Types.ObjectId.isValid(membershipPlanId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check subscription exists
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    // Check membership plan exists
    const plan = await MembershipPlan.findById(membershipPlanId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    // Validate amount
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    // Prevent duplicate payment
    const existingPayment = await Payments.findOne({
      subscriptionId,
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment already exists for this subscription",
      });
    }

    // Create payment
    const payment = await Payments.create({
      userId,

      subscriptionId,

      membershipPlanId,

      amount,

      paymentMethod,

      status: "Pending",
    });

    return res.status(201).json({
      success: true,

      message: "Payment created successfully",

      payment,
    });
  } catch (error) {
    console.log("Create Payment Error:", error);

    return res.status(500).json({
      success: false,

      message: "Internal server error",
    });
  }
};


// getAllPayments

const getAllPayments = async (req, res) => {
  try {
    // find payment and populate it
    const payments = await Payments.find()
      .populate("userId", "fullName email")
      .populate("subscriptionId", "startDate endDate status");

    // find payment exits or not
    if (payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No payments found",
      });
    }

    // return  successful response
    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });

    // catch block
  } catch (error) {
    console.log("Error while getting payment", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get Payment by Id

const getPaymentsById = async (req, res) => {
  try {
    // chcek id is valid or not
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment Id",
      });
    }

    // find by Id and populate it
    const payment = await Payments.findById(req.params.id)
      .populate("userId", "fullName email")
      .populate("subscriptionId", "startDate endDate status");

    // find payment exits or not
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // return successful response
    return res.status(200).json({
      success: true,
      payment,
    });

    // catch block
  } catch (error) {
    console.log("Error while getting getPaymentsById", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update the payment

const updatePaymentById = async (req, res) => {
  try {
    // validate the Id

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payment ID",
      });
    }

    // Find the payment

    const payment = await Payments.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No payment found",
      });
    }

    // read req body

    const { status, transactionId } = req.body;

    // validate payment status

    if (
      status !== undefined &&
      !["Pending", "Completed", "Failed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    // validate transaction Id
    if (transactionId !== undefined && transactionId.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Transaction ID cannot be empty",
      });
    }

    // Update the fields

    if (status !== undefined) {
      payment.status = status;
    }

    if (transactionId !== undefined) {
      payment.transactionId = transactionId.trim();
    }

    // save the updated field
    await payment.save({ validateBeforeSave: false });

    // return successfull response

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment,
    });

    // catch block
  } catch (error) {
    console.log("Error while updating", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Delete the payment

const deletePaymentById = async (req, res) => {
  try {
    // Invalid payment

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Payment ID",
      });
    }

    const payment = await Payments.findById(req.params.id);

    // Find payment

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "No Payment Found",
      });
    }

    // save and delete

    await payment.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });

    // catch block
  } catch (error) {
    console.log("Delete Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentsById,
  updatePaymentById,
  deletePaymentById,
};
