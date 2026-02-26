/**
 * API Client Service
 * Handles HTTP requests with automatic token injection and error handling
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Token storage keys
const TOKEN_KEY = "learnify_token";
const USER_KEY = "learnify_user";

// Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "Student" | "Instructor" | "Admin";
  profile_image: string | null;
  preferredMedia: string | null;
  masteryScore: number;
  weaknessTags: string[];
  createdAt: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: "Student" | "Instructor" | "Admin";
  preferredMedia?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  profile_image?: string;
  preferredMedia?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Token management utilities
export const tokenManager = {
  get: (): string | null => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  },

  remove: (): void => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error("Failed to remove token:", error);
    }
  },

  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  },
};

// Custom error class for API errors
export class ApiClientError extends Error {
  public statusCode: number;
  public errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

// Request configuration type
interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
}

/**
 * Make an HTTP request with automatic token injection
 */
async function request<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, headers = {}, ...restConfig } = config;

  // Build headers
  const requestHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  // Add authorization header if token exists and not skipped
  if (!skipAuth) {
    const token = tokenManager.get();
    if (token) {
      (requestHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...restConfig,
      headers: requestHeaders,
    });

    const data = await response.json();

    // Handle non-OK responses
    if (!response.ok) {
      throw new ApiClientError(
        data.message || `HTTP error! status: ${response.status}`,
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Network or other errors
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      throw new ApiClientError(
        "Unable to connect to the server. Please check your internet connection.",
        0
      );
    }

    throw new ApiClientError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500
    );
  }
}

// HTTP method helpers
export const apiClient = {
  get: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, config?: RequestConfig) =>
    request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, config?: RequestConfig) =>
    request<T>(endpoint, { ...config, method: "DELETE" }),
};

export default apiClient;