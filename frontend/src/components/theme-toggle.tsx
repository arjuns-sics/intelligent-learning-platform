import { useTheme } from "@/lib/atoms"
import { Button } from "@/components/ui/button"
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
} from "@tabler/icons-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const cycleTheme = () => {
    const themes = ["light", "dark", "system"] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const Icon = theme === "light" ? IconSun : theme === "dark" ? IconMoon : IconDeviceDesktop

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label="Toggle theme"
    >
      <Icon className="size-4" />
    </Button>
  )
}