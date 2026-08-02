const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const {
  EsewaInitiatePayment,
  paymentStatus,
} = require("../controllers/esewaController");

const attachUserIfToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  try {
    req.user = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Routes
router.post("/initiate-payment", attachUserIfToken, EsewaInitiatePayment);
router.post("/payment-status", paymentStatus);

module.exports = router;
