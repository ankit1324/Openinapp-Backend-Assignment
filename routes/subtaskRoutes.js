const express = require("express");
const Task = require("../models/Task");
const SubTask = require("../models/subTask");
const verifyToken = require("../middlewares/verifyToken");
// const User = require("../models/User");

const mongoose = require("mongoose");
const router = express.Router();

// Move your /tasks/:taskId/subtasks/:_id and /tasks/:taskId/subtasks/:_id routes here

// Create SubTask endpoint✅
router.post("/tasks/:taskId/subtasks", verifyToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const subtask = new SubTask(req.body);
    subtask.task_id = task._id;
    await subtask.save();

    // Update task status based on subtasks
    await task.updateStatus();

    // // Update the user's tasks array with the subtask's task ID
    // const userId = req.userId;
    // await User.findByIdAndUpdate(userId, { $addToSet: { tasks: task._id } });

    res.status(201).json(subtask);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// Get All User Subtasks endpoint✅
router.get("/tasks/:taskId/subtasks", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }
    const subtasks = await SubTask.find({ task_id: task._id });
    res.json(subtasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching subtasks" });
  }
});

// Update a particular Sub Task API ✅
router.put("/tasks/:taskId/subtasks/:_id", verifyToken, async (req, res) => {
  try {
    const { _id } = req.params;
    const { status } = req.body;

    // Validate subtask ID
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid Sub Task ID" });
    }

    // Update subtask
    const updatedSubTask = await SubTask.findByIdAndUpdate(
      _id,
      { status },
      { new: true }
    );

    // Check if subtask exists
    if (!updatedSubTask) {
      return res.status(404).json({ message: "Sub Task not found" });
    }

    res.status(200).json(updatedSubTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete Subtask endpoint✅
router.delete("/tasks/:taskId/subtasks/:_id", async (req, res) => {
  try {
    const { taskId, _id } = req.params;

    // Validate task ID and subtask ID
    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(_id)
    ) {
      return res.status(400).json({ message: "Invalid Task or Subtask ID" });
    }

    // Delete subtask
    const deletedSubtask = await SubTask.findByIdAndDelete(_id);

    // Check if subtask exists
    if (!deletedSubtask) {
      return res.status(404).json({ message: "Subtask not found" });
    }

    // Update task status if needed
    const task = await Task.findById(taskId);
    if (task) {
      await task.updateStatus();
    }

    res.status(200).json({ message: "Subtask deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
