const express = require("express")
const router = express.Router()
const {
  enrollInCourse,
  getMyEnrollments,
  getEnrollment,
  checkEnrollment,
  updateProgress,
  dropEnrollment,
  completeEnrollment,
} = require("../controllers/enrollmentController")
const { authenticate, authorize } = require("../middleware/auth")

// All routes require authentication
router.use(authenticate)

/**
 * @route   POST /api/enrollments/enroll/:courseId
 * @desc    Enroll in a course (student only)
 * @access  Private (Student)
 */
router.post("/enroll/:courseId", authorize("Student", "Admin"), enrollInCourse)

/**
 * @route   GET /api/enrollments/my-courses
 * @desc    Get all enrollments for the authenticated student
 * @access  Private (Student)
 */
router.get("/my-courses", authorize("Student", "Admin"), getMyEnrollments)

/**
 * @route   GET /api/enrollments/check/:courseId
 * @desc    Check if user is enrolled in a course
 * @access  Private (Student)
 */
router.get("/check/:courseId", authorize("Student", "Admin"), checkEnrollment)

/**
 * @route   GET /api/enrollments/:enrollmentId
 * @desc    Get a single enrollment by ID
 * @access  Private (Student)
 */
router.get("/:enrollmentId", authorize("Student", "Admin"), getEnrollment)

/**
 * @route   PUT /api/enrollments/:enrollmentId/progress
 * @desc    Update enrollment progress
 * @access  Private (Student)
 */
router.put("/:enrollmentId/progress", authorize("Student", "Admin"), updateProgress)

/**
 * @route   POST /api/enrollments/:enrollmentId/complete
 * @desc    Mark an enrollment as completed
 * @access  Private (Student)
 */
router.post("/:enrollmentId/complete", authorize("Student", "Admin"), completeEnrollment)

/**
 * @route   DELETE /api/enrollments/:enrollmentId
 * @desc    Drop a course enrollment
 * @access  Private (Student)
 */
router.delete("/:enrollmentId", authorize("Student", "Admin"), dropEnrollment)

module.exports = router
