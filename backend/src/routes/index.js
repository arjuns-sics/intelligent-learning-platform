const express = require("express")
const router = express.Router()

// Health check routes
const healthRoutes = require("./health")

// API v1 routes
router.get("/v1", (req, res) => {
  res.json({ 
    message: "Intelligent Learning Platform API v1",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      "health/live": "/health/live",
      "health/ready": "/health/ready"
    }
  })
})

// Health check - mounted at /api/health
router.use("/health", healthRoutes)

module.exports = router
