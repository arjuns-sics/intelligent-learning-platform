const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: {
        values: ["video", "article", "resource"],
        message: "Lesson type must be video, article, or resource",
      },
      default: "video",
    },
    duration: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    videoUrl: {
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

module.exports = lessonSchema
