const express = require("express")
const router = express.Router()

const adminController = require("../controllers/adminController")
const { authenticate, authorize } = require("../middleware/auth")

// All admin routes require authentication and Admin role
router.use(authenticate)
router.use(authorize("Admin"))

// ==================== USER MANAGEMENT ROUTES ====================

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Private (Admin only)
router.get("/users", adminController.getAllUsers)

// @route   GET /api/admin/users/:id
// @desc    Get single user by ID
// @access  Private (Admin only)
router.get("/users/:id", adminController.getUserById)

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put("/users/:id/role", adminController.updateUserRole)

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete("/users/:id", adminController.deleteUser)

// ==================== COURSE MANAGEMENT ROUTES ====================

// @route   GET /api/admin/courses
// @desc    Get all courses with filtering and pagination
// @access  Private (Admin only)
router.get("/courses", adminController.getAllCourses)

// @route   GET /api/admin/courses/:id
// @desc    Get course by ID
// @access  Private (Admin only)
router.get("/courses/:id", adminController.getCourseById)

// @route   PUT /api/admin/courses/:id/status
// @desc    Update course status (publish/unpublish)
// @access  Private (Admin only)
router.put("/courses/:id/status", adminController.updateCourseStatus)

// @route   DELETE /api/admin/courses/:id
// @desc    Delete course
// @access  Private (Admin only)
router.delete("/courses/:id", adminController.deleteCourse)

// ==================== DASHBOARD STATISTICS ====================

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get("/stats", adminController.getDashboardStats)

module.exports = router
