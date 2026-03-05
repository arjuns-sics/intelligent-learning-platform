const mongoose = require("mongoose")

const quizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ["multiple-choice", "true-false", "short-answer"],
        message: "Question type must be multiple-choice, true-false, or short-answer",
      },
      default: "multiple-choice",
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Correct answer is required"],
    },
    points: {
      type: Number,
      default: 1,
      min: [0, "Points cannot be negative"],
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

module.exports = quizQuestionSchema
