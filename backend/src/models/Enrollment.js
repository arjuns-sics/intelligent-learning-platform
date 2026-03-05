const mongoose = require("mongoose")

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["active", "completed", "dropped"],
        message: "Status must be active, completed, or dropped",
      },
      default: "active",
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },
    completedModules: {
      type: [String], // Array of module IDs
      default: [],
    },
    completedLessons: {
      type: [String], // Array of lesson IDs
      default: [],
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true })

// Index for faster queries
enrollmentSchema.index({ student: 1, status: 1 })
enrollmentSchema.index({ course: 1, status: 1 })

// Virtual for checking if enrollment is completed
enrollmentSchema.virtual("isCompleted").get(function () {
  return this.status === "completed"
})

// Method to update progress
enrollmentSchema.methods.updateProgress = function (lessonId, moduleId) {
  if (!this.completedLessons.includes(lessonId)) {
    this.completedLessons.push(lessonId)
  }
  if (moduleId && !this.completedModules.includes(moduleId)) {
    // Check if all lessons in the module are completed
    // This would need to be validated at the service layer
    this.completedModules.push(moduleId)
  }
  this.lastAccessedAt = Date.now()
  this.progress = this.calculateProgress()
  return this.save()
}

// Method to calculate progress percentage
enrollmentSchema.methods.calculateProgress = function () {
  // This is a simplified calculation
  // Actual implementation would need course data
  return this.progress
}

// Method to mark as completed
enrollmentSchema.methods.markAsCompleted = function () {
  this.status = "completed"
  this.completedAt = Date.now()
  this.progress = 100
  return this.save()
}

// Method to drop enrollment
enrollmentSchema.methods.drop = function () {
  this.status = "dropped"
  return this.save()
}

module.exports = mongoose.model("Enrollment", enrollmentSchema)
