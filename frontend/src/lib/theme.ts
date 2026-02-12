import { atom, useAtom } from "jotai"

type Theme = "light" | "dark" | "system"

const themeAtom = atom<Theme>((typeof localStorage !== "undefined"
  ? (localStorage.getItem("theme") as Theme)
  : null) || "system")

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function useTheme() {
  const [theme, setTheme] = useAtom(themeAtom)

  const effectiveTheme = theme === "system" ? getSystemTheme() : theme

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  return { theme, effectiveTheme, setTheme: updateTheme }
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  const effective = theme === "system" ? getSystemTheme() : theme

  root.classList.remove("light", "dark")
  root.classList.add(effective)
}

export function initTheme() {
  const saved = localStorage.getItem("theme") as Theme | null
  const theme = saved || "system"
  applyTheme(theme)
}