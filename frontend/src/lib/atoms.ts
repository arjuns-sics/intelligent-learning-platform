import { atom } from "jotai"

// User state
export const userAtom = atom<{
  id: string | null
  name: string | null
  email: string | null
} | null>(null)

// UI state
export const sidebarOpenAtom = atom(true)

// Theme state
export const themeAtom = atom<"light" | "dark" | "system">("system")