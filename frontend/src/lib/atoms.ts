import { atom, useAtom } from "jotai"
import { useEffect } from "react"

type Theme = "dark" | "light" | "system"

const storageKey = "learnify-theme"

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "system"
  return (localStorage.getItem(storageKey) as Theme) || "system"
}

export const themeAtom = atom<Theme>(getInitialTheme())

export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom)

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])

  const setThemeWithStorage = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme)
    setTheme(newTheme)
  }

  return { theme, setTheme: setThemeWithStorage }
}