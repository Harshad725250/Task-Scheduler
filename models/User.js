// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs"); // For password hashing

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // Ensures usernames are unique
    trim: true, // Removes whitespace from both ends of a string
    minlength: 3, // Minimum length for username
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensures emails are unique
    trim: true,
    lowercase: true, // Converts email to lowercase before saving
    // Basic email validation regex (can be more robust)
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length for password
  },
  createdAt: {
    type: Date,
    default: Date.now, // Sets default value to current date/time
  },
});

// --- Mongoose Middleware (Pre-save hook for password hashing) ---
// This runs BEFORE a user document is saved to the database
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt with 10 rounds
    this.password = await bcrypt.hash(this.password, salt); // Hash the password
    next(); // Proceed to save
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

// --- Method to compare entered password with hashed password ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
