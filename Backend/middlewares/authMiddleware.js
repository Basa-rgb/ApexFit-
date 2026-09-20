const jwt = require('jsonwebtoken')
const User = require("../models/User");

 const protect = async (req, res, next) => {
  try {
    // Get Authorization header

    const authHeader = req.headers.authorization;

    // Check the token exits

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }
    // Extract the token

    const token = authHeader.split(" ")[1];

    //   Verify token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-check the account so deactivated users and role changes take effect
    // immediately rather than when a previously issued token expires.
    const user = await User.findById(decoded.id).select("_id role isActive");

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "Your session is no longer active. Please sign in again.",
      });
    }

    // The database role, rather than a stale token claim, is authoritative.
    req.user = {
      ...decoded,
      id: user._id.toString(),
      role: user.role,
    };

    // Continue to the next middleware/controller
    next();
  } catch (error) {
    console.error("Authentication Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};


module.exports = {protect};
