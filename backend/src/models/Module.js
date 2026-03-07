const mongoose = require("mongoose")
const lessonSchema = require("./Lesson")
const quizSchema = require("./Quiz")
const assignmentSchema = require("./Assignment")

const moduleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Module title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      default: "",
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    quizzes: {
      type: [quizSchema],
      default: [],
    },
    assignments: {
      type: [assignmentSchema],
      default: [],
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

module.exports = moduleSchema
