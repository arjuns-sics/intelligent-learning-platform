const AssignmentSubmission = require("../models/AssignmentSubmission")
const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")

/**
 * Submit an assignment
 * POST /api/assignments/:assignmentId/submit
 */
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { courseId, enrollmentId, submission, files = [] } = req.body
    const studentId = req.user._id

    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      student: studentId,
      course: courseId,
      status: { $ne: "dropped" },
    })

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to submit assignments",
      })
    }

    // Get course to find the assignment
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Find the assignment in course modules
    let assignment = null
    for (const module of course.modules) {
      const foundAssignment = module.assignments?.find(
        (a) => a._id?.toString() === assignmentId || a.title === assignmentId
      )
      if (foundAssignment) {
        assignment = foundAssignment
        break
      }
    }

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found",
      })
    }

    // Check if already submitted
    const existingSubmission = await AssignmentSubmission.findOne({
      student: studentId,
      assignmentId: assignmentId,
      status: { $in: ["submitted", "graded", "resubmitted"] },
    })

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted this assignment",
      })
    }

    // Check if late
    const isLate = assignment.dueDate ? new Date() > new Date(assignment.dueDate) : false

    // Create submission
    const assignmentSubmission = await AssignmentSubmission.create({
      student: studentId,
      enrollment: enrollmentId,
      course: courseId,
      assignment: {
        _id: assignmentId,
        title: assignment.title,
        description: assignment.description,
        maxScore: assignment.maxScore || 100,
        dueDate: assignment.dueDate,
      },
      assignmentId: assignmentId,
      submission: {
        text: submission?.text || "",
        files: files,
        links: submission?.links || [],
      },
      isLate,
      status: "submitted",
    })

    res.status(201).json({
      success: true,
      message: "Assignment submitted successfully",
      data: {
        submissionId: assignmentSubmission._id,
        submittedAt: assignmentSubmission.submittedAt,
        isLate: assignmentSubmission.isLate,
        status: assignmentSubmission.status,
      },
    })
  } catch (error) {
    console.error("Submit assignment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit assignment. Please try again.",
    })
  }
}

/**
 * Get assignment submission details
 * GET /api/assignments/submissions/:submissionId
 */
const getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params
    const studentId = req.user._id

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate("student", "name email profile_image")
      .populate("course", "title")
      .populate("grade.gradedBy", "name email")

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Verify ownership or instructor access
    const isOwner = submission.student._id.toString() === studentId.toString()
    const isInstructor = req.user.role === "Instructor" || req.user.role === "Admin"

    if (!isOwner && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        _id: submission._id,
        assignment: submission.assignment,
        submission: submission.submission,
        status: submission.status,
        grade: submission.grade,
        submittedAt: submission.submittedAt,
        isLate: submission.isLate,
        resubmissionCount: submission.resubmissionCount,
        student: isOwner || isInstructor ? submission.student : undefined,
      },
    })
  } catch (error) {
    console.error("Get submission error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
    })
  }
}

/**
 * Get all submissions for a course (student view)
 * GET /api/assignments/course/:courseId/submissions
 */
const getCourseSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params
    const studentId = req.user._id

    const submissions = await AssignmentSubmission.find({
      student: studentId,
      course: courseId,
    }).sort({ submittedAt: -1 })

    res.status(200).json({
      success: true,
      data: {
        submissions: submissions.map((sub) => ({
          _id: sub._id,
          assignmentId: sub.assignmentId,
          assignmentTitle: sub.assignment?.title || "Assignment",
          status: sub.status,
          grade: sub.grade,
          submittedAt: sub.submittedAt,
          isLate: sub.isLate,
        })),
        totalSubmissions: submissions.length,
        gradedCount: submissions.filter((s) => s.status === "graded").length,
        pendingCount: submissions.filter((s) => s.status === "submitted").length,
      },
    })
  } catch (error) {
    console.error("Get course submissions error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch submissions",
    })
  }
}

/**
 * Grade an assignment (instructor only)
 * POST /api/assignments/submissions/:submissionId/grade
 */
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params
    const { score, feedback } = req.body
    const instructorId = req.user._id

    const submission = await AssignmentSubmission.findById(submissionId)
      .populate("course")

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      })
    }

    // Verify instructor access
    const course = await Course.findById(submission.course._id)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (
      course.instructor.toString() !== instructorId.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not the instructor of this course",
      })
    }

    // Grade the submission
    submission.gradeSubmission(score, feedback, instructorId)
    await submission.save()

    res.status(200).json({
      success: true,
      message: "Assignment graded successfully",
      data: {
        submissionId: submission._id,
        grade: submission.grade,
        status: submission.status,
        gradedAt: submission.grade.gradedAt,
      },
    })
  } catch (error) {
    console.error("Grade submission error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to grade assignment",
    })
  }
}

/**
 * Get all submissions for an assignment (instructor view)
 * GET /api/assignments/:assignmentId/submissions
 */
const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params
    const { courseId } = req.query
    const instructorId = req.user._id

    // Verify instructor access
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (
      course.instructor.toString() !== instructorId.toString() &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not the instructor of this course",
      })
    }

    const submissions = await AssignmentSubmission.find({
      assignmentId: assignmentId,
      course: courseId,
    })
      .populate("student", "name email profile_image")
      .populate("grade.gradedBy", "name email")
      .sort({ submittedAt: -1 })

    // Calculate statistics
    const gradedSubmissions = submissions.filter((s) => s.status === "graded")
    const averageScore =
      gradedSubmissions.length > 0
        ? Math.round(
            gradedSubmissions.reduce((sum, s) => sum + (s.grade.percentage || 0), 0) /
              gradedSubmissions.length
          )
        : 0

    res.status(200).json({
      success: true,
      data: {
        submissions: submissions.map((sub) => ({
          _id: sub._id,
          student: sub.student,
          submission: sub.submission,
          status: sub.status,
          grade: sub.grade,
          submittedAt: sub.submittedAt,
          isLate: sub.isLate,
        })),
        stats: {
          totalSubmissions: submissions.length,
          gradedCount: gradedSubmissions.length,
          pendingCount: submissions.length - gradedSubmissions.length,
          averageScore,
        },
      },
    })
  } catch (error) {
    console.error("Get assignment submissions error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch assignment submissions",
    })
  }
}

module.exports = {
  submitAssignment,
  getSubmission,
  getCourseSubmissions,
  gradeSubmission,
  getAssignmentSubmissions,
}
