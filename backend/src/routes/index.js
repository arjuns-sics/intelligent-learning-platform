const express = require("express")
const router = express.Router()

// Route imports
const healthRoutes = require("./health")
const authRoutes = require("./auth")

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
    },
  })
})

// Health check - mounted at /api/health
router.use("/health", healthRoutes)

// Auth routes - mounted at /api/auth
router.use("/auth", authRoutes)

module.exports = router
