/**
 * Quiz & Assignment Submission Service
 * Handles quiz attempts and assignment submissions
 */

import apiClient, { type ApiResponse, tokenManager } from "./api-client";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Types
export interface QuizAttemptData {
  courseId: string;
  enrollmentId: string;
  quizId: string;
}

export interface SubmitQuizData {
  answers: {
    selectedAnswer: number | string;
  }[];
  timeSpent?: number;
}

export interface QuizAttemptResponse {
  attemptId: string;
  quiz: {
    _id: string;
    title: string;
    passingScore: number;
    timeLimit: number;
    totalQuestions: number;
  };
  attemptNumber: number;
  startedAt: string;
}

export interface SubmitQuizResponse {
  attemptId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
}

export interface QuizResultsResponse {
  attempt: {
    _id: string;
    quizTitle: string;
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    passingScore: number;
    timeSpent: number;
    attemptNumber: number;
    submittedAt: string;
  };
  results: {
    questionNumber: number;
    question: string;
    selectedAnswer: number | string;
    correctAnswer: number | string;
    isCorrect: boolean;
    options?: string[];
  }[];
  summary: {
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
  };
}

export interface AssignmentSubmissionData {
  courseId: string;
  enrollmentId: string;
  assignmentId: string;
  submission: {
    text?: string;
    links?: string[];
  };
  files?: Array<{
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
}

export interface AssignmentSubmissionResponse {
  submissionId: string;
  submittedAt: string;
  isLate: boolean;
  status: string;
}

export interface AssignmentSubmission {
  _id: string;
  assignment: {
    _id: string;
    title: string;
    description: string;
    maxScore: number;
    dueDate?: string;
  };
  submission: {
    text: string;
    files: Array<{
      name: string;
      url: string;
      size: number;
      type: string;
      uploadedAt: string;
    }>;
    links: string[];
  };
  status: "submitted" | "graded" | "resubmitted";
  grade?: {
    score: number;
    maxScore: number;
    percentage: number;
    gradedBy?: {
      _id: string;
      name: string;
      email: string;
    };
    gradedAt?: string;
    feedback: string;
  };
  submittedAt: string;
  isLate: boolean;
  resubmissionCount: number;
}

/**
 * Start a new quiz attempt
 */
export async function startQuiz(
  data: QuizAttemptData
): Promise<ApiResponse<QuizAttemptResponse>> {
  const token = tokenManager.get();
  
  const response = await fetch(`${API_BASE_URL}/quizzes/${data.quizId}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      courseId: data.courseId,
      enrollmentId: data.enrollmentId,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to start quiz");
  }

  return result;
}

/**
 * Submit quiz answers
 */
export async function submitQuiz(
  attemptId: string,
  data: SubmitQuizData
): Promise<ApiResponse<SubmitQuizResponse>> {
  const token = tokenManager.get();
  
  const response = await fetch(`${API_BASE_URL}/quizzes/attempts/${attemptId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit quiz");
  }

  return result;
}

/**
 * Get quiz attempt results
 */
export async function getQuizResults(
  attemptId: string
): Promise<ApiResponse<QuizResultsResponse>> {
  return apiClient.get<QuizResultsResponse>(`/quizzes/attempts/${attemptId}/results`);
}

/**
 * Get latest in-progress quiz attempt
 */
export async function getLatestAttempt(
  quizId: string,
  courseId: string
): Promise<ApiResponse<{
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
  answers: Array<{
    questionIndex: number;
    selectedAnswer: number | string;
    isCorrect: boolean;
  }>;
  timeSpent: number;
}>> {
  return apiClient.get(`/quizzes/${quizId}/attempts/latest?courseId=${courseId}`);
}

/**
 * Get all quiz attempts for a course
 */
export async function getCourseQuizAttempts(
  courseId: string
): Promise<ApiResponse<{
  attempts: Array<{
    quizId: string;
    quizTitle: string;
    bestScore: number;
    passed: boolean;
    attemptCount: number;
    lastAttemptAt: string;
  }>;
  totalQuizzes: number;
  passedQuizzes: number;
}>> {
  return apiClient.get(`/quizzes/course/${courseId}/attempts`);
}

/**
 * Submit an assignment
 */
export async function submitAssignment(
  data: AssignmentSubmissionData
): Promise<ApiResponse<AssignmentSubmissionResponse>> {
  const token = tokenManager.get();
  
  const response = await fetch(`${API_BASE_URL}/assignments/${data.assignmentId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify({
      courseId: data.courseId,
      enrollmentId: data.enrollmentId,
      submission: data.submission,
      files: data.files || [],
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to submit assignment");
  }

  return result;
}

/**
 * Get assignment submission details
 */
export async function getSubmission(
  submissionId: string
): Promise<ApiResponse<AssignmentSubmission>> {
  return apiClient.get<AssignmentSubmission>(`/assignments/submissions/${submissionId}`);
}

/**
 * Get all submissions for a course
 */
export async function getCourseSubmissions(
  courseId: string
): Promise<ApiResponse<{
  submissions: Array<{
    _id: string;
    assignmentId: string;
    assignmentTitle: string;
    status: string;
    grade?: {
      score: number;
      maxScore: number;
      percentage: number;
    };
    submittedAt: string;
    isLate: boolean;
  }>;
  totalSubmissions: number;
  gradedCount: number;
  pendingCount: number;
}>> {
  return apiClient.get(`/assignments/course/${courseId}/submissions`);
}
