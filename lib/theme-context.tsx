"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultResolvedTheme?: "light" | "dark"
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
  defaultResolvedTheme,
  attribute = "class",
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  // Initialize resolvedTheme from server if provided, otherwise calculate it
  const initialResolvedTheme = defaultResolvedTheme ?? (defaultTheme === "dark" ? "dark" : "light")
  const [resolvedTheme, setResolvedTheme] = React.useState<"light" | "dark">(initialResolvedTheme)
  const [mounted, setMounted] = React.useState(false)

  // Get system preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }

  // Resolve theme (system -> light/dark)
  const resolveTheme = React.useCallback((themeValue: Theme): "light" | "dark" => {
    if (themeValue === "system" && enableSystem) {
      return getSystemTheme()
    }
    return themeValue === "dark" ? "dark" : "light"
  }, [enableSystem])

  // Apply theme to HTML element
  const applyTheme = React.useCallback((themeValue: Theme, resolved?: "light" | "dark") => {
    const resolvedThemeValue = resolved ?? resolveTheme(themeValue)
    const root = document.documentElement

    // Check if theme is already correctly applied to avoid unnecessary updates
    const currentClass = root.classList.contains("dark") ? "dark" : "light"
    if (currentClass === resolvedThemeValue) {
      // Theme is already correct, just update state
      setResolvedTheme(resolvedThemeValue)
      return
    }

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
        root.classList.add(resolvedThemeValue)
      } else {
        root.setAttribute(attribute, resolvedThemeValue)
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
        root.classList.add(resolvedThemeValue)
      } else {
        root.setAttribute(attribute, resolvedThemeValue)
      }
    }

    setResolvedTheme(resolvedThemeValue)
  }, [attribute, enableSystem, disableTransitionOnChange, resolveTheme])

  // Initialize theme on mount
  React.useEffect(() => {
    setMounted(true)
    
    // Use defaultTheme from server (already determined with priority: DB > cookie > system)
    // This ensures consistency with server-side rendering
    setThemeState(defaultTheme)
    
    // For system theme, always check what's actually applied on the DOM (from inline script)
    // This ensures we respect the client-side detection done by the inline script
    // For other themes, use defaultResolvedTheme if provided (from server), otherwise resolve it
    let initialResolved: "light" | "dark"
    if (defaultTheme === "system") {
      // Always check what's actually on the DOM (set by inline script)
      // Don't use defaultResolvedTheme for system to avoid server/client mismatch
      const isDarkOnDOM = document.documentElement.classList.contains("dark")
      initialResolved = isDarkOnDOM ? "dark" : "light"
    } else {
      // Use defaultResolvedTheme if provided (from server), otherwise resolve it
      initialResolved = defaultResolvedTheme ?? resolveTheme(defaultTheme)
    }
    
    setResolvedTheme(initialResolved)
    // Don't call applyTheme if theme is already correctly applied on DOM (to avoid flash)
    // The inline script has already applied it, and applyTheme checks if it's already correct
    applyTheme(defaultTheme, initialResolved)
  }, [defaultTheme, defaultResolvedTheme, applyTheme, resolveTheme])

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
    // Update resolvedTheme immediately for instant icon update (before state update)
    const newResolved = resolveTheme(newTheme)
    setResolvedTheme(newResolved)
    // Update theme state
    setThemeState(newTheme)
    // Apply theme to DOM immediately
    applyTheme(newTheme, newResolved)
    // Cookie is saved by ThemeToggle/ThemeSync
  }, [resolveTheme, applyTheme])

  const value = React.useMemo(
    () => ({
      theme: mounted ? theme : defaultTheme,
      resolvedTheme: mounted ? resolvedTheme : (defaultResolvedTheme ?? resolveTheme(defaultTheme)),
      setTheme,
    }),
    [theme, resolvedTheme, setTheme, mounted, defaultTheme, defaultResolvedTheme, resolveTheme]
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

