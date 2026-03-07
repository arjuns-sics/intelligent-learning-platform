/**
 * Course Service
 * Handles all course-related API calls
 */

import apiClient, { type ApiResponse } from "./api-client";

// Types
export interface Lesson {
  id: string;
  title: string;
  type: "video" | "article" | "resource";
  duration: string;
  content: string;
  videoUrl: string;
  order?: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isExpanded?: boolean;
  order?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options: string[];
  correctAnswer: string | number;
  points: number;
  order?: number;
}

export interface Quiz {
  id: string;
  title: string;
  moduleId: string | null;
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
  order?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  moduleId: string | null;
  dueDate: string;
  maxScore: number;
  fileTypes: string[];
  maxFileSize: number;
  instructions: string;
  order?: number;
}

export interface Course {
  _id: string;
  instructor: {
    _id: string;
    name: string;
    email: string;
    profile_image: string | null;
  };
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  language: string;
  thumbnail: string | null;
  prerequisites: string[];
  learningObjectives: string[];
  modules: Module[];
  quizzes: Quiz[];
  assignments: Assignment[];
  hasCertificate: boolean;
  duration: string;
  maxStudents: number | null;
  published: boolean;
  status: "draft" | "published" | "archived";
  enrolledStudents: number;
  rating: {
    average: number;
    count: number;
  };
  totalLessons?: number;
  totalQuizzes?: number;
  totalAssignments?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithEnrollment {
  course: Course;
  enrollment: {
    _id: string;
    progress: number;
    status: string;
    completedLessons: string[];
    completedModules: string[];
  };
}

// Types for course browsing (learner-facing)
export interface BrowseCourse {
  id: string;
  _id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId?: string;
  category: string;
  difficulty: string;
  duration: string;
  modules: number;
  students: number;
  rating: number;
  reviews: number;
  tags: string[];
  bestseller: boolean;
  isNew: boolean;
  lastUpdated: string;
  thumbnail: string | null;
  language: string;
  prerequisites: string[];
  learningObjectives: string[];
  hasCertificate: boolean;
}

export interface CategoryInfo {
  category: string;
  count: number;
}

export interface BrowseCoursesParams {
  search?: string;
  category?: string;
  level?: string;
  sortBy?: "popular" | "rating" | "newest";
  page?: number;
  limit?: number;
}

export interface BrowseCoursesResponse {
  courses: BrowseCourse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateCourseData {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "All Levels";
  language?: string;
  thumbnail?: string | null;
  prerequisites?: string[];
  learningObjectives?: string[];
  modules?: Module[];
  quizzes?: Quiz[];
  assignments?: Assignment[];
  hasCertificate?: boolean;
  duration?: string;
  maxStudents?: number | null;
  published?: boolean;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  published?: boolean;
}

export interface GenerateQuizzesData {
  courseTitle: string;
  courseDescription: string;
  modules?: Module[];
  learningObjectives?: string[];
  numQuizzes?: number;
  questionsPerQuiz?: number;
  moduleId?: string;
}

export interface GenerateQuizzesResponse {
  quizzes: Quiz[];
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Browse courses with search, filter, and pagination
 */
export async function browseCourses(
  params?: BrowseCoursesParams
): Promise<ApiResponse<BrowseCoursesResponse>> {
  const queryParams = new URLSearchParams();

  if (params?.search) queryParams.append("search", params.search);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.level) queryParams.append("level", params.level);
  if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());

  const queryString = queryParams.toString();
  const endpoint = `/courses/browse${queryString ? `?${queryString}` : ""}`;

  return apiClient.get<BrowseCoursesResponse>(endpoint);
}

/**
 * Get featured courses (bestsellers)
 */
export async function getFeaturedCourses(
  limit?: number
): Promise<ApiResponse<BrowseCourse[]>> {
  const endpoint = limit ? `/courses/featured?limit=${limit}` : "/courses/featured";
  return apiClient.get<BrowseCourse[]>(endpoint);
}

/**
 * Get all categories with course counts
 */
export async function getCategories(): Promise<ApiResponse<CategoryInfo[]>> {
  return apiClient.get<CategoryInfo[]>("/courses/categories");
}

/**
 * Create a new course
 */
export async function createCourse(
  data: CreateCourseData
): Promise<ApiResponse<Course>> {
  return apiClient.post<Course>("/courses", data);
}

/**
 * Get all courses for the authenticated instructor
 */
export async function getInstructorCourses(params?: {
  status?: string;
  limit?: number;
  page?: number;
}): Promise<ApiResponse<CoursesResponse>> {
  const queryParams = new URLSearchParams();

  if (params?.status) queryParams.append("status", params.status);
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.page) queryParams.append("page", params.page.toString());

  const queryString = queryParams.toString();
  const endpoint = `/courses/instructor/my-courses${queryString ? `?${queryString}` : ""}`;

  return apiClient.get<CoursesResponse>(endpoint);
}

/**
 * Get a single course by ID
 */
export async function getCourse(courseId: string): Promise<ApiResponse<Course>> {
  return apiClient.get<Course>(`/courses/${courseId}`);
}

/**
 * Get course details for learning (requires enrollment)
 */
export async function getCourseForLearning(courseId: string): Promise<ApiResponse<CourseWithEnrollment>> {
  return apiClient.get<CourseWithEnrollment>(`/courses/${courseId}/learn`);
}

/**
 * Update a course
 */
export async function updateCourse(
  courseId: string,
  data: UpdateCourseData
): Promise<ApiResponse<Course>> {
  return apiClient.put<Course>(`/courses/${courseId}`, data);
}

/**
 * Save a course as draft
 */
export async function saveDraft(
  courseId: string,
  data: Partial<CreateCourseData>
): Promise<ApiResponse<Course>> {
  return apiClient.post<Course>(`/courses/${courseId}/draft`, data);
}

/**
 * Publish a course
 */
export async function publishCourse(
  courseId: string
): Promise<ApiResponse<Course>> {
  return apiClient.post<Course>(`/courses/${courseId}/publish`, null);
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<ApiResponse<null>> {
  return apiClient.delete<null>(`/courses/${courseId}`);
}

/**
 * Generate quizzes using AI
 */
export async function generateQuizzes(
  data: GenerateQuizzesData
): Promise<ApiResponse<GenerateQuizzesResponse>> {
  return apiClient.post<GenerateQuizzesResponse>("/courses/generate-quizzes", data);
}

// Export types for use in components
export type {
  Lesson,
  Module,
  QuizQuestion,
  Quiz,
  Assignment,
  CreateCourseData,
  UpdateCourseData,
  CoursesResponse,
  GenerateQuizzesData,
  GenerateQuizzesResponse,
};
