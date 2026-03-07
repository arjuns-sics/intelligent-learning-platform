const { generateQuizzes, generateQuizForModule } = require("../services/quizGenerator");

/**
 * Generate quizzes using AI
 * POST /api/courses/generate-quizzes
 */
const generateQuizzesController = async (req, res) => {
  try {
    const {
      courseTitle,
      courseDescription,
      modules,
      learningObjectives,
      numQuizzes,
      questionsPerQuiz,
      moduleId, // Optional: generate for specific module only
    } = req.body;

    // Validate required fields
    if (!courseTitle || !courseDescription) {
      return res.status(400).json({
        success: false,
        message: "Course title and description are required",
      });
    }

    // Generate for specific module
    if (moduleId) {
      const targetModule = modules?.find((m) => m.id === moduleId);
      if (!targetModule) {
        return res.status(400).json({
          success: false,
          message: "Module not found",
        });
      }

      const result = await generateQuizForModule({
        courseTitle,
        module: targetModule,
        numQuestions: questionsPerQuiz || 5,
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          quizzes: result.quiz ? [result.quiz] : [],
        },
      });
    }

    // Generate quizzes for entire course
    const result = await generateQuizzes({
      courseTitle,
      courseDescription,
      modules,
      learningObjectives,
      numQuizzes: numQuizzes || 1,
      questionsPerQuiz: questionsPerQuiz || 5,
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Quizzes generated successfully",
      data: {
        quizzes: result.quizzes,
      },
    });
  } catch (error) {
    console.error("Generate quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate quizzes. Please try again.",
    });
  }
};

module.exports = {
  generateQuizzesController,
};
