const mongoose = require("mongoose")

const quizAttemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: [true, "Enrollment is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    quiz: {
      type: mongoose.Schema.Types.Mixed, // Store quiz object since it's embedded in Course
      required: [true, "Quiz is required"],
    },
    quizId: {
      type: String, // Store the quiz ID from the embedded quiz
      required: [true, "Quiz ID is required"],
    },
    answers: {
      type: [
        {
          questionIndex: Number,
          selectedAnswer: mongoose.Schema.Types.Mixed, // Can be number (index) or string (text)
          isCorrect: Boolean,
        },
      ],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
      min: [0, "Score cannot be negative"],
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"],
    },
    passed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ["in-progress", "submitted", "graded"],
        message: "Status must be in-progress, submitted, or graded",
      },
      default: "in-progress",
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
quizAttemptSchema.index({ student: 1, course: 1 })
quizAttemptSchema.index({ student: 1, quizId: 1 })
quizAttemptSchema.index({ enrollment: 1 })
quizAttemptSchema.index({ course: 1 })

// Static method to get next attempt number
quizAttemptSchema.statics.getNextAttemptNumber = async function (studentId, quizId) {
  const lastAttempt = await this.findOne({ student: studentId, quizId: quizId })
    .sort({ attemptNumber: -1 })
    .exec()
  return lastAttempt ? lastAttempt.attemptNumber + 1 : 1
}

// Instance method to calculate and update score
quizAttemptSchema.methods.calculateScore = function () {
  let correctCount = 0
  let totalPoints = 0
  let earnedPoints = 0

  this.answers.forEach((answer) => {
    if (answer.isCorrect) {
      correctCount++
      earnedPoints += 1 // Each question worth 1 point by default
    }
    totalPoints++
  })

  this.score = earnedPoints
  this.maxScore = totalPoints
  this.percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  this.passed = this.percentage >= (this.quiz?.passingScore || 70)

  return {
    score: this.score,
    maxScore: this.maxScore,
    percentage: this.percentage,
    passed: this.passed,
  }
}

// Instance method to mark as completed
quizAttemptSchema.methods.markAsSubmitted = function () {
  this.status = "submitted"
  this.submittedAt = new Date()
  this.calculateScore()
}

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema)
