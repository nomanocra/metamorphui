"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  attribute?: string
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
}

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
}

const ThemeProviderContext = React.createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">("light")
  const [mounted, setMounted] = React.useState(false)

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  // Resolve theme (system -> light/dark)
  const resolveTheme = (themeValue: Theme): "light" | "dark" => {
    if (themeValue === "system" && enableSystem) {
      return getSystemTheme()
    }
    return themeValue === "dark" ? "dark" : "light"
  }

  // Apply theme to HTML element
  const applyTheme = React.useCallback((themeValue: Theme) => {
    const resolved = resolveTheme(themeValue)
    const root = document.documentElement

    if (disableTransitionOnChange) {
      const css = document.createElement("style")
      css.appendChild(
        document.createTextNode(
          `*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}`
        )
      )
      document.head.appendChild(css)

      root.classList.remove("light", "dark")
      if (attribute === "class") {
        root.classList.add(resolved)
      } else {
        root.setAttribute(attribute, resolved)
      }

      // Force a reflow to ensure the transition is removed
      ;(() => window.getComputedStyle(root).opacity)()

      // Remove the style tag after a short delay
      setTimeout(() => {
        document.head.removeChild(css)
      }, 1)
    } else {
      root.classList.remove("light", "dark")
      if (attribute === "class") {
        root.classList.add(resolved)
      } else {
        root.setAttribute(attribute, resolved)
      }
    }

    setResolvedTheme(resolved)
  }, [attribute, enableSystem, disableTransitionOnChange])

  // Initialize theme on mount
  React.useEffect(() => {
    setMounted(true)
    
    // Use defaultTheme from server (already determined with priority: DB > cookie > system)
    // This ensures consistency with server-side rendering
    setThemeState(defaultTheme)
    applyTheme(defaultTheme)
  }, [defaultTheme, applyTheme])

  // Listen to system theme changes
  React.useEffect(() => {
    if (!enableSystem || theme !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system")
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme, enableSystem, applyTheme])

  // Update theme when it changes
  React.useEffect(() => {
    if (mounted) {
      applyTheme(theme)
    }
  }, [theme, mounted, applyTheme])

  const setTheme = React.useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
    // Cookie is saved by ThemeToggle/ThemeSync
  }, [])

  const value = React.useMemo(
    () => ({
      theme: mounted ? theme : defaultTheme,
      resolvedTheme: mounted ? resolvedTheme : resolveTheme(defaultTheme),
      setTheme,
    }),
    [theme, resolvedTheme, setTheme, mounted, defaultTheme]
  )

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}

