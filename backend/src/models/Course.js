const mongoose = require("mongoose")
const moduleSchema = require("./Module")
const quizSchema = require("./Quiz")
const assignmentSchema = require("./Assignment")

const courseSchema = new mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Instructor is required"],
    },
    title: {
      type: String,
      required: [true, "Course title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    subtitle: {
      type: String,
      default: "",
      trim: true,
      maxlength: [300, "Subtitle cannot exceed 300 characters"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
      minlength: [50, "Description must be at least 50 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    level: {
      type: String,
      required: [true, "Level is required"],
      enum: {
        values: ["Beginner", "Intermediate", "Advanced", "All Levels"],
        message: "Level must be Beginner, Intermediate, Advanced, or All Levels",
      },
    },
    language: {
      type: String,
      default: "English",
    },
    thumbnail: {
      type: String,
      default: null,
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    learningObjectives: {
      type: [String],
      default: [],
    },
    modules: {
      type: [moduleSchema],
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
    hasCertificate: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: String,
      default: "",
    },
    maxStudents: {
      type: Number,
      default: null,
      min: [0, "Max students cannot be negative"],
    },
    published: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: ["draft", "published", "archived"],
        message: "Status must be draft, published, or archived",
      },
      default: "draft",
    },
    enrolledStudents: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: [0, "Rating cannot be negative"],
        max: [5, "Rating cannot exceed 5"],
      },
      count: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v
        return ret
      },
    },
  }
)

// Indexes for faster queries
courseSchema.index({ instructor: 1 })
courseSchema.index({ status: 1 })
courseSchema.index({ category: 1 })
courseSchema.index({ level: 1 })
courseSchema.index({ title: "text", description: "text" })

// Virtual for total lessons
courseSchema.virtual("totalLessons").get(function () {
  return this.modules.reduce((acc, module) => acc + module.lessons.length, 0)
})

// Virtual for total quizzes
courseSchema.virtual("totalQuizzes").get(function () {
  return this.quizzes.length
})

// Virtual for total assignments
courseSchema.virtual("totalAssignments").get(function () {
  return this.assignments.length
})

module.exports = mongoose.model("Course", courseSchema)
