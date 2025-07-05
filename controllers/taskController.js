// controllers/taskController.js
const Task = require("../models/Task"); // Import the Task model

// @desc    Get all tasks for the authenticated user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    // Find tasks where userId matches the authenticated user's ID
    // req.user is populated by the protect middleware
    const tasks = await Task.find({ userId: req.user._id }).sort({
      createdAt: -1,
    }); // Sort by newest first
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  const { title, description, dueDate, priority, reminder } = req.body;

  // Basic validation
  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const newTask = await Task.create({
      userId: req.user._id,
      title,
      description,
      dueDate,
      priority,
      reminder,
      reminderSent: false, // ADD THIS
  });

    res.status(201).json(newTask); // 201 Created
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure task belongs to the authenticated user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this task" }); // 403 Forbidden
    }

    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching single task:", error);
    // Check for invalid MongoDB ID format
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  const { title, description, dueDate, priority, completed, reminder } =
    req.body;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure task belongs to the authenticated user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Update task fields
    task.title = title || task.title; // If title is provided, use it, otherwise keep current
    task.description =
      description !== undefined ? description : task.description; // Allow explicit null/empty string for description
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.priority = priority || task.priority;
    task.completed = completed !== undefined ? completed : task.completed; // Allow explicit false/true
    task.reminder = reminder !== undefined ? reminder : task.reminder;
    task.updatedAt = Date.now(); // Manually update for explicit timestamps (if not using {timestamps: true} option in schema)

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure task belongs to the authenticated user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this task" });
    }

    await Task.deleteOne({ _id: req.params.id }); // Using deleteOne for Mongoose 6+
    res.status(200).json({ message: "Task removed" });
  } catch (error) {
    console.error("Error deleting task:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Mark task as completed/uncompleted
// @route   PUT /api/tasks/:id/complete
// @access  Private
const toggleTaskCompletion = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ensure task belongs to the authenticated user
    if (task.userId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to modify this task" });
    }

    task.completed = !task.completed; // Toggle the completed status
    task.updatedAt = Date.now();

    const updatedTask = await task.save();
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Error toggling task completion:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTaskCompletion,
};
