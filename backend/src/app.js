const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const path = require("path")

const routes = require("./routes")
const { errorHandler, notFound } = require("./middleware/errorHandler")
const { validateEnv } = require("./middleware/envValidator")

const app = express()

// Validate environment variables first
app.use(validateEnv)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      connectSrc: ["'self'", "https://openrouter.ai"],
      frameSrc: ["'self'", "https://www.youtube.com", "https://www.youtube-nocookie.com"],
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

// Serve static files from the React app in production
const staticPath = process.env.STATIC_PATH || path.join(__dirname, "../static")
app.use(express.static(staticPath, {
  index: false,
  cacheControl: process.env.NODE_ENV === "production" ? "public, max-age=31536000" : "no-cache",
}))

// API routes
app.use("/api", routes)

// Serve React app for any non-API routes (SPA routing)
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(staticPath, "index.html"))
})

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Intelligent Learning Platform API",
    version: "1.0.0",
    documentation: "/api/health",
    app: "/intelligent-learning",
  })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

module.exports = app
