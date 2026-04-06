/**
 * src/context/ThemeContext.tsx
 *
 * Contexto de tema — compatível com dois mecanismos:
 *   1. [data-theme="dark"] → seletor do globals.css para trocar tokens CSS
 *   2. classe .dark        → seletor das variantes dark: dos componentes shadcn/ui
 *
 * Contrato exposto:
 *   theme       → "dark" | "light" (valor atual)
 *   setTheme    → setter direto (compatível com componentes que esperam setTheme)
 *   toggleTheme → alterna entre dark/light
 *   isDark      → booleano conveniente
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"

type Theme = "dark" | "light"

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("fintrack_theme")
    if (stored === "dark" || stored === "light") return stored
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  })

  useEffect(() => {
    const root = document.documentElement

    if (theme === "dark") {
      root.setAttribute("data-theme", "dark")
      root.classList.add("dark")
      root.style.backgroundColor = "oklch(0.12 0.005 250)"
    } else {
      root.setAttribute("data-theme", "light")
      root.classList.remove("dark")
      root.style.backgroundColor = "oklch(0.99 0 0)"
    }

    localStorage.setItem("fintrack_theme", theme)
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"))
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === "dark" }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme deve ser usado dentro de <ThemeProvider>")
  return ctx
}
