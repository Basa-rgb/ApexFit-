const mongoose = require("mongoose"); // Define the Transaction schema
const transactionSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0, // Amount should not be negative
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "COMPLETE",
        "FAILED",
        "REFUNDED",
        "FULL_REFUND",
        "PARTIAL_REFUND",
        "AMBIGUOUS",
        "NOT_FOUND",
        "CANCELED",
      ],
      default: "PENDING",
    },
    gatewayResponse: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);
// Create the Transaction model from the schema

module.exports = mongoose.model("Transaction", transactionSchema);
