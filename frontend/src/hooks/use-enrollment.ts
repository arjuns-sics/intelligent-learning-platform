/**
 * useEnrollment Hook
 * Provides enrollment state and methods for components
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  enrollInCourse,
  getMyEnrollments,
  checkEnrollment,
  getEnrollment,
  updateProgress,
  completeEnrollment,
  dropEnrollment,
  getDashboardStats,
  getCourseStudents,
  type GetMyEnrollmentsParams,
} from "@/services/enrollment.service"
import { ApiClientError } from "@/services/api-client"

/**
 * Get dashboard statistics for the authenticated student
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["enrollments", "dashboard-stats"],
    queryFn: () => getDashboardStats().then((res) => res.data),
  })
}

/**
 * Check if user is enrolled in a course
 */
export function useCheckEnrollment(courseId: string | null) {
  return useQuery({
    queryKey: ["enrollment", "check", courseId],
    queryFn: () => checkEnrollment(courseId!).then((res) => res.data),
    enabled: !!courseId,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Get all enrollments for the authenticated student
 */
export function useMyEnrollments(params?: GetMyEnrollmentsParams) {
  return useQuery({
    queryKey: ["enrollments", "my-courses", params],
    queryFn: () => getMyEnrollments(params).then((res) => res.data),
  })
}

/**
 * Get a single enrollment by ID
 */
export function useEnrollment(enrollmentId: string | null) {
  return useQuery({
    queryKey: ["enrollment", enrollmentId],
    queryFn: () => getEnrollment(enrollmentId!).then((res) => res.data),
    enabled: !!enrollmentId,
  })
}

/**
 * Enroll in a course mutation
 */
export function useEnrollInCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => enrollInCourse(courseId),
    onSuccess: (data, courseId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["enrollment", "check", courseId] })
      queryClient.invalidateQueries({ queryKey: ["enrollments", "my-courses"] })
      // Invalidate course detail to update enrollment count
      queryClient.invalidateQueries({ queryKey: ["course", courseId] })
    },
  })
}

/**
 * Update progress mutation
 */
export function useUpdateProgress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ enrollmentId, lessonId, moduleId }: { enrollmentId: string; lessonId: string; moduleId?: string }) =>
      updateProgress(enrollmentId, lessonId, moduleId),
    onSuccess: (data) => {
      console.log("Progress updated, invalidating queries:", data.data);
      // Invalidate enrollment queries
      queryClient.invalidateQueries({ queryKey: ["enrollments", "my-courses"] })
      queryClient.invalidateQueries({ queryKey: ["enrollment"] })
    },
  })
}

/**
 * Complete enrollment mutation
 */
export function useCompleteEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (enrollmentId: string) => completeEnrollment(enrollmentId),
    onSuccess: (data) => {
      if (data.data) {
        queryClient.invalidateQueries({ queryKey: ["enrollment", data.data._id] })
        queryClient.invalidateQueries({ queryKey: ["enrollments", "my-courses"] })
      }
    },
  })
}

/**
 * Drop enrollment mutation
 */
export function useDropEnrollment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (enrollmentId: string) => dropEnrollment(enrollmentId),
    onSuccess: (data, enrollmentId) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["enrollment", enrollmentId] })
      queryClient.invalidateQueries({ queryKey: ["enrollments", "my-courses"] })
    },
  })
}

/**
 * Get course students (instructor only)
 */
export function useCourseStudents(courseId: string | null) {
  return useQuery({
    queryKey: ["enrollments", "course", courseId, "students"],
    queryFn: () => getCourseStudents(courseId!).then((res) => res.data),
    enabled: !!courseId,
  })
}
