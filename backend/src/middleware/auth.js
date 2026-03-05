const jwt = require("jsonwebtoken")

const authenticate = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Auth error: No Bearer token in header", { authHeader })
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      console.error("Auth error: Token is empty after split")
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      })
    }

    // Debug: Log token format (first 50 chars only for security)
    console.log("Token received (first 50 chars):", token.substring(0, 50) + "...")
    console.log("Token length:", token.length)
    console.log("JWT_SECRET set:", !!process.env.JWT_SECRET)
    console.log("JWT_SECRET value:", process.env.JWT_SECRET)

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Attach user info to request
    req.user = {
      _id: decoded._id,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch (error) {
    console.error("Authentication error:", {
      name: error.name,
      message: error.message,
      hasToken: !!req.headers.authorization,
      jwtSecretSet: !!process.env.JWT_SECRET,
    })

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
      })
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
      })
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed.",
    })
  }
}

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated.",
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      })
    }

    next()
  }
}

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1]

      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = {
          _id: decoded._id,
          email: decoded.email,
          role: decoded.role,
        }
      }
    }
    next()
  } catch (error) {
    // Continue without user info if token is invalid
    next()
  }
}

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
}