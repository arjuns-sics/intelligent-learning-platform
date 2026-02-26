import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import type { User } from "@/services/api-client"

// Example atoms - extend as needed
export const countAtom = atom(0)

// Auth state atoms with localStorage persistence
// atomWithStorage uses localStorage by default
export const authTokenAtom = atomWithStorage<string | null>("learnify_token", null)

export const authUserAtom = atomWithStorage<User | null>("learnify_user", null)

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => {
  const token = get(authTokenAtom)
  return token !== null && token !== ""
})

// Derived atom for user role
export const userRoleAtom = atom((get) => {
  const user = get(authUserAtom)
  return user?.role ?? null
})

// Write-only atom for login (sets both token and user)
export const loginAtom = atom(
  null,
  (_get, set, payload: { token: string; user: User }) => {
    set(authTokenAtom, payload.token)
    set(authUserAtom, payload.user)
  }
)

// Write-only atom for logout (clears both token and user)
export const logoutAtom = atom(null, (_get, set) => {
  set(authTokenAtom, null)
  set(authUserAtom, null)
})

// Write-only atom to update user data
export const updateUserAtom = atom(
  null,
  (get, set, userData: Partial<User>) => {
    const currentUser = get(authUserAtom)
    if (currentUser) {
      set(authUserAtom, { ...currentUser, ...userData })
    }
  }
)

// Legacy user atom - keeping for backward compatibility
export const userAtom = atom<{
  id: string | null
  name: string | null
  email: string | null
} | null>(null)

// Theme atom
export const themeAtom = atom<"light" | "dark" | "system">("system")

// Sidebar open state
export const sidebarOpenAtom = atom(true)