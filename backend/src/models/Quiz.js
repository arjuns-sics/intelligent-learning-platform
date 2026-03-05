const mongoose = require("mongoose")
const quizQuestionSchema = require("./QuizQuestion")

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    moduleId: {
      type: String,
      default: null,
    },
    timeLimit: {
      type: Number,
      default: 0,
      min: [0, "Time limit cannot be negative"],
    },
    passingScore: {
      type: Number,
      default: 70,
      min: [0, "Passing score cannot be negative"],
      max: [100, "Passing score cannot exceed 100"],
    },
    questions: {
      type: [quizQuestionSchema],
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

module.exports = quizSchema
