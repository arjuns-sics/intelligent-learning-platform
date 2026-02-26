/**
 * useAuth Hook
 * Provides authentication state and methods for components
 */

import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  authTokenAtom,
  authUserAtom,
  isAuthenticatedAtom,
  userRoleAtom,
  loginAtom,
  logoutAtom,
  updateUserAtom,
} from "@/atoms"
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getProfile,
  updateProfile,
  changePassword,
} from "@/services/auth.service"
import type {
  LoginData,
  RegisterData,
  UpdateProfileData,
  ChangePasswordData,
  User,
} from "@/services/api-client"
import { ApiClientError } from "@/services/api-client"

interface UseAuthReturn {
  // State
  user: User | null
  token: string | null
  isAuthenticated: boolean
  role: "Student" | "Instructor" | "Admin" | null
  isLoading: boolean

  // Actions
  login: (data: LoginData) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  fetchProfile: () => Promise<{ success: boolean; error?: string }>
  updateUserProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>
  changeUserPassword: (data: ChangePasswordData) => Promise<{ success: boolean; error?: string }>
  updateUser: (userData: Partial<User>) => void
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()

  // Atom values
  const [user, setUser] = useAtom(authUserAtom)
  const token = useAtomValue(authTokenAtom)
  const isAuthenticated = useAtomValue(isAuthenticatedAtom)
  const role = useAtomValue(userRoleAtom)

  // Atom setters
  const setLoginState = useSetAtom(loginAtom)
  const setLogoutState = useSetAtom(logoutAtom)
  const updateUserData = useSetAtom(updateUserAtom)

  // Loading state derived from token presence but no user
  const isLoading = token !== null && user === null

  /**
   * Login handler
   */
  const login = useCallback(
    async (data: LoginData) => {
      try {
        const response = await loginService(data)

        if (response.success && response.data) {
          setLoginState({
            token: response.data.token,
            user: response.data.user,
          })
          return { success: true }
        }

        return { success: false, error: response.message }
      } catch (error) {
        const message =
          error instanceof ApiClientError
            ? error.message
            : "An unexpected error occurred during login"
        return { success: false, error: message }
      }
    },
    [setLoginState]
  )

  /**
   * Register handler
   */
  const register = useCallback(
    async (data: RegisterData) => {
      try {
        const response = await registerService(data)

        if (response.success && response.data) {
          setLoginState({
            token: response.data.token,
            user: response.data.user,
          })
          return { success: true }
        }

        return { success: false, error: response.message }
      } catch (error) {
        const message =
          error instanceof ApiClientError
            ? error.message
            : "An unexpected error occurred during registration"
        return { success: false, error: message }
      }
    },
    [setLoginState]
  )

  /**
   * Logout handler
   */
  const logout = useCallback(() => {
    logoutService()
    setLogoutState()
    navigate("/login")
  }, [setLogoutState, navigate])

  /**
   * Fetch current user profile
   */
  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfile()

      if (response.success && response.data) {
        setUser(response.data)
        return { success: true }
      }

      // If profile fetch fails with 401, logout
      return { success: false, error: response.message }
    } catch (error) {
      if (error instanceof ApiClientError && error.statusCode === 401) {
        logout()
        return { success: false, error: "Session expired. Please login again." }
      }

      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to fetch profile"
      return { success: false, error: message }
    }
  }, [setUser, logout])

  /**
   * Update user profile
   */
  const updateUserProfile = useCallback(
    async (data: UpdateProfileData) => {
      try {
        const response = await updateProfile(data)

        if (response.success && response.data) {
          setUser(response.data)
          return { success: true }
        }

        return { success: false, error: response.message }
      } catch (error) {
        const message =
          error instanceof ApiClientError
            ? error.message
            : "Failed to update profile"
        return { success: false, error: message }
      }
    },
    [setUser]
  )

  /**
   * Change password
   */
  const changeUserPassword = useCallback(async (data: ChangePasswordData) => {
    try {
      const response = await changePassword(data)

      if (response.success) {
        return { success: true }
      }

      return { success: false, error: response.message }
    } catch (error) {
      const message =
        error instanceof ApiClientError
          ? error.message
          : "Failed to change password"
      return { success: false, error: message }
    }
  }, [])

  /**
   * Update user data locally
   */
  const updateUser = useCallback(
    (userData: Partial<User>) => {
      updateUserData(userData)
    },
    [updateUserData]
  )

  /**
   * Auto-fetch profile on mount if token exists but no user
   */
  useEffect(() => {
    if (token && !user) {
      fetchProfile()
    }
  }, [token, user, fetchProfile])

  /**
   * Auto-logout on token expiry (401 responses)
   * This is handled by the API client throwing 401 errors
   */

  return {
    // State
    user,
    token,
    isAuthenticated,
    role,
    isLoading,

    // Actions
    login,
    register,
    logout,
    fetchProfile,
    updateUserProfile,
    changeUserPassword,
    updateUser,
  }
}

export default useAuth