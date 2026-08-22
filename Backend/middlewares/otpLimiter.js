const rateLimit = require("express-rate-limit");

// Limit OTP requests per EMAIL instead of per IP — behind Render/Vercel all
// visitors share the same proxy IP, so IP-based limits block everyone at once.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,

  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    // Fall back to the client IP when no email is present.
    return email || req.ip;
  },

  message: {
    success: false,
    message:
      "Too many OTP requests for this email, please try again after 15 minutes",
  },

  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = otpLimiter;
