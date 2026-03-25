const User = require("../models/User")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")

// ==================== USER MANAGEMENT ====================

/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, sortBy = "createdAt", order = "desc" } = req.query

    // Build filter object
    const filter = {}

    // Search filter (name or email)
    if (search && search.trim()) {
      const searchQuery = search.trim()
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ]
    }

    // Role filter
    if (role && role !== "All") {
      filter.role = role
    }

    // Build sort object
    const sortOptions = {
      [sortBy]: order === "asc" ? 1 : -1,
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Execute query
    const users = await User.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select("-password_hash")

    // Get total count
    const total = await User.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    })
  } catch (error) {
    console.error("Get all users error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    })
  }
}

/**
 * Get single user by ID
 * GET /api/admin/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id).select("-password_hash")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get user by ID error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    })
  }
}

/**
 * Update user role
 * PUT /api/admin/users/:id/role
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params
    const { role } = req.body

    // Validate role
    if (!role || !["Student", "Instructor", "Admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be Student, Instructor, or Admin",
      })
    }

    const user = await User.findByIdAndUpdate(
      id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select("-password_hash")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    })
  } catch (error) {
    console.error("Update user role error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to update user role",
    })
  }
}

/**
 * Delete user
 * DELETE /api/admin/users/:id
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params

    // Prevent deleting admin accounts
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    if (user.role === "Admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot delete admin accounts",
      })
    }

    // Delete user enrollments first
    await Enrollment.deleteMany({ student: id })

    // Delete user
    await User.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete user",
    })
  }
}

// ==================== COURSE MANAGEMENT ====================

/**
 * Get all courses with filtering and pagination
 * GET /api/admin/courses
 */
const getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, category, sortBy = "createdAt", order = "desc" } = req.query

    // Build filter object
    const filter = {}

    // Search filter (title, description, or instructor name)
    if (search && search.trim()) {
      const searchQuery = search.trim()
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ]
    }

    // Status filter
    if (status && status !== "All") {
      filter.status = status
    }

    // Category filter
    if (category && category !== "All") {
      filter.category = category
    }

    // Build sort object
    const sortOptions = {
      [sortBy]: order === "asc" ? 1 : -1,
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Execute query
    const courses = await Course.find(filter)
      .populate("instructor", "name email profile_image")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)

    // Get total count
    const total = await Course.countDocuments(filter)

    // Transform courses
    const transformedCourses = courses.map((course) => ({
      id: course._id,
      _id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor?.name || "Unknown Instructor",
      instructorId: course.instructor?._id,
      category: course.category,
      level: course.level,
      status: course.status,
      published: course.published,
      enrolledStudents: course.enrolledStudents || 0,
      rating: course.rating?.average || 0,
      modules: course.modules?.length || 0,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    }))

    res.status(200).json({
      success: true,
      data: {
        courses: transformedCourses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    })
  } catch (error) {
    console.error("Get all courses error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    })
  }
}

/**
 * Get course by ID
 * GET /api/admin/courses/:id
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params

    const course = await Course.findById(id).populate(
      "instructor",
      "name email profile_image"
    )

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Get course by ID error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    })
  }
}

/**
 * Update course status (publish/unpublish)
 * PUT /api/admin/courses/:id/status
 */
const updateCourseStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, published } = req.body

    const updateData = {}

    if (status !== undefined) {
      updateData.status = status
      updateData.published = status === "published"
    }

    if (published !== undefined) {
      updateData.published = published
      updateData.status = published ? "published" : "draft"
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("instructor", "name email profile_image")

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(200).json({
      success: true,
      message: "Course status updated successfully",
      data: course,
    })
  } catch (error) {
    console.error("Update course status error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to update course status",
    })
  }
}

/**
 * Delete course
 * DELETE /api/admin/courses/:id
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params

    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Delete course enrollments
    await Enrollment.deleteMany({ course: id })

    // Delete course
    await Course.findByIdAndDelete(id)

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("Delete course error:", error)

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    })
  }
}

/**
 * Get dashboard statistics
 * GET /api/admin/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments()
    const totalCourses = await Course.countDocuments()
    const publishedCourses = await Course.countDocuments({ status: "published" })
    const draftCourses = await Course.countDocuments({ status: "draft" })

    // Get user counts by role
    const studentCount = await User.countDocuments({ role: "Student" })
    const instructorCount = await User.countDocuments({ role: "Instructor" })
    const adminCount = await User.countDocuments({ role: "Admin" })

    // Get total enrollments
    const totalEnrollments = await Enrollment.countDocuments()

    // Get recent courses
    const recentCourses = await Course.find()
      .populate("instructor", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status enrolledStudents createdAt")

    // Get top courses by enrollment
    const topCourses = await Course.find({ status: "published" })
      .sort({ enrolledStudents: -1 })
      .limit(5)
      .select("title enrolledStudents rating")

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCourses,
          publishedCourses,
          draftCourses,
          totalEnrollments,
        },
        usersByRole: {
          students: studentCount,
          instructors: instructorCount,
          admins: adminCount,
        },
        recentCourses,
        topCourses,
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

module.exports = {
  // User management
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  // Course management
  getAllCourses,
  getCourseById,
  updateCourseStatus,
  deleteCourse,
  // Dashboard
  getDashboardStats,
}
