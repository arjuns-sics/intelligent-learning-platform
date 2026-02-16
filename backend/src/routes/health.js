const express = require("express")
const mongoose = require("mongoose")
const router = express.Router()

// Cache for health check to avoid repeated DB calls
let lastHealthCheck = null
let lastCheckTime = null

/**
 * Comprehensive health check endpoint
 * Returns server status, database connectivity, and system info
 */
router.get("/", async (req, res, next) => {
  try {
    const startTime = Date.now()
    
    // Check database connection
    let dbStatus = "disconnected"
    let dbLatency = null
    
    if (mongoose.connection.readyState === 1) {
      const dbStartTime = Date.now()
      await mongoose.connection.db.admin().ping()
      dbLatency = Date.now() - dbStartTime
      dbStatus = "connected"
    }

    const responseTime = Date.now() - startTime

    const healthData = {
      status: dbStatus === "connected" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      service: {
        name: "Intelligent Learning Platform API",
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
      },
      dependencies: {
        database: {
          status: dbStatus,
          latency: dbLatency ? `${dbLatency}ms` : null,
          host: mongoose.connection.host || null,
          name: mongoose.connection.name || null,
        },
      },
      metrics: {
        responseTime: `${responseTime}ms`,
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        },
        cpu: process.cpuUsage(),
      },
    }

    // Cache the health check
    lastHealthCheck = healthData
    lastCheckTime = new Date()

    const statusCode = healthData.status === "healthy" ? 200 : 503
    res.status(statusCode).json(healthData)
  } catch (error) {
    next(error)
  }
})

/**
 * Simple health check (lighter weight, cached)
 * For load balancer health checks
 */
router.get("/live", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  })
})

/**
 * Readiness check - includes database connectivity
 * For Kubernetes readiness probe
 */
router.get("/ready", async (req, res) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1
    
    if (isDbReady) {
      res.status(200).json({
        status: "ready",
        timestamp: new Date().toISOString(),
      })
    } else {
      res.status(503).json({
        status: "not ready",
        reason: "Database not connected",
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      reason: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

module.exports = router
