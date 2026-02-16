/**
 * Error handler middleware
 * Handles all errors and returns appropriate response
 */
function errorHandler(err, req, res, next) {
  // Log error in development
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    })
  }

  // Determine status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  
  // Handle specific error types
  let message = err.message
  
  // Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors).map(e => e.message).join(", ")
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    message = "Duplicate field value entered"
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    message = "Resource not found"
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  })
}

/**
 * 404 Not Found handler
 */
function notFound(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

module.exports = { errorHandler, notFound }
