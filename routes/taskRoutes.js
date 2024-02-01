const express = require("express");
const Task = require("../models/Task");
const SubTask = require("../models/subTask");
const verifyToken = require("../middlewares/verifyToken");
const User = require("../models/User");

const mongoose = require("mongoose");
const router = express.Router();

// Create Task endpoint ✅
router.post("/settasks", verifyToken, async (req, res) => {
  try {
    const { title, description, due_date, priority, status } = req.body;
    const userId = req.userId; // Get the user ID from the token

    // Create a new task associated with the user
    const task = new Task({
      title,
      description,
      due_date,
      priority,
      status,
      userId,
    });
    await task.save();

    // Update the user's tasks array (if needed)
    await User.findByIdAndUpdate(userId, { $addToSet: { tasks: task._id } });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Get All User Tasks endpoint ✅
router.get("/gettasks", verifyToken, async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from the token

    // Fetch tasks associated with the user
    const tasks = await Task.find({ userId });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Update Task API ✅
router.put("/settasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { due_date, status } = req.body;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { due_date, status },
      { new: true }
    );

    // Check if task exists
    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update corresponding sub-tasks
    await SubTask.updateMany({ task_id: taskId }, { status });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete Task endpoint✅
router.delete("/settasks/:taskId", verifyToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    // Validate task ID
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid Task ID" });
    }

    // Delete task
    const deletedTask = await Task.findByIdAndDelete(taskId);

    // Check if task exists
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete corresponding subtasks
    await SubTask.deleteMany({ task_id: taskId });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
