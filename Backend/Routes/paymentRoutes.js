const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");

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
router.get("/",protect, getAllPayments);

// Get Payment By ID
router.get("/:id",protect , getPaymentsById);

// Update Payment
router.put("/:id", protect, updatePaymentById);

// Delete Payment
router.delete("/:id",protect, deletePaymentById);

module.exports = router;
