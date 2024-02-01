const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
  },
  due_date: {
    type: Date,
    required: true,
  },
  priority: {
    type: Number,
    required: true,
    default: 0, // 0 - Due today, 1 - Tomorrow/day after, 2 - 3-4 days, 3 - 5+ days
  },
  status: {
    type: String, // Change the type to String
    enum: ["TODO", "IN_PROGRESS", "DONE"], // Use enum to specify allowed values
    required: true,
    default: "TODO", // Default value is set to "TODO", 0-incomplet,1-complete
  },
  subtasks: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "SubTask",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  deleted_at: {
    type: Date,
    default: null,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Update task status based on subtasks
TaskSchema.methods.updateStatus = async function () {
  const completedSubtasks = await this.model("SubTask").find({
    task_id: this._id,
    status: 1,
  });
  const allSubtasks = await this.model("SubTask").find({ task_id: this._id });
  if (completedSubtasks.length === 0) {
    this.status = "TODO";
  } else if (completedSubtasks.length === allSubtasks.length) {
    this.status = "DONE";
  } else {
    this.status = "IN_PROGRESS";
  }
  await this.save();
};

module.exports = mongoose.model("Task", TaskSchema);
