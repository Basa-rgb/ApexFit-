const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

const {
  EsewaInitiatePayment,
  paymentStatus,
} = require("../controllers/esewaController");

// Routes
router.post("/initiate-payment", protect, EsewaInitiatePayment);
router.post("/payment-status", protect, paymentStatus);

module.exports = router;
