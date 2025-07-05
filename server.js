// server.js
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes"); // Import task routes

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

(async () => {
  await import('./reminderScheduler.js');
})();


// Basic Route for testing
app.get("/", (req, res) => {
  res.send("Task Manager API is running!");
});

// Use Auth Routes
app.use("/api/auth", authRoutes);
// Use Task Routes
app.use("/api/tasks", taskRoutes); // All routes defined in taskRoutes.js will be prefixed with /api/tasks

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
