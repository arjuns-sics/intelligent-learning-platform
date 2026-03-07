const { YoutubeTranscript } = require("youtube-transcript");
const { generateText } = require("ai");
const { createOpenRouter } = require("@openrouter/ai-sdk-provider");

/**
 * Transcript Service
 * Fetches and processes YouTube video transcripts for AI quiz generation
 * Handles context limits by intelligently summarizing long transcripts
 */

// Initialize OpenRouter provider
const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
});

// Constants for context management
const MAX_TRANSCRIPT_LENGTH = 15000; // Max characters per transcript to avoid context exhaustion
const MAX_TOTAL_TRANSCRIPT_LENGTH = 40000; // Max total characters for all transcripts
const SUMMARY_TARGET_LENGTH = 3000; // Target length for summarized transcripts

/**
 * Extract YouTube video ID from URL
 * @param {string} url - YouTube video URL
 * @returns {string|null} Video ID or null if invalid
 */
function extractVideoId(url) {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

/**
 * Fetch transcript from YouTube video
 * @param {string} videoUrl - YouTube video URL
 * @returns {Promise<{success: boolean, transcript?: string, error?: string}>}
 */
async function fetchVideoTranscript(videoUrl) {
  try {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return {
        success: false,
        error: "Invalid YouTube URL",
      };
    }

    // Fetch transcript
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcriptItems || transcriptItems.length === 0) {
      return {
        success: false,
        error: "No transcript available for this video",
      };
    }

    // Combine transcript text
    const fullTranscript = transcriptItems
      .map((item) => item.text)
      .join(" ")
      .trim();

    return {
      success: true,
      transcript: fullTranscript,
      duration: transcriptItems.length, // Approximate duration in 10s intervals
    };
  } catch (error) {
    console.error("Transcript fetch error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch transcript",
    };
  }
}

/**
 * Summarize long transcript to fit context limits
 * @param {string} transcript - Full transcript text
 * @param {number} targetLength - Target length in characters
 * @returns {Promise<string>} Summarized transcript
 */
async function summarizeTranscript(transcript, targetLength = SUMMARY_TARGET_LENGTH) {
  try {
    const prompt = `Summarize the following video transcript, focusing on key concepts, main points, and important educational content. Create a concise summary that captures the essence of the video while preserving important details that would be useful for creating quiz questions.

Target length: approximately ${targetLength / 10} words

TRANSCRIPT:
${transcript}

Provide a well-structured summary that highlights:
1. Main topics covered
2. Key concepts and definitions
3. Important facts and details
4. Any conclusions or key takeaways`;

    const result = await generateText({
      model: openrouter("openrouter/free"),
      prompt: prompt,
      temperature: 0.5,
      maxTokens: Math.min(targetLength / 4, 1000),
    });

    return result.text;
  } catch (error) {
    console.error("Transcript summarization error:", error);
    // Fallback: truncate if summarization fails
    return transcript.slice(0, targetLength) + "...";
  }
}

/**
 * Process transcripts from multiple lessons, handling context limits
 * @param {Array} lessons - Array of lesson objects with videoUrl
 * @returns {Promise<Array>} Processed transcripts with metadata
 */
async function processLessonTranscripts(lessons = []) {
  const videoLessons = lessons.filter(
    (lesson) => lesson.type === "video" && lesson.videoUrl
  );

  if (videoLessons.length === 0) {
    return [];
  }

  const results = [];
  let totalCharacters = 0;

  for (const lesson of videoLessons) {
    // Check if we've hit the total context limit
    if (totalCharacters >= MAX_TOTAL_TRANSCRIPT_LENGTH) {
      console.log("Context limit reached, skipping remaining videos");
      results.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        transcript: null,
        skipped: true,
        reason: "Context limit reached",
      });
      continue;
    }

    // Fetch transcript
    const fetchResult = await fetchVideoTranscript(lesson.videoUrl);

    if (!fetchResult.success) {
      results.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        transcript: null,
        skipped: true,
        reason: fetchResult.error,
      });
      continue;
    }

    let transcript = fetchResult.transcript;

    // Check if transcript needs summarization
    if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
      console.log(
        `Summarizing long transcript (${transcript.length} chars) for: ${lesson.title}`
      );
      transcript = await summarizeTranscript(transcript);
    }

    totalCharacters += transcript.length;

    results.push({
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      transcript: transcript,
      skipped: false,
      originalLength: fetchResult.transcript.length,
      processedLength: transcript.length,
    });
  }

  return results;
}

/**
 * Build context string from processed transcripts for quiz generation
 * @param {Array} processedTranscripts - Output from processLessonTranscripts
 * @returns {string} Formatted context string
 */
function buildTranscriptContext(processedTranscripts) {
  const validTranscripts = processedTranscripts.filter(
    (t) => !t.skipped && t.transcript
  );

  if (validTranscripts.length === 0) {
    return "No video transcripts available.";
  }

  const context = validTranscripts
    .map((t, index) => {
      const truncatedTitle =
        t.lessonTitle.length > 50 ? t.lessonTitle.slice(0, 50) + "..." : t.lessonTitle;
      return `
[Video ${index + 1}: ${truncatedTitle}]
${t.transcript}
---`;
    })
    .join("\n\n");

  const skippedCount = processedTranscripts.filter((t) => t.skipped).length;
  const note =
    skippedCount > 0
      ? `\n\n[Note: ${skippedCount} video(s) could not be included due to context limits or unavailable transcripts]`
      : "";

  return `VIDEO TRANSCRIPTS:\n\n${context}${note}`;
}

/**
 * Extract key concepts from transcripts for quiz generation
 * @param {Array} processedTranscripts - Output from processLessonTranscripts
 * @returns {Promise<string[]>} Array of key concepts
 */
async function extractKeyConcepts(processedTranscripts) {
  const validTranscripts = processedTranscripts.filter(
    (t) => !t.skipped && t.transcript
  );

  if (validTranscripts.length === 0) {
    return [];
  }

  try {
    const combinedTranscripts = validTranscripts
      .map((t) => t.transcript)
      .join("\n\n");

    const prompt = `Extract the key concepts, important facts, and quiz-worthy points from the following video transcripts. List them as bullet points, focusing on information that would make good quiz questions.

TRANSCRIPTS:
${combinedTranscripts.slice(0, MAX_TOTAL_TRANSCRIPT_LENGTH)}

Provide a list of 10-20 key points that students should understand after watching these videos.`;

    const result = await generateText({
      model: openrouter("openrouter/free"),
      prompt: prompt,
      temperature: 0.5,
      maxTokens: 1000,
    });

    // Parse bullet points from result
    const concepts = result.text
      .split("\n")
      .filter((line) => line.trim().match(/^[-•*]\s*(.+)/) || line.trim().match(/^\d+\.\s*(.+)/))
      .map((line) => line.replace(/^[-•*]\s*|\d+\.\s*/, "").trim())
      .filter((line) => line.length > 0)
      .slice(0, 20); // Limit to 20 concepts

    return concepts;
  } catch (error) {
    console.error("Key concepts extraction error:", error);
    return [];
  }
}

module.exports = {
  fetchVideoTranscript,
  processLessonTranscripts,
  buildTranscriptContext,
  extractKeyConcepts,
  extractVideoId,
  MAX_TRANSCRIPT_LENGTH,
  MAX_TOTAL_TRANSCRIPT_LENGTH,
};
