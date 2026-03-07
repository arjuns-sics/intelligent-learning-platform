const { generateObject } = require("ai");
const { createOpenRouter } = require("@openrouter/ai-sdk-provider");
const { z } = require("zod");
const {
  processLessonTranscripts,
  buildTranscriptContext,
  extractKeyConcepts,
} = require("./transcriptService");

/**
 * Quiz Generator Service
 * Uses Vercel AI SDK with OpenRouter to generate quizzes from course content
 * Enhanced with YouTube transcript integration for video content awareness
 */

// Initialize OpenRouter provider
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  // baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
});

// Define the schema for quiz generation
const quizSchema = z.object({
  quizzes: z.array(
    z.object({
      title: z.string().describe("Quiz title"),
      moduleId: z.string().nullable().describe("Associated module ID or null"),
      timeLimit: z.number().describe("Time limit in minutes"),
      passingScore: z.number().min(0).max(100).describe("Passing score percentage"),
      questions: z.array(
        z.object({
          question: z.string().describe("The question text"),
          type: z.enum(["multiple-choice", "true-false"]).describe("Question type"),
          options: z.array(z.string()).describe("Answer options (for multiple-choice)"),
          correctAnswer: z.number().describe("Index of the correct answer (0-based)"),
          points: z.number().min(1).describe("Points for this question"),
        })
      ),
    })
  ),
});

/**
 * Generate quizzes based on course content
 * @param {Object} params - Generation parameters
 * @param {string} params.courseTitle - Course title
 * @param {string} params.courseDescription - Course description
 * @param {Array} params.modules - Course modules with lessons
 * @param {Array} params.learningObjectives - Course learning objectives
 * @param {number} params.numQuizzes - Number of quizzes to generate
 * @param {number} params.questionsPerQuiz - Questions per quiz
 * @returns {Promise<Object>} Generated quizzes
 */
