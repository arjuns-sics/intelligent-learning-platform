const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [150, "Email cannot exceed 150 characters"],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password_hash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: {
        values: ["Student", "Instructor", "Admin"],
        message: "Role must be Student, Instructor, or Admin",
      },
      default: "Student",
    },
    profile_image: {
      type: String,
      default: null,
    },
    preferredMedia: {
      type: String,
      maxlength: [50, "Preferred media cannot exceed 50 characters"],
      default: null,
    },
    masteryScore: {
      type: Number,
      default: 0,
      min: [0, "Mastery score cannot be negative"],
      max: [100, "Mastery score cannot exceed 100"],
    },
    weaknessTags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password_hash
        delete ret.__v
        return ret
      },
    },
  }
)

// Index for faster queries
userSchema.index({ email: 1 })

module.exports = mongoose.model("User", userSchema)