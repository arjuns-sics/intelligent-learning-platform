const mongoose = require("mongoose")

const assignmentSubmissionSchema = new mongoose.Schema(
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
    assignment: {
      type: mongoose.Schema.Types.Mixed, // Store assignment object since it's embedded in Course
      required: [true, "Assignment is required"],
    },
    assignmentId: {
      type: String, // Store the assignment ID from the embedded assignment
      required: [true, "Assignment ID is required"],
    },
    submission: {
      text: {
        type: String,
        default: "",
        maxlength: [10000, "Submission text cannot exceed 10000 characters"],
      },
      files: [
        {
          name: String,
          url: String,
          size: Number,
          type: String,
          uploadedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      links: [String],
    },
    status: {
      type: String,
      enum: {
        values: ["submitted", "graded", "resubmitted"],
        message: "Status must be submitted, graded, or resubmitted",
      },
      default: "submitted",
    },
    grade: {
      score: {
        type: Number,
        default: null,
        min: [0, "Score cannot be negative"],
      },
      maxScore: {
        type: Number,
        default: 100,
      },
      percentage: {
        type: Number,
        default: null,
        min: [0, "Percentage cannot be negative"],
        max: [100, "Percentage cannot exceed 100"],
      },
      gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      gradedAt: {
        type: Date,
      },
      feedback: {
        type: String,
        default: "",
        maxlength: [5000, "Feedback cannot exceed 5000 characters"],
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    resubmissionCount: {
      type: Number,
      default: 0,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
assignmentSubmissionSchema.index({ student: 1, course: 1 })
assignmentSubmissionSchema.index({ student: 1, assignmentId: 1 })
assignmentSubmissionSchema.index({ enrollment: 1 })
assignmentSubmissionSchema.index({ course: 1 })

// Static method to check if student has submitted
assignmentSubmissionSchema.statics.hasSubmitted = async function (studentId, assignmentId) {
  const submission = await this.findOne({
    student: studentId,
    assignmentId: assignmentId,
    status: { $in: ["submitted", "graded", "resubmitted"] },
  }).exec()
  return !!submission
}

// Instance method to calculate grade percentage
assignmentSubmissionSchema.methods.calculateGrade = function () {
  if (this.grade.score !== null && this.grade.maxScore) {
    this.grade.percentage = Math.round((this.grade.score / this.grade.maxScore) * 100)
  }
  return this.grade
}

// Instance method to grade submission
assignmentSubmissionSchema.methods.gradeSubmission = function (score, feedback, gradedBy) {
  this.grade = {
    score: score,
    maxScore: this.assignment?.maxScore || 100,
    percentage: Math.round((score / (this.assignment?.maxScore || 100)) * 100),
    gradedBy: gradedBy,
    gradedAt: new Date(),
    feedback: feedback || "",
  }
  this.status = "graded"
  return this.grade
}

module.exports = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema)
