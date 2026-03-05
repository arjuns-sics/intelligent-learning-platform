const express = require("express")
const router = express.Router()
const {
  browseCourses,
  getFeaturedCourses,
  getCategories,
  createCourse,
  getInstructorCourses,
  getCourse,
  updateCourse,
  saveDraft,
  publishCourse,
  deleteCourse,
} = require("../controllers/courseController")
const { authenticate, authorize, optionalAuth } = require("../middleware/auth")

/**
 * @route   GET /api/courses/browse
 * @desc    Browse courses with search, filter, and pagination (public)
 * @access  Public
 */
router.get("/browse", optionalAuth, browseCourses)

/**
 * @route   GET /api/courses/featured
 * @desc    Get featured courses (bestsellers)
 * @access  Public
 */
router.get("/featured", optionalAuth, getFeaturedCourses)

/**
 * @route   GET /api/courses/categories
 * @desc    Get all categories with course counts
 * @access  Public
 */
router.get("/categories", optionalAuth, getCategories)

// All routes below require authentication
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
router.get("/:id", optionalAuth, getCourse)

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
