// routes/taskRoutes.js
const express = require("express");
const router = express.Router();
const {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
} = require("../controllers/taskController"); // Import task controller functions
const { protect } = require("../middleware/authMiddleware"); // Import the protect middleware

// Apply protect middleware to all task routes
router
  .route("/")
  .get(protect, getTasks) // GET /api/tasks (get all tasks for user)
  .post(protect, createTask); // POST /api/tasks (create new task)

router
  .route("/:id")
  .get(protect, getTaskById) // GET /api/tasks/:id (get single task)
  .put(protect, updateTask) // PUT /api/tasks/:id (update task)
  .delete(protect, deleteTask); // DELETE /api/tasks/:id (delete task)

// Specific route for toggling completion status
router.put("/:id/complete", protect, toggleTaskCompletion);

module.exports = router;
