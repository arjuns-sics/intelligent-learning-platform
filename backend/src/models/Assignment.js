const mongoose = require("mongoose")

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Assignment description is required"],
    },
    moduleId: {
      type: String,
      default: null,
    },
    dueDate: {
      type: String,
      default: "",
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [0, "Max score cannot be negative"],
    },
    fileTypes: {
      type: [String],
      default: [],
    },
    maxFileSize: {
      type: Number,
      default: 10,
      min: [0, "Max file size cannot be negative"],
    },
    instructions: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
)

module.exports = assignmentSchema
