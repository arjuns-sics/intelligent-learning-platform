/**
 * Environment validation middleware
 * Validates required environment variables on startup
 */

const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
]

const optionalEnvVars = [
  "CORS_ORIGIN",
]

function validateEnv(req, res, next) {
  const missing = []
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    }
  }
  
  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(", ")}`)
    
    // Only return error if not in middleware chain (during startup)
    if (!req) {
      process.exit(1)
    }
    
    return res.status(500).json({
      success: false,
      error: `Server configuration error: Missing environment variables: ${missing.join(", ")}`,
    })
  }
  
  // Log available optional variables
  const available = optionalEnvVars.filter(v => process.env[v])
  if (available.length > 0 && process.env.NODE_ENV !== "production") {
    console.log(`Optional environment variables: ${available.join(", ")}`)
  }
  
  next()
}

module.exports = { validateEnv, requiredEnvVars }
