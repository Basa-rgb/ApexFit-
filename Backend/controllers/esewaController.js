const crypto = require("crypto");
const mongoose = require("mongoose");
const axios = require("axios");
const Transaction = require("../models/Transaction");
const Payment = require("../models/Payments");
const MembershipPlan = require("../models/MembershipPlan");
const MembershipSubscription = require("../models/MembershipSubscription");
const Booking = require("../models/Bookings");

const ESEWA_STATUSES = [
  "PENDING",
  "COMPLETE",
  "FAILED",
  "REFUNDED",
  "FULL_REFUND",
  "PARTIAL_REFUND",
  "AMBIGUOUS",
  "NOT_FOUND",
  "CANCELED",
];

const generateTransactionUuid = () =>
  `apexfit-${Date.now()}-${crypto.randomBytes(5).toString("hex")}`;

const addMonths = (date, months) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

const normalizeGatewayStatus = (status) => {
  const normalized = String(status || "FAILED").toUpperCase();
  return ESEWA_STATUSES.includes(normalized) ? normalized : "FAILED";
};

const paymentStatusFromGateway = (status) => {
  if (status === "COMPLETE") return "Completed";
  if (status === "PENDING" || status === "AMBIGUOUS") return "Pending";
  return "Failed";
};

const decodeEsewaData = (encodedData) => {
  const normalized = encodedData.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
};

const verifyEsewaSignature = (decodedData) => {
  if (!decodedData?.signed_field_names || !decodedData?.signature) {
    return false;
  }

  const signedData = decodedData.signed_field_names
    .split(",")
    .map((fieldName) => `${fieldName}=${decodedData[fieldName]}`)
    .join(",");

  const expectedSignature = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(signedData)
    .digest("base64");

  const received = Buffer.from(decodedData.signature);
  const expected = Buffer.from(expectedSignature);

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

const createMembershipPayment = async ({ membershipPlanId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(membershipPlanId)) {
    const error = new Error("Invalid membership plan ID.");
    error.statusCode = 400;
    throw error;
  }

  const plan = await MembershipPlan.findOne({
    _id: membershipPlanId,
    isActive: true,
  });

  if (!plan) {
    const error = new Error("Active membership plan not found.");
    error.statusCode = 404;
    throw error;
  }

  if (plan.price <= 0) {
    const error = new Error("eSewa payment amount must be greater than zero.");
    error.statusCode = 400;
    throw error;
  }

  const activeSubscription = await MembershipSubscription.findOne({
    userId,
    status: "Active",
  });

  if (activeSubscription) {
    const error = new Error("User already has an active subscription.");
    error.statusCode = 409;
    throw error;
  }

  const now = new Date();
  const subscription = await MembershipSubscription.create({
    userId,
    membershipPlanId,
    startDate: now,
    endDate: addMonths(now, plan.duration),
    status: "Pending",
  });

  const transactionUuid = generateTransactionUuid();
  const payment = await Payment.create({
    userId,
    subscriptionId: subscription._id,
    membershipPlanId,
    transactionUuid,
    amount: plan.price,
    paymentMethod: "eSewa",
    status: "Pending",
  });

  return {
    amount: plan.price,
    transactionUuid,
    payment,
    subscription,
  };
};

const createDemoPayment = ({ amount, productId }) => {
  const parsedAmount = Number(amount);

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    const error = new Error("Valid payment amount is required.");
    error.statusCode = 400;
    throw error;
  }

  return {
    amount: parsedAmount,
    // eSewa only accepts alphanumeric characters and hyphens in this field.
    transactionUuid: productId || generateTransactionUuid(),
  };
};

const createBookingPayment = async ({ bookingId, userId }) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    const error = new Error("Invalid booking ID.");
    error.statusCode = 400;
    throw error;
  }

  const booking = await Booking.findOne({ _id: bookingId, userId });
  if (!booking) {
    const error = new Error("Booking not found.");
    error.statusCode = 404;
    throw error;
  }

  if (booking.paymentMethod !== "eSewa") {
    const error = new Error("This booking is not configured for eSewa.");
    error.statusCode = 400;
    throw error;
  }

  if (booking.paymentStatus === "Paid") {
    const error = new Error("This booking has already been paid.");
    error.statusCode = 409;
    throw error;
  }

  const transactionUuid = generateTransactionUuid();
  const payment = await Payment.create({
    userId,
    bookingId: booking._id,
    transactionUuid,
    amount: booking.amount,
    paymentMethod: "eSewa",
    status: "Pending",
  });

  return { amount: booking.amount, transactionUuid, payment, booking };
};

const createEsewaFormData = ({ amount, transactionUuid }) => {
  const productCode = process.env.MERCHANT_ID;
  const totalAmount = Number(amount);
  const signedFieldNames = "total_amount,transaction_uuid,product_code";
  const signedData = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
  const signature = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(signedData)
    .digest("base64");

  return {
    amount: String(totalAmount),
    failure_url: process.env.FAILURE_URL,
    product_delivery_charge: "0",
    product_service_charge: "0",
    product_code: productCode,
    signature,
    signed_field_names: signedFieldNames,
    success_url: process.env.SUCCESS_URL,
    tax_amount: "0",
    total_amount: String(totalAmount),
    transaction_uuid: transactionUuid,
  };
};

