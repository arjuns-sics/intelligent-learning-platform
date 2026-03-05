import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  browseCourses,
  getFeaturedCourses,
  getCategories,
  createCourse,
  getInstructorCourses,
  getCourse,
  getCourseForLearning,
  updateCourse,
  saveDraft,
  publishCourse,
  deleteCourse,
  type CreateCourseData,
  type UpdateCourseData,
  type Course,
  type CoursesResponse,
  type BrowseCoursesParams,
  type BrowseCoursesResponse,
  type BrowseCourse,
  type CategoryInfo,
} from "@/services/course.service"

// Example API functions - replace with actual API calls
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Example query hook
export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => fetchJson<{ id: string; name: string; email: string }>(`${API_BASE}/user`),
  })
}

// Example mutation hook
export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      fetchJson(`${API_BASE}/user`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] })
    },
  })
}

// Course browsing hooks (for learners)

/**
 * Browse courses with search, filter, and pagination
 */
export function useBrowseCourses(params?: BrowseCoursesParams) {
  return useQuery<BrowseCoursesResponse>({
    queryKey: ["courses", "browse", params],
    queryFn: () => browseCourses(params).then((res) => res.data!),
  })
}

/**
 * Get featured courses (bestsellers)
 */
export function useFeaturedCourses(limit?: number) {
  return useQuery<BrowseCourse[]>({
    queryKey: ["courses", "featured", limit],
    queryFn: () => getFeaturedCourses(limit).then((res) => res.data!),
  })
}

/**
 * Get all categories with course counts
 */
export function useCategories() {
  return useQuery<CategoryInfo[]>({
    queryKey: ["courses", "categories"],
    queryFn: () => getCategories().then((res) => res.data!),
  })
}

// Course hooks (for instructors)

/**
 * Get all courses for the authenticated instructor
 */
export function useInstructorCourses(params?: {
  status?: string;
  limit?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ["courses", "instructor", params],
    queryFn: () => getInstructorCourses(params),
  })
}

/**
 * Get a single course by ID
 */
export function useCourse(courseId: string | null) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId!),
    enabled: !!courseId,
  })
}

/**
 * Get course details for learning (requires enrollment)
 */
export function useCourseForLearning(courseId: string | null) {
  return useQuery({
    queryKey: ["course", courseId, "learn"],
    queryFn: () => getCourseForLearning(courseId!),
    enabled: !!courseId,
  })
}

/**
 * Create a new course
 */
export function useCreateCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCourseData) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "instructor"] })
    },
  })
}

/**
 * Update a course
 */
export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateCourseData) => updateCourse(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      queryClient.invalidateQueries({ queryKey: ["courses", "instructor"] })
    },
  })
}

/**
 * Save a course as draft
 */
export function useSaveDraft(courseId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<CreateCourseData>) => saveDraft(courseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course", courseId] })
      queryClient.invalidateQueries({ queryKey: ["courses", "instructor"] })
    },
  })
}

/**
 * Publish a course
 */
export function usePublishCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => publishCourse(courseId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course", data.data?._id] })
      queryClient.invalidateQueries({ queryKey: ["courses", "instructor"] })
    },
  })
}

/**
 * Delete a course
 */
export function useDeleteCourse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => deleteCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", "instructor"] })
    },
  })
}