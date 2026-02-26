const express = require("express")
const router = express.Router()

const authController = require("../controllers/authController")
const { authenticate, authorize } = require("../middleware/auth")

// Public routes
// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post("/register", authController.register)

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authController.login)

// Protected routes
// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get("/profile", authenticate, authController.getProfile)

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticate, authController.updateProfile)

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put("/password", authenticate, authController.changePassword)

// Admin only routes
// @route   GET /api/auth/admin-only
// @desc    Example admin-only endpoint
// @access  Private (Admin only)
// router.get("/admin-only", authenticate, authorize("Admin"), (req, res) => {
//   res.json({ message: "Admin access granted" })
// })

module.exports = router