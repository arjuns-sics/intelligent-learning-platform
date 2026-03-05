const express = require("express")
const router = express.Router()
const {
  createCourse,
  getInstructorCourses,
  getCourse,
  updateCourse,
  saveDraft,
  publishCourse,
  deleteCourse,
} = require("../controllers/courseController")
const { authenticate, authorize } = require("../middleware/auth")

// All routes require authentication
router.use(authenticate)

/**
 * @route   POST /api/courses
 * @desc    Create a new course (instructor only)
 * @access  Private (Instructor)
 */
router.post("/", authorize("Instructor", "Admin"), createCourse)

/**
 * @route   GET /api/courses/instructor/my-courses
 * @desc    Get all courses for the authenticated instructor
 * @access  Private (Instructor)
 */
router.get("/instructor/my-courses", authorize("Instructor", "Admin"), getInstructorCourses)

/**
 * @route   GET /api/courses/:id
 * @desc    Get a single course by ID
 * @access  Public (for published courses), Private (for instructor's own courses)
 */
router.get("/:id", getCourse)

/**
 * @route   PUT /api/courses/:id
 * @desc    Update a course
 * @access  Private (Instructor/Admin - course owner only)
 */
router.put("/:id", authorize("Instructor", "Admin"), updateCourse)

/**
 * @route   POST /api/courses/:id/draft
 * @desc    Save a course as draft
 * @access  Private (Instructor/Admin - course owner only)
 */
router.post("/:id/draft", authorize("Instructor", "Admin"), saveDraft)

/**
 * @route   POST /api/courses/:id/publish
 * @desc    Publish a course
 * @access  Private (Instructor/Admin - course owner only)
 */
router.post("/:id/publish", authorize("Instructor", "Admin"), publishCourse)

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete a course
 * @access  Private (Instructor/Admin - course owner only)
 */
router.delete("/:id", authorize("Instructor", "Admin"), deleteCourse)

module.exports = router
