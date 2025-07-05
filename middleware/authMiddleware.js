// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // We need the User model to find the user by ID

const protect = async (req, res, next) => {
  let token;

  // Check if the Authorization header is present and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (e.g., "Bearer YOUR_TOKEN_HERE")
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user by ID from the decoded token payload
      // -select('-password') excludes the password field from the returned user object
      req.user = await User.findById(decoded.id).select("-password");

      // If user is found, proceed to the next middleware/route handler
      if (req.user) {
        next();
      } else {
        res.status(401).json({ message: "Not authorized, user not found" });
      }
    } catch (error) {
      console.error("Token verification error:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };
