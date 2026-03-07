const QuizAttempt = require("../models/QuizAttempt")
const Enrollment = require("../models/Enrollment")
const Course = require("../models/Course")

/**
 * Start a new quiz attempt
 * POST /api/quizzes/:quizId/start
 */
const startQuiz = async (req, res) => {
  try {
    const { quizId } = req.params
    const { courseId, enrollmentId } = req.body
    const studentId = req.user._id

    console.log("Start quiz request:", { quizId, courseId, enrollmentId })

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
        message: "You must be enrolled in this course to take the quiz",
      })
    }

    // Get course to find the quiz
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      })
    }

    // Find the quiz in course modules OR course-level quizzes
    let quiz = null
    let quizModuleId = null
    
    // Search in modules first
    for (const module of course.modules) {
      const foundQuiz = module.quizzes?.find((q) => {
        const quizIdMatch = q._id?.toString() === quizId || q._id === quizId
        const titleMatch = q.title === decodeURIComponent(quizId)
        return quizIdMatch || titleMatch
      })
      if (foundQuiz) {
        quiz = foundQuiz
        quizModuleId = module._id || module.id
        break
      }
    }
    
    // If not found in modules, search in course-level quizzes
    if (!quiz && course.quizzes) {
      const foundQuiz = course.quizzes.find((q) => {
        const quizIdMatch = q._id?.toString() === quizId || q._id === quizId
        const titleMatch = q.title === decodeURIComponent(quizId)
        return quizIdMatch || titleMatch
      })
      if (foundQuiz) {
        quiz = foundQuiz
        quizModuleId = foundQuiz.moduleId
      }
    }

    if (!quiz) {
      console.log("Quiz not found. Available quizzes:", {
        moduleQuizzes: course.modules.flatMap(m => m.quizzes || []).map(q => q.title),
        courseQuizzes: course.quizzes?.map(q => q.title) || [],
      })
      return res.status(404).json({
        success: false,
        message: "Quiz not found. Please check the quiz ID or title.",
      })
    }

    console.log("Found quiz:", quiz.title)

    // Get next attempt number
    const attemptNumber = await QuizAttempt.getNextAttemptNumber(studentId, quizId)

    // Create new quiz attempt
    const quizAttempt = await QuizAttempt.create({
      student: studentId,
      enrollment: enrollmentId,
      course: courseId,
      quiz: {
        _id: quizId,
        title: quiz.title,
        passingScore: quiz.passingScore || 70,
        timeLimit: quiz.timeLimit || 0,
        questions: quiz.questions,
      },
      quizId: quizId,
      maxScore: quiz.questions?.length || 0,
      attemptNumber,
      status: "in-progress",
    })

    res.status(201).json({
      success: true,
      message: "Quiz started successfully",
      data: {
        attemptId: quizAttempt._id,
        quiz: {
          _id: quizId,
          title: quiz.title,
          passingScore: quiz.passingScore || 70,
          timeLimit: quiz.timeLimit || 0,
          totalQuestions: quiz.questions?.length || 0,
        },
        attemptNumber,
        startedAt: quizAttempt.startedAt,
      },
    })
  } catch (error) {
    console.error("Start quiz error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to start quiz. Please try again.",
    })
  }
}

/**
 * Submit quiz answers
 * POST /api/quizzes/attempts/:attemptId/submit
 */
const submitQuiz = async (req, res) => {
  try {
    const { attemptId } = req.params
    const { answers, timeSpent } = req.body
    const studentId = req.user._id

    // Find the quiz attempt
    const attempt = await QuizAttempt.findById(attemptId)

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      })
    }

    // Verify ownership
    if (attempt.student.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Check if already submitted
    if (attempt.status !== "in-progress") {
      return res.status(400).json({
        success: false,
        message: "This quiz has already been submitted",
      })
    }

    // Validate answers
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No answers provided",
      })
    }

    // Process answers and calculate score
    const processedAnswers = answers.map((answer, index) => {
      const question = attempt.quiz.questions?.[index]
      const isCorrect = question
        ? answer.selectedAnswer === question.correctAnswer
        : false

      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
      }
    })

    attempt.answers = processedAnswers
    attempt.timeSpent = timeSpent || 0
    attempt.markAsSubmitted()

    await attempt.save()

    // Update enrollment progress if quiz passed
    if (attempt.passed) {
      const enrollment = await Enrollment.findById(attempt.enrollment)
      if (enrollment) {
        // Add quiz to completed items (you may want to track this separately)
        await enrollment.save()
      }
    }

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully",
      data: {
        attemptId: attempt._id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        passed: attempt.passed,
        passingScore: attempt.quiz?.passingScore || 70,
        totalQuestions: attempt.quiz?.questions?.length || 0,
        correctAnswers: processedAnswers.filter((a) => a.isCorrect).length,
        timeSpent: attempt.timeSpent,
      },
    })
  } catch (error) {
    console.error("Submit quiz error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to submit quiz. Please try again.",
    })
  }
}

/**
 * Get quiz attempt results
 * GET /api/quizzes/attempts/:attemptId/results
 */
const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params
    const studentId = req.user._id

    const attempt = await QuizAttempt.findById(attemptId)
      .populate("student", "name email profile_image")
      .populate("course", "title")

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      })
    }

    // Verify ownership
    if (attempt.student._id.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    // Check if submitted
    if (attempt.status === "in-progress") {
      return res.status(400).json({
        success: false,
        message: "Quiz not yet submitted",
      })
    }

    // Prepare results with question details
    const results = attempt.answers.map((answer, index) => {
      const question = attempt.quiz.questions?.[index]
      return {
        questionNumber: index + 1,
        question: question?.question || "Unknown question",
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question?.correctAnswer,
        isCorrect: answer.isCorrect,
        options: question?.options,
      }
    })

    res.status(200).json({
      success: true,
      data: {
        attempt: {
          _id: attempt._id,
          quizTitle: attempt.quiz?.title || "Quiz",
          score: attempt.score,
          maxScore: attempt.maxScore,
          percentage: attempt.percentage,
          passed: attempt.passed,
          passingScore: attempt.quiz?.passingScore || 70,
          timeSpent: attempt.timeSpent,
          attemptNumber: attempt.attemptNumber,
          submittedAt: attempt.submittedAt,
        },
        results,
        summary: {
          totalQuestions: attempt.answers.length,
          correctAnswers: attempt.answers.filter((a) => a.isCorrect).length,
          incorrectAnswers: attempt.answers.filter((a) => !a.isCorrect).length,
        },
      },
    })
  } catch (error) {
    console.error("Get quiz results error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz results",
    })
  }
}

/**
 * Get quiz attempt status (for resuming)
 * GET /api/quizzes/:quizId/attempts/latest
 */
const getLatestAttempt = async (req, res) => {
  try {
    const { quizId } = req.params
    const { courseId } = req.query
    const studentId = req.user._id

    const attempt = await QuizAttempt.findOne({
      student: studentId,
      quizId: quizId,
      course: courseId,
      status: "in-progress",
    }).sort({ createdAt: -1 })

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "No in-progress attempt found",
      })
    }

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        attemptNumber: attempt.attemptNumber,
        startedAt: attempt.startedAt,
        answers: attempt.answers,
        timeSpent: attempt.timeSpent,
      },
    })
  } catch (error) {
    console.error("Get latest attempt error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch latest attempt",
    })
  }
}

/**
 * Get all quiz attempts for a student in a course
 * GET /api/quizzes/course/:courseId/attempts
 */
const getCourseQuizAttempts = async (req, res) => {
  try {
    const { courseId } = req.params
    const studentId = req.user._id

    const attempts = await QuizAttempt.find({
      student: studentId,
      course: courseId,
    })
      .sort({ quizId: 1, attemptNumber: -1 })
      .populate("course", "title")

    // Group by quiz and get best attempt
    const quizAttempts = {}
    attempts.forEach((attempt) => {
      if (!quizAttempts[attempt.quizId] || attempt.percentage > quizAttempts[attempt.quizId].percentage) {
        quizAttempts[attempt.quizId] = attempt
      }
    })

    const bestAttempts = Object.values(quizAttempts)

    res.status(200).json({
      success: true,
      data: {
        attempts: bestAttempts.map((attempt) => ({
          quizId: attempt.quizId,
          quizTitle: attempt.quiz?.title || "Quiz",
          bestScore: attempt.percentage,
          passed: attempt.passed,
          attemptCount: attempt.attemptNumber,
          lastAttemptAt: attempt.submittedAt,
        })),
        totalQuizzes: Object.keys(quizAttempts).length,
        passedQuizzes: Object.values(quizAttempts).filter((a) => a.passed).length,
      },
    })
  } catch (error) {
    console.error("Get course quiz attempts error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz attempts",
    })
  }
}

module.exports = {
  startQuiz,
  submitQuiz,
  getQuizResults,
  getLatestAttempt,
  getCourseQuizAttempts,
}
