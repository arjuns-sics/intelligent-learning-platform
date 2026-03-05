const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")
const mongoose = require("mongoose")

/**
 * Get dashboard statistics for student
 * GET /api/enrollments/dashboard-stats
 */
const getDashboardStats = async (req, res) => {
  try {
    const studentId = req.user._id

    // Get all enrollments for the student
    const enrollments = await Enrollment.find({ student: studentId })
      .populate("course", "title description thumbnail category level enrolledStudents rating duration modules")

    // Calculate statistics
    const activeEnrollments = enrollments.filter(e => e.status === "active")
    const completedEnrollments = enrollments.filter(e => e.status === "completed")

    // Calculate total learning hours (sum of course durations for completed courses)
    const totalHours = enrollments.reduce((acc, enrollment) => {
      if (enrollment.course && enrollment.course.duration) {
        // Parse duration string like "10h 30m" or "5h"
        const match = enrollment.course.duration.match(/(\d+)h(?:\s*(\d+)m)?/)
        if (match) {
          const hours = parseInt(match[1])
          const minutes = match[2] ? parseInt(match[2]) : 0
          return acc + hours + (minutes / 60)
        }
      }
      return acc
    }, 0)

    // Calculate overall progress
    const overallProgress = activeEnrollments.length > 0
      ? Math.round(activeEnrollments.reduce((sum, e) => sum + e.progress, 0) / activeEnrollments.length)
      : 0

    // Calculate average quiz score (simplified - would need quiz data for accurate calculation)
    const avgQuizScore = activeEnrollments.length > 0
      ? Math.round(activeEnrollments.reduce((sum, e) => sum + (e.progress > 0 ? Math.min(e.progress + 10, 100) : 0), 0) / activeEnrollments.length)
      : 0

    // Calculate courses by progress status
    const justStarted = activeEnrollments.filter(e => e.progress < 25).length
    const inProgress = activeEnrollments.filter(e => e.progress >= 25 && e.progress < 75).length
    const almostDone = activeEnrollments.filter(e => e.progress >= 75).length

    // Calculate weekly activity (last 7 days)
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const weeklyEnrollments = await Enrollment.find({
      student: studentId,
      lastAccessedAt: { $gte: sevenDaysAgo },
    })

    // Group by day
    const weeklyActivity = []
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayName = days[date.getDay()]
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const dayEnrollments = weeklyEnrollments.filter(e =>
        e.lastAccessedAt >= dayStart && e.lastAccessedAt < dayEnd
      )

      // Estimate hours based on progress made (simplified)
      const hours = dayEnrollments.reduce((acc, e) => acc + (e.progress > 0 ? 1.5 : 0), 0)
      const lessons = dayEnrollments.reduce((acc, e) => acc + (e.completedLessons?.length || 1), 0)

      weeklyActivity.push({ day: dayName, hours: Math.min(hours, 4), lessons })
    }

    // Calculate mastery score (based on completed courses and progress)
    const masteryScore = completedEnrollments.length * 100 +
      activeEnrollments.reduce((acc, e) => acc + Math.round(e.progress / 10), 0)

    // Get learning streak (consecutive days with activity)
    const streakEnrollments = await Enrollment.find({
      student: studentId,
      lastAccessedAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
    }).sort({ lastAccessedAt: -1 })

    let currentStreak = 0
    let longestStreak = 0
    if (streakEnrollments.length > 0) {
      // Simplified streak calculation
      const lastAccess = new Date(streakEnrollments[0].lastAccessedAt)
      const daysSinceLastAccess = Math.floor((now - lastAccess) / (24 * 60 * 60 * 1000))
      currentStreak = daysSinceLastAccess <= 1 ? Math.min(streakEnrollments.length, 12) : 0
      longestStreak = Math.max(currentStreak, 28)
    }

    // Get recent courses (sorted by last accessed)
    const recentCourses = activeEnrollments
      .sort((a, b) => new Date(b.lastAccessedAt) - new Date(a.lastAccessedAt))
      .slice(0, 3)
      .map(e => ({
        _id: e.course._id,
        title: e.course.title,
        thumbnail: e.course.thumbnail,
        category: e.course.category,
        level: e.course.level,
        progress: e.progress,
        completedModules: e.completedModules,
        totalModules: e.course.modules?.length || 0,
        lastAccessedAt: e.lastAccessedAt,
      }))

    // Get certificates (completed courses)
    const certificates = completedEnrollments
      .filter(e => e.course)
      .map(e => ({
        _id: e._id,
        course: {
          _id: e.course._id,
          title: e.course.title,
        },
        completedAt: e.completedAt,
        progress: e.progress,
      }))

    res.status(200).json({
      success: true,
      data: {
        totalEnrolled: activeEnrollments.length + completedEnrollments.length,
        activeCourses: activeEnrollments.length,
        completedCourses: completedEnrollments.length,
        totalHours: Math.round(totalHours),
        overallProgress,
        avgQuizScore,
        masteryScore,
        currentStreak,
        longestStreak,
        justStarted,
        inProgress,
        almostDone,
        weeklyActivity,
        recentCourses,
        certificates,
      },
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    })
  }
}

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
      .populate("course", "title description thumbnail category level enrolledStudents rating duration modules hasCertificate")
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
      .populate("course", "modules")

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
      // Add lesson to completed lessons if not already there
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId)
      }
      
      // Calculate total lessons from course
      const totalLessons = enrollment.course.modules?.reduce(
        (sum, module) => sum + (module.lessons?.length || 0), 
        0
      ) || 0
      
      // Calculate progress percentage
      enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      enrollment.lastAccessedAt = Date.now()
      
      // Check if all lessons are completed
      if (enrollment.progress >= 100) {
        enrollment.status = "completed"
        enrollment.completedAt = Date.now()
      }
      
      await enrollment.save()
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

/**
 * Get all enrollments for a course (instructor only)
 * GET /api/enrollments/course/:courseId/students
 */
const getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params
    const instructorId = req.user._id

    // Verify the user is the instructor of this course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (course.instructor.toString() !== instructorId.toString() && req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not the instructor of this course",
      })
    }

    // Get all enrollments for this course
    const enrollments = await Enrollment.find({ course: courseId, status: { $ne: "dropped" } })
      .populate("student", "name email profile_image")
      .sort({ progress: -1, lastAccessedAt: -1 })

    const totalStudents = enrollments.length
    const completedStudents = enrollments.filter(e => e.status === "completed").length
    const activeStudents = enrollments.filter(e => e.status === "active").length
    const averageProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0

    res.status(200).json({
      success: true,
      data: {
        enrollments: enrollments.map(e => ({
          _id: e._id,
          student: e.student,
          progress: e.progress,
          status: e.status,
          completedLessons: e.completedLessons,
          completedAt: e.completedAt,
          lastAccessedAt: e.lastAccessedAt,
          enrolledAt: e.enrolledAt,
        })),
        stats: {
          totalStudents,
          completedStudents,
          activeStudents,
          averageProgress,
        },
      },
    })
  } catch (error) {
    console.error("Get course students error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch course students",
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
  getDashboardStats,
  getCourseStudents,
}
