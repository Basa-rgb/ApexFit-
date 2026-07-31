// =======================================================
// eSewa Controller
// Handles payment initiation, success and failure callbacks
// =======================================================

const {
  generateSignature,
  verifyPayment,
} = require("../services/esewaService");

const { v4: uuidv4 } = require("uuid");

const Payment = require("../models/Payments");
const MembershipSubscription = require("../models/MembershipSubscription");
const MembershipPlan = require("../models/MembershipPlan");

// =======================================================
// Initiate eSewa Payment
// =======================================================

const initiateEsewaPayment = async (req, res) => {
  try {
    const { userId, membershipPlanId } = req.body;

    // Find the selected membership plan
    const plan = await MembershipPlan.findById(membershipPlanId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Membership plan not found",
      });
    }

    // Get amount from membership plan
    const amount = plan.price;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership amount",
      });
    }

    // Generate unique transaction id
    const transaction_uuid = uuidv4();

    // Save payment as pending
    await Payment.create({
      userId,
      membershipPlanId,
      amount,
      paymentMethod: "eSewa",
      transactionId: transaction_uuid,
      status: "Pending",
    });

    // Generate eSewa signature
    const message = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${process.env.ESEWA_PRODUCT_CODE}`;

    const signature = generateSignature(message);

    // Send payment details to frontend
    return res.status(200).json({
      success: true,
      paymentUrl: process.env.ESEWA_PAYMENT_URL,

      payment: {
        amount,
        tax_amount: 0,
        total_amount: amount,
        transaction_uuid,
        product_code: process.env.ESEWA_PRODUCT_CODE,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: process.env.ESEWA_SUCCESS_URL,
        failure_url: process.env.ESEWA_FAILURE_URL,
        signed_field_names:
          "total_amount,transaction_uuid,product_code",
        signature,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================================
// eSewa Success Callback
// =======================================================

const esewaSuccess = async (req, res) => {
  try {
    // Decode eSewa response
    const encodedData = req.query.data;

    const decodedData = JSON.parse(
      Buffer.from(encodedData, "base64").toString("utf-8")
    );

    // Verify payment from eSewa server
    const verification = await verifyPayment(
      decodedData.transaction_uuid,
      decodedData.total_amount
    );

    // Continue only if payment is successful
    if (verification.status === "COMPLETE") {

      // Update payment status
      const payment = await Payment.findOneAndUpdate(
        {
          transactionId: decodedData.transaction_uuid,
        },
        {
          status: "Completed",
          transactionId: verification.ref_id,
        },
      { returnDocument: "after" },
      );

      // Safety check
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: "Payment record not found",
        });
      }

      // Get membership plan
      const plan = await MembershipPlan.findById(
        payment.membershipPlanId
      );

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      // Generate subscription dates
      const startDate = new Date();

      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.duration);

      // Create membership subscription
      await MembershipSubscription.create({
        userId: payment.userId,
        membershipPlanId: payment.membershipPlanId,
        startDate,
        endDate,
        status: "Active",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Successful",
      decodedData,
      verification,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================================
// eSewa Failure Callback
// =======================================================

const esewaFailure = (req, res) => {

  console.log(req.query);

  return res.status(400).json({
    success: false,
    message: "Payment Failed",
    data: req.query,
  });
};

// =======================================================
// Export Controller Functions
// =======================================================

module.exports = {
  initiateEsewaPayment,
  esewaSuccess,
  esewaFailure,
};