const Course = require("../models/Course")

/**
 * Browse courses with search, filter, and pagination
 * GET /api/courses/browse
 */
const browseCourses = async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      sortBy = "popular",
      page = 1,
      limit = 9,
    } = req.query

    // Build filter object
    const filter = { status: "published" }

    // Search filter (title, description, instructor name, tags)
    if (search && search.trim()) {
      const searchQuery = search.trim()
      // Use text search if available, otherwise use regex
      filter.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ]
    }

    // Category filter
    if (category && category !== "All Categories") {
      filter.category = category
    }

    // Level filter
    if (level && level !== "All Levels") {
      filter.level = level
    }

    // Build sort object
    let sortOptions = {}
    switch (sortBy) {
      case "popular":
        sortOptions = { enrolledStudents: -1 }
        break
      case "rating":
        sortOptions = { "rating.average": -1 }
        break
      case "newest":
        sortOptions = { createdAt: -1 }
        break
      default:
        sortOptions = { enrolledStudents: -1 }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Execute query
    const courses = await Course.find(filter)
      .populate("instructor", "name email profile_image")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select("-__v")

    // Get total count for pagination
    const total = await Course.countDocuments(filter)

    // Transform courses to match frontend expected format
    const transformedCourses = courses.map((course) => ({
      id: course._id,
      _id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor?.name || "Unknown Instructor",
      instructorId: course.instructor?._id,
      category: course.category,
      difficulty: course.level,
      duration: course.duration || "N/A",
      modules: course.modules?.length || 0,
      students: course.enrolledStudents || 0,
      rating: course.rating?.average || 0,
      reviews: course.rating?.count || 0,
      tags: course.learningObjectives?.slice(0, 3) || [],
      bestseller: course.enrolledStudents >= 10000,
      isNew: Date.now() - new Date(course.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000,
      lastUpdated: course.updatedAt,
      thumbnail: course.thumbnail,
      language: course.language,
      prerequisites: course.prerequisites,
      learningObjectives: course.learningObjectives,
      hasCertificate: course.hasCertificate,
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
    console.error("Browse courses error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    })
  }
}

/**
 * Get featured courses (bestsellers)
 * GET /api/courses/featured
 */
const getFeaturedCourses = async (req, res) => {
  try {
    const { limit = 3 } = req.query

    const courses = await Course.find({
      status: "published",
      enrolledStudents: { $gte: 1000 },
    })
      .populate("instructor", "name email profile_image")
      .sort({ enrolledStudents: -1 })
      .limit(parseInt(limit))
      .select("-__v")

    const transformedCourses = courses.map((course) => ({
      id: course._id,
      _id: course._id,
      title: course.title,
      description: course.description,
      instructor: course.instructor?.name || "Unknown Instructor",
      instructorId: course.instructor?._id,
      category: course.category,
      difficulty: course.level,
      duration: course.duration || "N/A",
      modules: course.modules?.length || 0,
      students: course.enrolledStudents || 0,
      rating: course.rating?.average || 0,
      reviews: course.rating?.count || 0,
      lastUpdated: course.updatedAt,
    }))

    res.status(200).json({
      success: true,
      data: transformedCourses,
    })
  } catch (error) {
    console.error("Get featured courses error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured courses",
    })
  }
}

/**
 * Get all categories with course counts
 * GET /api/courses/categories
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ])

    res.status(200).json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    })
  }
}

/**
 * Create a new course
 * POST /api/courses
 */
const createCourse = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      description,
      category,
      level,
      language,
      thumbnail,
      prerequisites,
      learningObjectives,
      modules,
      quizzes,
      assignments,
      hasCertificate,
      duration,
      maxStudents,
      published,
    } = req.body

    // Validate required fields
    if (!title || !description || !category || !level) {
      return res.status(400).json({
        success: false,
        message: "Title, description, category, and level are required",
      })
    }

    // Validate description length
    if (description.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 50 characters",
      })
    }

    // Create course object
    const courseData = {
      instructor: req.user._id,
      title,
      subtitle: subtitle || "",
      description,
      category,
      level,
      language: language || "English",
      thumbnail: thumbnail || null,
      prerequisites: prerequisites || [],
      learningObjectives: learningObjectives || [],
      modules: modules || [],
      quizzes: quizzes || [],
      assignments: assignments || [],
      hasCertificate: hasCertificate || false,
      duration: duration || "",
      maxStudents: maxStudents || null,
      published: published || false,
      status: published ? "published" : "draft",
    }

    // Create course
    const course = await Course.create(courseData)

    // Populate instructor details
    const populatedCourse = await Course.findById(course._id).populate(
      "instructor",
      "name email profile_image"
    )

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: populatedCourse,
    })
  } catch (error) {
    console.error("Create course error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to create course. Please try again.",
    })
  }
}