async function generateQuizzes({
  courseTitle,
  courseDescription,
  modules = [],
  learningObjectives = [],
  numQuizzes = 1,
  questionsPerQuiz = 5,
  includeTranscripts = true, // New option to enable transcript fetching
}) {
  try {
    // Collect all lessons from modules
    const allLessons = modules.flatMap((module) =>
      module.lessons?.map((lesson) => ({
        ...lesson,
        moduleId: module.id,
        moduleTitle: module.title,
      })) || []
    );

    // Fetch and process video transcripts
    let transcriptContext = "";
    let keyConcepts = [];
    let transcriptMetadata = {
      totalVideos: 0,
      processedVideos: 0,
      skippedVideos: 0,
    };

    if (includeTranscripts) {
      console.log("Processing video transcripts for quiz generation...");
      const processedTranscripts = await processLessonTranscripts(allLessons);
      transcriptContext = buildTranscriptContext(processedTranscripts);
      keyConcepts = await extractKeyConcepts(processedTranscripts);

      transcriptMetadata = {
        totalVideos: processedTranscripts.length,
        processedVideos: processedTranscripts.filter((t) => !t.skipped).length,
        skippedVideos: processedTranscripts.filter((t) => t.skipped).length,
      };

      console.log(
        `Transcript processing complete: ${transcriptMetadata.processedVideos}/${transcriptMetadata.totalVideos} videos processed`
      );
    }

    // Build context from course content
    const modulesContext = modules
      .map(
        (module, index) => `
Module ${index + 1}: ${module.title}
${module.description || ""}
Lessons:
${module.lessons?.map((lesson, i) => `  ${i + 1}. ${lesson.title} - ${lesson.type}`).join("\n") || "No lessons"}
        `
      )
      .join("\n\n");

    const learningObjectivesContext = learningObjectives
      .map((obj, index) => `${index + 1}. ${obj}`)
      .join("\n");

    // Build enhanced prompt with transcript context
    const transcriptNote = includeTranscripts
      ? `\n\nVIDEO CONTENT:\n${transcriptContext}\n\nKEY CONCEPTS FROM VIDEOS:\n${keyConcepts.length > 0 ? keyConcepts.map((c, i) => `${i + 1}. ${c}`).join("\n") : "No key concepts extracted."}`
      : "";

    // Create the prompt
    const prompt = `You are an expert educational content creator. Generate a comprehensive quiz based on the following course content.

COURSE TITLE: ${courseTitle}

COURSE DESCRIPTION:
${courseDescription}

LEARNING OBJECTIVES:
${learningObjectivesContext}

COURSE STRUCTURE:
${modulesContext}${transcriptNote}

INSTRUCTIONS:
- Generate ${numQuizzes} quiz(es) with ${questionsPerQuiz} questions each
- Create a mix of multiple-choice (70%) and true/false (30%) questions
- Questions should test understanding of key concepts from the course content AND video transcripts
- For multiple-choice questions, provide 4 options with one correct answer
- For true/false questions, provide ["True", "False"] as options
- Ensure questions are clear, unambiguous, and educationally valuable
- Distribute questions across different modules/topics
- Prioritize important concepts mentioned in video transcripts
- Set appropriate time limits (assume ~1 minute per question)
- Set a reasonable passing score (70-80%)

Generate the quiz in the exact JSON schema provided.`;

    // Generate using OpenRouter's free model
    const result = await generateObject({
      model: openrouter("openrouter/free"),
      schema: quizSchema,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Process and assign IDs to generated quizzes
    const generatedQuizzes = result.object.quizzes.map((quiz, quizIndex) => ({
      ...quiz,
      // Assign to modules if available
      moduleId: modules[quizIndex % modules.length]?.id || null,
      questions: quiz.questions.map((question, qIndex) => ({
        ...question,
        // Generate a unique ID
        id: `q_${Date.now()}_${quizIndex}_${qIndex}`,
      })),
    }));

    return {
      success: true,
      quizzes: generatedQuizzes,
      metadata: {
        transcriptsUsed: includeTranscripts,
        ...transcriptMetadata,
      },
    };
  } catch (error) {
    console.error("Quiz generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate quizzes",
    };
  }
}

/**
 * Generate a single quiz for a specific module
 * @param {Object} params - Generation parameters
 * @param {string} params.courseTitle - Course title
 * @param {Object} params.module - Specific module
 * @param {number} params.numQuestions - Number of questions
 * @param {boolean} params.includeTranscripts - Whether to include video transcripts
 * @returns {Promise<Object>} Generated quiz
 */
async function generateQuizForModule({
  courseTitle,
  module,
  numQuestions = 5,
  includeTranscripts = true,
}) {
  try {
    // Fetch and process video transcripts for this module
    let transcriptContext = "";
    let keyConcepts = [];

    if (includeTranscripts && module.lessons?.length > 0) {
      console.log(`Processing transcripts for module: ${module.title}`);
      const processedTranscripts = await processLessonTranscripts(module.lessons);
      transcriptContext = buildTranscriptContext(processedTranscripts);
      keyConcepts = await extractKeyConcepts(processedTranscripts);
    }

    const lessonsContext = module.lessons
      ?.map((lesson, index) => `${index + 1}. ${lesson.title} (${lesson.type})`)
      .join("\n") || "No lessons";

    const transcriptNote = includeTranscripts && transcriptContext
      ? `\n\n${transcriptContext}\n\nKEY CONCEPTS FROM VIDEOS:\n${keyConcepts.length > 0 ? keyConcepts.map((c, i) => `${i + 1}. ${c}`).join("\n") : "No key concepts extracted."}`
      : "";

    const prompt = `You are an expert educational content creator. Generate a quiz for the following module.

COURSE: ${courseTitle}

MODULE: ${module.title}
${module.description || ""}

LESSONS:
${lessonsContext}${transcriptNote}

INSTRUCTIONS:
- Generate ${numQuestions} questions
- Use a mix of multiple-choice (70%) and true/false (30%) questions
- Questions should test understanding of the module content AND video transcripts
- For multiple-choice: provide 4 options with one correct answer
- For true/false: provide ["True", "False"] as options
- Prioritize important concepts from video transcripts
- Set time limit to ${numQuestions} minutes
- Set passing score to 75%

Generate the quiz in the exact JSON schema provided.`;

    const result = await generateObject({
      model: openrouter("openrouter/free"),
      schema: quizSchema,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 3000,
    });

    const generatedQuiz = result.object.quizzes[0];
    if (generatedQuiz) {
      generatedQuiz.moduleId = module.id || null;
      generatedQuiz.questions = generatedQuiz.questions.map((q, i) => ({
        ...q,
        id: `q_${Date.now()}_${i}`,
      }));
    }

    return {
      success: true,
      quiz: generatedQuiz || null,
      metadata: {
        transcriptsUsed: includeTranscripts,
      },
    };
  } catch (error) {
    console.error("Module quiz generation error:", error);
    return {
      success: false,
      error: error.message || "Failed to generate quiz",
    };
  }
}

module.exports = {
  generateQuizzes,
  generateQuizForModule,
};
