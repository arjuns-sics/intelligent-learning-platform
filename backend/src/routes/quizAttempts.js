const express = require("express")
const router = express.Router()
const {
  startQuiz,
  submitQuiz,
  getQuizResults,
  getLatestAttempt,
  getCourseQuizAttempts,
} = require("../controllers/quizAttemptController")
const {
  submitAssignment,
  getSubmission,
  getCourseSubmissions,
  gradeSubmission,
  getAssignmentSubmissions,
} = require("../controllers/assignmentSubmissionController")
const { authenticate, authorize } = require("../middleware/auth")

// All routes require authentication
router.use(authenticate)

/**
 * Quiz Routes
 */

/**
 * @route   POST /api/quizzes/:quizId/start
 * @desc    Start a new quiz attempt
 * @access  Private (Student)
 */
router.post("/:quizId/start", authorize("Student", "Admin"), startQuiz)

/**
 * @route   POST /api/quizzes/attempts/:attemptId/submit
 * @desc    Submit quiz answers
 * @access  Private (Student)
 */
router.post("/attempts/:attemptId/submit", authorize("Student", "Admin"), submitQuiz)

/**
 * @route   GET /api/quizzes/attempts/:attemptId/results
 * @desc    Get quiz attempt results
 * @access  Private (Student)
 */
router.get("/attempts/:attemptId/results", authorize("Student", "Admin"), getQuizResults)

/**
 * @route   GET /api/quizzes/:quizId/attempts/latest
 * @desc    Get latest in-progress quiz attempt
 * @access  Private (Student)
 */
router.get("/:quizId/attempts/latest", authorize("Student", "Admin"), getLatestAttempt)

/**
 * @route   GET /api/quizzes/course/:courseId/attempts
 * @desc    Get all quiz attempts for a course
 * @access  Private (Student)
 */
router.get("/course/:courseId/attempts", authorize("Student", "Admin"), getCourseQuizAttempts)

/**
 * Assignment Routes
 */

/**
 * @route   POST /api/assignments/:assignmentId/submit
 * @desc    Submit an assignment
 * @access  Private (Student)
 */
router.post("/:assignmentId/submit", authorize("Student", "Admin"), submitAssignment)

/**
 * @route   GET /api/assignments/submissions/:submissionId
 * @desc    Get assignment submission details
 * @access  Private (Student)
 */
router.get("/submissions/:submissionId", authorize("Student", "Admin"), getSubmission)

/**
 * @route   GET /api/assignments/course/:courseId/submissions
 * @desc    Get all submissions for a course (student view)
 * @access  Private (Student)
 */
router.get("/course/:courseId/submissions", authorize("Student", "Admin"), getCourseSubmissions)

/**
 * @route   POST /api/assignments/submissions/:submissionId/grade
 * @desc    Grade an assignment (instructor only)
 * @access  Private (Instructor/Admin)
 */
router.post("/submissions/:submissionId/grade", authorize("Instructor", "Admin"), gradeSubmission)

/**
 * @route   GET /api/assignments/:assignmentId/submissions
 * @desc    Get all submissions for an assignment (instructor view)
 * @access  Private (Instructor/Admin)
 */
router.get("/:assignmentId/submissions", authorize("Instructor", "Admin"), getAssignmentSubmissions)

module.exports = router
