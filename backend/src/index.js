require("dotenv").config()

const app = require("./app")
const connectDB = require("./config/database")
const config = require("./config")

const PORT = config.port

// Start server
async function startServer() {
  try {
    await connectDB()
    console.log(`Environment: ${config.nodeEnv}`)
    
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/api/health`)
      console.log(`Ready check: http://localhost:${PORT}/api/health/ready`)
    })

    // Graceful shutdown handling
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`)
      
      server.close(async () => {
        console.log("HTTP server closed")
        
        // Close database connection
        const mongoose = require("mongoose")
        await mongoose.connection.close()
        console.log("Database connection closed")
        
        console.log("Graceful shutdown completed")
        process.exit(0)
      })
      
      // Force exit after 10 seconds
      setTimeout(() => {
        console.error("Forced shutdown after timeout")
        process.exit(1)
      }, 10000)
    }

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
    process.on("SIGINT", () => gracefulShutdown("SIGINT"))
    
    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("Uncaught Exception:", err)
      gracefulShutdown("uncaughtException")
    })
    
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason)
      gracefulShutdown("unhandledRejection")
    })
    
  } catch (error) {
    console.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()
