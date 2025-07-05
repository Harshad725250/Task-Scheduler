// routes/authRoutes.js
const express = require("express");
const router = express.Router(); // Create an Express router
const { registerUser, loginUser } = require("../controllers/authController"); // Import controller functions

// Define authentication routes
router.post("/register", registerUser); // Route for user registration
router.post("/login", loginUser); // Route for user login

module.exports = router;
