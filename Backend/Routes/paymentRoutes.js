const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/adminMiddleware");

const {
  createPayment,
  getAllPayments,
  getPaymentsById,
  updatePaymentById,
  deletePaymentById,
} = require("../controllers/PaymentController");

// Create Payment
router.post("/", protect, createPayment);

// Get All Payments
router.get("/", protect, isAdmin, getAllPayments);

// Get Payment By ID
router.get("/:id", protect, isAdmin, getPaymentsById);

// Update Payment
router.put("/:id", protect, isAdmin, updatePaymentById);

// Delete Payment
router.delete("/:id", protect, isAdmin, deletePaymentById);

module.exports = router;
