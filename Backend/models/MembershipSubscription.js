const mongoose = require("mongoose");

const membershipSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    membershipPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Active", "Expired", "Cancelled"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  },
);
module.exports = mongoose.model(
  "MembershipSubscription",
  membershipSubscriptionSchema,
);
