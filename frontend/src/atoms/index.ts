import { atom } from "jotai"

// Example atoms - extend as needed
export const countAtom = atom(0)

// User state atom
export const userAtom = atom<{
  id: string | null
  name: string | null
  email: string | null
} | null>(null)

// Theme atom
export const themeAtom = atom<"light" | "dark" | "system">("system")

// Sidebar open state
export const sidebarOpenAtom = atom(true)