const mongoose = require("mongoose");
const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MembershipSubscription",
    required: true,
  },

  membershipPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MembershipPlan",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  paymentMethod: {
    type: String,
    enum: ["eSewa", "Khalti", "Cash"],
    required: true,
  },

  transactionId: {
    type: String,
    default: null,
  },

  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Payment", paymentSchema);