/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import apiClient, {
  type ApiResponse,
  type LoginResponse,
  type LoginData,
  type RegisterData,
  type User,
  type UpdateProfileData,
  type ChangePasswordData,
  tokenManager,
} from "./api-client";

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<LoginResponse>("/auth/register", data, {
    skipAuth: true,
  });

  // Store token and user on successful registration
  if (response.success && response.data) {
    tokenManager.set(response.data.token);
    tokenManager.setUser(response.data.user);
  }

  return response;
}

/**
 * Login user
 */
export async function login(data: LoginData): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<LoginResponse>("/auth/login", data, {
    skipAuth: true,
  });

  // Store token and user on successful login
  if (response.success && response.data) {
    tokenManager.set(response.data.token);
    tokenManager.setUser(response.data.user);
  }

  return response;
}

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ApiResponse<User>> {
  const response = await apiClient.get<User>("/auth/profile");

  // Update stored user data
  if (response.success && response.data) {
    tokenManager.setUser(response.data);
  }

  return response;
}

/**
 * Update user profile
 */
export async function updateProfile(
  data: UpdateProfileData
): Promise<ApiResponse<User>> {
  const response = await apiClient.put<User>("/auth/profile", data);

  // Update stored user data
  if (response.success && response.data) {
    tokenManager.setUser(response.data);
  }

  return response;
}

/**
 * Change password
 */
export async function changePassword(
  data: ChangePasswordData
): Promise<ApiResponse<null>> {
  return apiClient.put<null>("/auth/password", data);
}

/**
 * Logout user - clears local storage
 */
export function logout(): void {
  tokenManager.remove();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return tokenManager.get() !== null;
}

/**
 * Get current user from local storage
 */
export function getCurrentUser(): User | null {
  return tokenManager.getUser();
}

/**
 * Get stored token
 */
export function getStoredToken(): string | null {
  return tokenManager.get();
}

// Export types for use in components
export type { User, LoginData, RegisterData, UpdateProfileData, ChangePasswordData };