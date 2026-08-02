const crypto = require("crypto");
const mongoose = require("mongoose");
const { EsewaPaymentGateway, EsewaCheckStatus } = require("esewajs");
const Transaction = require("../models/Transaction");
const Payment = require("../models/Payments");
const MembershipPlan = require("../models/MembershipPlan");
const MembershipSubscription = require("../models/MembershipSubscription");

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
  `apexfit-${Date.now()}-${crypto.randomUUID()}`;

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
    transactionUuid: productId || generateTransactionUuid(),
  };
};

const EsewaInitiatePayment = async (req, res) => {
  let payment;
  let subscription;

  try {
    const { membershipPlanId, amount, productId } = req.body;

    if (membershipPlanId && !req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Login is required before buying a membership.",
      });
    }

    const paymentRequest = membershipPlanId
      ? await createMembershipPayment({
          membershipPlanId,
          userId: req.user?.id,
        })
      : createDemoPayment({ amount, productId });

    payment = paymentRequest.payment;
    subscription = paymentRequest.subscription;

    const reqPayment = await EsewaPaymentGateway(
      paymentRequest.amount,
      0,
      0,
      0,
      paymentRequest.transactionUuid,
      process.env.MERCHANT_ID,
      process.env.SECRET,
      process.env.SUCCESS_URL,
      process.env.FAILURE_URL,
      process.env.ESEWAPAYMENT_URL,
      undefined,
      undefined,
    );

    if (reqPayment?.status !== 200) {
      throw new Error("Could not create eSewa checkout session.");
    }

    await Transaction.create({
      product_id: paymentRequest.transactionUuid,
      paymentId: payment?._id || null,
      amount: paymentRequest.amount,
      status: "PENDING",
    });

    return res.status(200).json({
      success: true,
      url: reqPayment.request.res.responseUrl,
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

    const amount = payment?.amount || transaction.amount;
    const paymentStatusCheck = await EsewaCheckStatus(
      amount,
      transactionUuid,
      process.env.MERCHANT_ID,
      process.env.ESEWAPAYMENT_STATUS_CHECK_URL,
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
