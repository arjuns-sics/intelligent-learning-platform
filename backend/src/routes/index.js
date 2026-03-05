const express = require("express")
const router = express.Router()

// Route imports
const healthRoutes = require("./health")
const authRoutes = require("./auth")
const courseRoutes = require("./courses")

// API v1 routes
router.get("/v1", (req, res) => {
  res.json({
    message: "Intelligent Learning Platform API v1",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      "health/live": "/health/live",
      "health/ready": "/health/ready",
      auth: {
        register: "/auth/register",
        login: "/auth/login",
        profile: "/auth/profile (requires authentication)",
        password: "/auth/password (requires authentication)",
      },
      courses: {
        create: "/courses (POST, requires Instructor role)",
        "my-courses": "/courses/instructor/my-courses (GET, requires Instructor role)",
        "get-course": "/courses/:id (GET)",
        "update-course": "/courses/:id (PUT, requires Instructor role)",
        "save-draft": "/courses/:id/draft (POST, requires Instructor role)",
        "publish-course": "/courses/:id/publish (POST, requires Instructor role)",
        "delete-course": "/courses/:id (DELETE, requires Instructor role)",
      },
    },
  })
})

// Health check - mounted at /api/health
router.use("/health", healthRoutes)

// Auth routes - mounted at /api/auth
router.use("/auth", authRoutes)

// Course routes - mounted at /api/courses
router.use("/courses", courseRoutes)

module.exports = router
