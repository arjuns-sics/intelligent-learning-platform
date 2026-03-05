/**
 * Enrollment Service
 * Handles all enrollment-related API calls
 */

import apiClient, { type ApiResponse } from "./api-client";

// Types
export interface Enrollment {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    profile_image: string | null;
  };
  course: {
    _id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    category: string;
    level: string;
    enrolledStudents?: number;
    rating?: {
      average: number;
      count: number;
    };
    duration?: string;
  };
  status: "active" | "completed" | "dropped";
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  lastAccessedAt: string;
  completedLessons: string[];
  completedModules: string[];
}

export interface EnrollmentCheckResponse {
  isEnrolled: boolean;
  enrollment: {
    _id: string;
    status: string;
    progress: number;
    enrolledAt: string;
    course: {
      _id: string;
      title: string;
      description: string;
      thumbnail: string | null;
    };
  } | null;
}

export interface EnrollmentsResponse {
  enrollments: Enrollment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CourseStudentsResponse {
  enrollments: {
    _id: string;
    student: {
      _id: string;
      name: string;
      email: string;
      profile_image: string | null;
    };
    progress: number;
    status: string;
    completedLessons: string[];
    completedAt: string | null;
    lastAccessedAt: string;
    enrolledAt: string;
  }[];
  stats: {
    totalStudents: number;
    completedStudents: number;
    activeStudents: number;
    averageProgress: number;
  };
}

export interface DashboardStats {
  totalEnrolled: number;
  activeCourses: number;
  completedCourses: number;
  totalHours: number;
  overallProgress: number;
  avgQuizScore: number;
  masteryScore: number;
  currentStreak: number;
  longestStreak: number;
  justStarted: number;
  inProgress: number;
  almostDone: number;
  weeklyActivity: {
    day: string;
    hours: number;
    lessons: number;
  }[];
  recentCourses: {
    _id: string;
    title: string;
    thumbnail: string | null;
    category: string;
    level: string;
    progress: number;
    completedModules: string[];
    totalModules: number;
    lastAccessedAt: string;
  }[];
  certificates: {
    _id: string;
    course: {
      _id: string;
      title: string;
    };
    completedAt: string;
    progress: number;
  }[];
}

export interface GetMyEnrollmentsParams {
  status?: "active" | "completed" | "dropped";
  page?: number;
  limit?: number;
}

/**
 * Enroll in a course
 */
export async function enrollInCourse(
  courseId: string
): Promise<ApiResponse<Enrollment>> {
  return apiClient.post<Enrollment>(`/enrollments/enroll/${courseId}`, null);
}

/**
 * Get dashboard statistics for the authenticated student
 */
export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
  return apiClient.get<DashboardStats>("/enrollments/dashboard-stats");
}

/**
 * Get all enrollments for the authenticated student
 */
export async function getMyEnrollments(
  params?: GetMyEnrollmentsParams
): Promise<ApiResponse<EnrollmentsResponse>> {
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append("status", params.status);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/enrollments/my-courses${queryString ? `?${queryString}` : ""}`;

  return apiClient.get<EnrollmentsResponse>(endpoint);
}

/**
 * Check if user is enrolled in a course
 */
export async function checkEnrollment(
  courseId: string
): Promise<ApiResponse<EnrollmentCheckResponse>> {
  return apiClient.get<EnrollmentCheckResponse>(`/enrollments/check/${courseId}`);
}

/**
 * Get a single enrollment by ID
 */
export async function getEnrollment(
  enrollmentId: string
): Promise<ApiResponse<Enrollment>> {
  return apiClient.get<Enrollment>(`/enrollments/${enrollmentId}`);
}

/**
 * Update enrollment progress
 */
export async function updateProgress(
  enrollmentId: string,
  lessonId: string,
  moduleId?: string
): Promise<ApiResponse<Enrollment>> {
  return apiClient.put<Enrollment>(`/enrollments/${enrollmentId}/progress`, {
    lessonId,
    moduleId,
  });
}

/**
 * Mark an enrollment as completed
 */
export async function completeEnrollment(
  enrollmentId: string
): Promise<ApiResponse<Enrollment>> {
  return apiClient.post<Enrollment>(`/enrollments/${enrollmentId}/complete`, null);
}

/**
 * Drop a course enrollment
 */
export async function dropEnrollment(
  enrollmentId: string
): Promise<ApiResponse<Enrollment>> {
  return apiClient.delete<Enrollment>(`/enrollments/${enrollmentId}`);
}

/**
 * Get all students enrolled in a course (instructor only)
 */
export async function getCourseStudents(
  courseId: string
): Promise<ApiResponse<CourseStudentsResponse>> {
  return apiClient.get<CourseStudentsResponse>(`/enrollments/course/${courseId}/students`);
}

// Export types for use in components
export type {
  Enrollment,
  EnrollmentCheckResponse,
  EnrollmentsResponse,
  CourseStudentsResponse,
  GetMyEnrollmentsParams,
};
