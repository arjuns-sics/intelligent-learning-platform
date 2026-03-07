import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  startQuiz,
  submitQuiz,
  getQuizResults,
  getLatestAttempt,
  getCourseQuizAttempts,
  submitAssignment,
  getSubmission,
  getCourseSubmissions,
  type QuizAttemptData,
  type SubmitQuizData,
  type AssignmentSubmissionData,
} from "@/services/submission.service"

/**
 * Start a new quiz attempt
 */
export function useStartQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: QuizAttemptData) => startQuiz(data),
    onSuccess: (data, variables) => {
      // Invalidate quiz attempts query
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempts", variables.courseId],
      })
    },
  })
}

/**
 * Submit quiz answers
 */
export function useSubmitQuiz() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ attemptId, data }: { attemptId: string; data: SubmitQuizData }) =>
      submitQuiz(attemptId, data),
    onSuccess: (data, variables) => {
      // Invalidate quiz results query
      queryClient.invalidateQueries({
        queryKey: ["quiz-results", variables.attemptId],
      })
      // Invalidate course quiz attempts
      queryClient.invalidateQueries({
        queryKey: ["quiz-attempts"],
      })
    },
  })
}

/**
 * Get quiz attempt results
 */
export function useGetQuizResults(attemptId: string | null) {
  return useQuery({
    queryKey: ["quiz-results", attemptId],
    queryFn: () => getQuizResults(attemptId!),
    enabled: !!attemptId,
  })
}

/**
 * Get latest in-progress quiz attempt
 */
export function useGetLatestAttempt(quizId: string | null, courseId: string | null) {
  return useQuery({
    queryKey: ["quiz-latest-attempt", quizId, courseId],
    queryFn: () => getLatestAttempt(quizId!, courseId!),
    enabled: !!quizId && !!courseId,
  })
}

/**
 * Get all quiz attempts for a course
 */
export function useGetCourseQuizAttempts(courseId: string | null) {
  return useQuery({
    queryKey: ["quiz-attempts", courseId],
    queryFn: () => getCourseQuizAttempts(courseId!),
    enabled: !!courseId,
  })
}

/**
 * Submit an assignment
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AssignmentSubmissionData) => submitAssignment(data),
    onSuccess: (data, variables) => {
      // Invalidate submission queries
      queryClient.invalidateQueries({
        queryKey: ["assignment-submission", data],
      })
      queryClient.invalidateQueries({
        queryKey: ["assignment-submissions", variables.courseId],
      })
    },
  })
}

/**
 * Get assignment submission details
 */
export function useGetSubmission(submissionId: string | null) {
  return useQuery({
    queryKey: ["assignment-submission", submissionId],
    queryFn: () => getSubmission(submissionId!),
    enabled: !!submissionId,
  })
}

/**
 * Get all submissions for a course
 */
export function useGetCourseSubmissions(courseId: string | null) {
  return useQuery({
    queryKey: ["assignment-submissions", courseId],
    queryFn: () => getCourseSubmissions(courseId!),
    enabled: !!courseId,
  })
}
