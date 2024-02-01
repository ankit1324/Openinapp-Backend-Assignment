const mongoose = require("mongoose");

const SubTaskSchema = new mongoose.Schema({
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Task",
  },
  status: {
    type: Number,
    enum: [0, 1], //0-incomplet,1-complete
    required: true,
    default: "TODO",
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
});

module.exports = mongoose.model("SubTask", SubTaskSchema);
