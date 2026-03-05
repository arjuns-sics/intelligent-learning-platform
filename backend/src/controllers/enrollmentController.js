const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")

/**
 * Enroll in a course
 * POST /api/enrollments/enroll/:courseId
 */
const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const studentId = req.user._id

    // Check if course exists
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if course is published
    if (course.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This course is not available for enrollment",
      })
    }

    // Check if student is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $ne: "dropped" },
    })

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: "You are already enrolled in this course",
      })
    }

    // Check if course has reached max students
    if (course.maxStudents && course.enrolledStudents >= course.maxStudents) {
      return res.status(400).json({
        success: false,
        message: "This course has reached maximum enrollment capacity",
      })
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      status: "active",
      progress: 0,
    })

    // Increment enrolled students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 },
    })

    // Populate enrollment with course and student details
    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student", "name email profile_image")
      .populate("course", "title description thumbnail category level")

    // Convert to plain object to avoid virtual issues
    const enrollmentData = populatedEnrollment.toObject({ virtuals: false })
    enrollmentData.course = populatedEnrollment.course.toObject({ virtuals: false })

    res.status(201).json({
      success: true,
      message: "Successfully enrolled in the course",
      data: enrollmentData,
    })
  } catch (error) {
    console.error("Enroll in course error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to enroll in course. Please try again.",
    })
  }
}

/**
 * Get all enrollments for the authenticated student
 * GET /api/enrollments/my-courses
 */
const getMyEnrollments = async (req, res) => {
  try {
    const studentId = req.user._id
    const { status, page = 1, limit = 10 } = req.query

    // Build filter
    const filter = { student: studentId }
    if (status) {
      filter.status = status
    }

    // Get enrollments with pagination
    const enrollments = await Enrollment.find(filter)
      .populate("course", "title description thumbnail category level enrolledStudents rating duration")
      .sort({ enrolledAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))

    // Get total count
    const total = await Enrollment.countDocuments(filter)

    // Transform enrollments
    const transformedEnrollments = enrollments.map((enrollment) => ({
      _id: enrollment._id,
      course: enrollment.course.toObject({ virtuals: false }),
      progress: enrollment.progress,
      status: enrollment.status,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      completedLessons: enrollment.completedLessons,
      completedModules: enrollment.completedModules,
    }))

    res.status(200).json({
      success: true,
      data: {
        enrollments: transformedEnrollments,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    })
  } catch (error) {
    console.error("Get my enrollments error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollments",
    })
  }
}

/**
 * Get a single enrollment by enrollment ID
 * GET /api/enrollments/:enrollmentId
 */
const getEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params
    const studentId = req.user._id

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("student", "name email profile_image")
      .populate("course")

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      })
    }

    // Check if the enrollment belongs to the authenticated user
    if (enrollment.student._id.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    })
  } catch (error) {
    console.error("Get enrollment error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch enrollment",
    })
  }
}

/**
 * Check if user is enrolled in a course
 * GET /api/enrollments/check/:courseId
 */
const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params
    const studentId = req.user._id

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $ne: "dropped" },
    }).populate("course", "title description thumbnail category level enrolledStudents rating duration")

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        data: {
          isEnrolled: false,
          enrollment: null,
        },
      })
    }

    // Convert to plain object to avoid virtual issues
    const courseObj = enrollment.course.toObject({ virtuals: false })

    res.status(200).json({
      success: true,
      data: {
        isEnrolled: true,
        enrollment: {
          _id: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt,
          course: courseObj,
        },
      },
    })
  } catch (error) {
    console.error("Check enrollment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to check enrollment status",
    })
  }
}

/**
 * Update enrollment progress
 * PUT /api/enrollments/:enrollmentId/progress
 */
const updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params
    const { lessonId, moduleId } = req.body
    const studentId = req.user._id

    const enrollment = await Enrollment.findById(enrollmentId)

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      })
    }

    // Check if the enrollment belongs to the authenticated user
    if (enrollment.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Check if enrollment is active
    if (enrollment.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot update progress for non-active enrollments",
      })
    }

    // Update progress
    if (lessonId) {
      await enrollment.updateProgress(lessonId, moduleId)
    }

    res.status(200).json({
      success: true,
      message: "Progress updated successfully",
      data: enrollment,
    })
  } catch (error) {
    console.error("Update progress error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update progress",
    })
  }
}

/**
 * Drop a course enrollment
 * DELETE /api/enrollments/:enrollmentId
 */
const dropEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params
    const studentId = req.user._id

    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("course")

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      })
    }

    // Check if the enrollment belongs to the authenticated user
    if (enrollment.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Drop the enrollment
    await enrollment.drop()

    // Decrement enrolled students count
    await Course.findByIdAndUpdate(enrollment.course._id, {
      $inc: { enrolledStudents: -1 },
    })

    res.status(200).json({
      success: true,
      message: "Successfully dropped the course",
      data: enrollment,
    })
  } catch (error) {
    console.error("Drop enrollment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to drop enrollment",
    })
  }
}

/**
 * Complete an enrollment
 * POST /api/enrollments/:enrollmentId/complete
 */
const completeEnrollment = async (req, res) => {
  try {
    const { enrollmentId } = req.params
    const studentId = req.user._id

    const enrollment = await Enrollment.findById(enrollmentId)

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      })
    }

    // Check if the enrollment belongs to the authenticated user
    if (enrollment.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Mark as completed
    await enrollment.markAsCompleted()

    res.status(200).json({
      success: true,
      message: "Course completed successfully",
      data: enrollment,
    })
  } catch (error) {
    console.error("Complete enrollment error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to complete enrollment",
    })
  }
}

module.exports = {
  enrollInCourse,
  getMyEnrollments,
  getEnrollment,
  checkEnrollment,
  updateProgress,
  dropEnrollment,
  completeEnrollment,
}