const EsewaInitiatePayment = async (req, res) => {
  let payment;
  let subscription;

  try {
    const { membershipPlanId, bookingId, amount, productId } = req.body;

    if (membershipPlanId && !req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Login is required before buying a membership.",
      });
    }

    if (bookingId && !req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Login is required before paying for a booking.",
      });
    }

    const paymentRequest = membershipPlanId
      ? await createMembershipPayment({
          membershipPlanId,
          userId: req.user?.id,
        })
      : bookingId
        ? await createBookingPayment({ bookingId, userId: req.user.id })
      : createDemoPayment({ amount, productId });

    payment = paymentRequest.payment;
    subscription = paymentRequest.subscription;

    if (
      !process.env.MERCHANT_ID ||
      !process.env.SECRET ||
      !process.env.ESEWAPAYMENT_URL ||
      !process.env.SUCCESS_URL ||
      !process.env.FAILURE_URL
    ) {
      throw new Error("eSewa merchant credentials are not configured.");
    }

    const formData = createEsewaFormData({
      amount: paymentRequest.amount,
      transactionUuid: paymentRequest.transactionUuid,
    });

    await Transaction.create({
      product_id: paymentRequest.transactionUuid,
      paymentId: payment?._id || null,
      amount: paymentRequest.amount,
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      gatewayUrl: process.env.ESEWAPAYMENT_URL,
      formData,
      transactionUuid: paymentRequest.transactionUuid,
    });
  } catch (error) {
    if (payment) {
      payment.status = "Failed";
      payment.gatewayResponse = { error: error.message };
      await payment.save({ validateBeforeSave: false });
    }

    if (subscription) {
      subscription.status = "Cancelled";
      await subscription.save({ validateBeforeSave: false });
    }

    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message || "Error initiating eSewa payment.",
    });
  }
};

const activateSubscription = async (payment) => {
  if (!payment?.subscriptionId) return null;

  const subscription = await MembershipSubscription.findById(
    payment.subscriptionId,
  );

  if (!subscription) return null;

  const plan = await MembershipPlan.findById(payment.membershipPlanId);
  const startDate = new Date();

  subscription.status = "Active";
  subscription.startDate = startDate;
  subscription.endDate = addMonths(startDate, plan?.duration || 1);

  await subscription.save();
  return subscription;
};

const cancelSubscription = async (payment) => {
  if (!payment?.subscriptionId) return null;

  const subscription = await MembershipSubscription.findById(
    payment.subscriptionId,
  );

  if (!subscription || subscription.status === "Active") return subscription;

  subscription.status = "Cancelled";
  await subscription.save({ validateBeforeSave: false });
  return subscription;
};

const paymentStatus = async (req, res) => {
  try {
    const { data, product_id } = req.body;
    const decodedData = data ? decodeEsewaData(data) : null;

    if (decodedData && !verifyEsewaSignature(decodedData)) {
      return res.status(400).json({
        success: false,
        message: "Invalid eSewa response signature.",
      });
    }

    const transactionUuid = decodedData?.transaction_uuid || product_id;

    if (!transactionUuid) {
      return res.status(400).json({
        success: false,
        message: "Transaction UUID is required.",
      });
    }

    const payment = await Payment.findOne({ transactionUuid });
    let transaction = await Transaction.findOne({ product_id: transactionUuid });

    if (!payment && !transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    if (
      payment &&
      String(payment.userId) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot verify another member's payment.",
      });
    }

    const amount = payment?.amount || transaction.amount;
    const paymentStatusCheck = await axios.get(
      process.env.ESEWAPAYMENT_STATUS_CHECK_URL,
      {
        params: {
          product_code: process.env.MERCHANT_ID,
          total_amount: amount,
          transaction_uuid: transactionUuid,
        },
      },
    );

    const gatewayStatus = normalizeGatewayStatus(
      paymentStatusCheck?.data?.status || decodedData?.status,
    );
    const gatewayResponse = {
      redirect: decodedData || {},
      statusCheck: paymentStatusCheck?.data || {},
    };

    if (!transaction) {
      transaction = new Transaction({
        product_id: transactionUuid,
        paymentId: payment?._id || null,
        amount,
      });
    }

    transaction.status = gatewayStatus;
    transaction.gatewayResponse = gatewayResponse;
    await transaction.save();

    let subscription = null;

    if (payment) {
      payment.status = paymentStatusFromGateway(gatewayStatus);
      payment.transactionId =
        decodedData?.transaction_code ||
        paymentStatusCheck?.data?.ref_id ||
        paymentStatusCheck?.data?.transaction_code ||
        payment.transactionId;
      payment.gatewayResponse = gatewayResponse;

      if (gatewayStatus === "COMPLETE") {
        payment.paymentDate = new Date();
        subscription = await activateSubscription(payment);
      } else if (payment.status === "Failed") {
        subscription = await cancelSubscription(payment);
      }

      await payment.save({ validateBeforeSave: false });

      if (payment.bookingId) {
        const booking = await Booking.findById(payment.bookingId);
        if (booking) {
          booking.paymentStatus =
            gatewayStatus === "COMPLETE" ? "Paid" : payment.status === "Failed" ? "Failed" : "Pending";
          if (gatewayStatus === "COMPLETE") booking.status = "Confirmed";
          await booking.save({ validateBeforeSave: false });
        }
      }
    }

    return res.status(200).json({
      success: gatewayStatus === "COMPLETE",
      message:
        gatewayStatus === "COMPLETE"
          ? "Payment verified successfully."
          : "Payment is not complete.",
      status: gatewayStatus,
      payment,
      subscription,
    });
  } catch (error) {
    console.error("Error updating transaction status:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying payment.",
      error: error.message,
    });
  }
};

module.exports = { EsewaInitiatePayment, paymentStatus };
