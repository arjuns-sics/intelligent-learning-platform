const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

const routes = require("./routes")
const { errorHandler, notFound } = require("./middleware/errorHandler")
const { validateEnv } = require("./middleware/envValidator")

const app = express()

// Validate environment variables first
validateEnv()

// Security middleware

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

// CORS configuration
app.use(
  cors({
    origin: process.env.NODE_ENV === "production" 
      ? process.env.CORS_ORIGIN || false 
      : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
)

// Body parser with size limits
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on("finish", () => {
    const duration = Date.now() - start
    const log = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get("user-agent") || "unknown",
    }
    
    // Log in development
    if (process.env.NODE_ENV !== "production") {
      console.log(JSON.stringify(log))
    }
  })
  
  next()
})

// API routes
app.use("/api", routes)

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Intelligent Learning Platform API",
    version: "1.0.0",
    documentation: "/api/v1",
  })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

module.exports = app