/**
 * Get all courses for an instructor
 * GET /api/courses/instructor/my-courses
 */
const getInstructorCourses = async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query

    const filter = { instructor: req.user._id }

    if (status) {
      filter.status = status
    }

    const courses = await Course.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .select("-__v")

    const total = await Course.countDocuments(filter)

    res.status(200).json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    })
  } catch (error) {
    console.error("Get instructor courses error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    })
  }
}

/**
 * Get a single course by ID
 * GET /api/courses/:id
 */
const getCourse = async (req, res) => {
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

    // Allow public access to published courses
    if (course.status !== "published") {
      // If course is not published, only allow instructor or admin to access
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: "Access denied. This course is not published.",
        })
      }

      if (
        course.instructor._id.toString() !== req.user._id &&
        req.user.role !== "Admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        })
      }
    }

    res.status(200).json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Get course error:", error)

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
 * Update a course
 * PUT /api/courses/:id
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Find course
    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is the instructor or admin
    if (
      course.instructor.toString() !== req.user._id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only the instructor can update this course",
      })
    }

    // Remove immutable fields from update
    delete updateData.instructor
    delete updateData._id
    delete updateData.createdAt
    delete updateData.updatedAt
    delete updateData.enrolledStudents
    delete updateData.rating

    // Update status based on published field
    if (updateData.published !== undefined) {
      updateData.status = updateData.published ? "published" : "draft"
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("instructor", "name email profile_image")

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("Update course error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to update course. Please try again.",
    })
  }
}

/**
 * Save a course as draft
 * POST /api/courses/:id/draft
 */
const saveDraft = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Find course
    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is the instructor or admin
    if (
      course.instructor.toString() !== req.user._id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Prevent saving published courses as draft
    if (course.status === "published" || course.published === true) {
      return res.status(400).json({
        success: false,
        message: "Cannot save a published course as draft. Published courses should be updated directly.",
      })
    }

    // Update course data
    const allowedFields = [
      "title",
      "subtitle",
      "description",
      "category",
      "level",
      "language",
      "thumbnail",
      "prerequisites",
      "learningObjectives",
      "modules",
      "quizzes",
      "assignments",
      "hasCertificate",
      "duration",
      "maxStudents",
    ]

    const draftData = {}
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        draftData[field] = updateData[field]
      }
    })

    draftData.published = false
    draftData.status = "draft"

    const updatedCourse = await Course.findByIdAndUpdate(id, draftData, {
      new: true,
      runValidators: true,
    }).populate("instructor", "name email profile_image")

    res.status(200).json({
      success: true,
      message: "Draft saved successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("Save draft error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to save draft",
    })
  }
}

/**
 * Publish a course
 * POST /api/courses/:id/publish
 */
const publishCourse = async (req, res) => {
  try {
    const { id } = req.params

    // Find course
    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is the instructor or admin
    if (
      course.instructor.toString() !== req.user._id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Validate course has minimum requirements
    if (course.modules.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Course must have at least one module to publish",
      })
    }

    const totalLessons = course.modules.reduce(
      (acc, module) => acc + module.lessons.length,
      0
    )

    if (totalLessons === 0) {
      return res.status(400).json({
        success: false,
        message: "Course must have at least one lesson to publish",
      })
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      {
        published: true,
        status: "published",
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("instructor", "name email profile_image")

    res.status(200).json({
      success: true,
      message: "Course published successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error("Publish course error:", error)

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message)
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      })
    }

    if (error.name === "CastError") {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    res.status(500).json({
      success: false,
      message: "Failed to publish course",
    })
  }
}

/**
 * Delete a course
 * DELETE /api/courses/:id
 */
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params

    // Find course
    const course = await Course.findById(id)

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Check if user is the instructor or admin
    if (
      course.instructor.toString() !== req.user._id &&
      req.user.role !== "Admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

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

module.exports = {
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
}
