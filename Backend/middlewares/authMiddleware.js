const jwt = require('jsonwebtoken')

 const protect = (req, res, next) => {
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

    // Attach user data to request

    req.user = decoded;

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
