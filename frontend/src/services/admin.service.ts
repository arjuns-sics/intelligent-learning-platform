/**
 * Admin Service
 * Handles all admin-related API calls for user and course management
 */

import apiClient, { type ApiResponse, type User } from "./api-client";

// ==================== TYPES ====================

export interface AdminDashboardStats {
  overview: {
    totalUsers: number;
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
  };
  usersByRole: {
    students: number;
    instructors: number;
    admins: number;
  };
  recentCourses: Array<{
    _id: string;
    title: string;
    status: string;
    enrolledStudents: number;
    createdAt: string;
  }>;
  topCourses: Array<{
    _id: string;
    title: string;
    enrolledStudents: number;
    rating: number;
  }>;
}

export interface UserWithPagination {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface Course {
  id: string;
  _id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  category: string;
  level: string;
  status: "published" | "draft";
  published: boolean;
  enrolledStudents: number;
  rating: number;
  modules: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithPagination {
  courses: Course[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UpdateUserRoleData {
  role: "Student" | "Instructor" | "Admin";
}

export interface UpdateCourseStatusData {
  status?: "published" | "draft";
  published?: boolean;
}

// ==================== DASHBOARD STATISTICS ====================

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
  return apiClient.get<AdminDashboardStats>("/admin/stats");
}

// ==================== USER MANAGEMENT ====================

/**
 * Get all users with pagination and filtering
 */
export async function getAllUsers(
  page = 1,
  limit = 10,
  search?: string,
  role?: string,
  sortBy?: string,
  order?: "asc" | "desc"
): Promise<ApiResponse<UserWithPagination>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(role && { role }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
  });

  return apiClient.get<UserWithPagination>(`/admin/users?${params}`);
}

/**
 * Get single user by ID
 */
export async function getUserById(id: string): Promise<ApiResponse<User>> {
  return apiClient.get<User>(`/admin/users/${id}`);
}

/**
 * Update user role
 */
export async function updateUserRole(
  id: string,
  data: UpdateUserRoleData
): Promise<ApiResponse<User>> {
  return apiClient.put<User>(`/admin/users/${id}/role`, data);
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/admin/users/${id}`);
}

// ==================== COURSE MANAGEMENT ====================

/**
 * Get all courses with pagination and filtering
 */
export async function getAllCourses(
  page = 1,
  limit = 10,
  search?: string,
  status?: string,
  category?: string,
  sortBy?: string,
  order?: "asc" | "desc"
): Promise<ApiResponse<CourseWithPagination>> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(status && { status }),
    ...(category && { category }),
    ...(sortBy && { sortBy }),
    ...(order && { order }),
  });

  return apiClient.get<CourseWithPagination>(`/admin/courses?${params}`);
}

/**
 * Get course by ID
 */
export async function getCourseById(id: string): Promise<ApiResponse<Course>> {
  return apiClient.get<Course>(`/admin/courses/${id}`);
}

/**
 * Update course status
 */
export async function updateCourseStatus(
  id: string,
  data: UpdateCourseStatusData
): Promise<ApiResponse<Course>> {
  return apiClient.put<Course>(`/admin/courses/${id}/status`, data);
}

/**
 * Delete course
 */
export async function deleteCourse(id: string): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/admin/courses/${id}`);
}
