"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "@/lib/theme-context"
import { useTranslations } from 'next-intl'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Helper to get theme from cookie or DOM (client-side only)
function getThemeFromCookieOrDOM(): "light" | "dark" | "system" {
  if (typeof window === 'undefined') return 'system'
  
  // Try cookie first
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_THEME='))
    ?.split('=')[1]
  
  if (cookie === 'light' || cookie === 'dark' || cookie === 'system') {
    return cookie
  }
  
  // Fallback to DOM class
  const htmlClass = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  return htmlClass
}

// Helper to resolve theme to light/dark
function resolveThemeToLightDark(theme: "light" | "dark" | "system"): "light" | "dark" {
  if (theme === "system") {
    if (typeof window === "undefined") return "light"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }
  return theme === "dark" ? "dark" : "light"
}

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const t = useTranslations('common.theme')
  const [mounted, setMounted] = React.useState(false)
  // Initialize with theme from context to match server-rendered value (avoid hydration mismatch)
  const [localTheme, setLocalTheme] = React.useState<"light" | "dark" | "system">(theme)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Sync local theme with context theme immediately
  React.useEffect(() => {
    setLocalTheme(theme)
  }, [theme])

  // Resolve theme locally for instant updates (calculated synchronously from theme)
  const resolvedTheme = React.useMemo((): "light" | "dark" => {
    return resolveThemeToLightDark(localTheme)
  }, [localTheme])

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    if (newTheme === theme) return

    // Update local theme immediately for instant icon update
    setLocalTheme(newTheme)

    // Update theme immediately for better UX (optimistic update)
    setTheme(newTheme)
    
    // Always save to cookies
    document.cookie = `NEXT_THEME=${newTheme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

    try {
      // Always try to save to API (API will check if user is logged in)
      // If user is logged in, it will save to DB. If not, it returns 401 but we continue.
      const response = await fetch("/api/user/preferences/theme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: newTheme }),
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // User not logged in - this is expected, just log it
          console.log('[ThemeToggle] User not logged in, theme saved to cookie only');
        } else {
          console.error("Error saving to API:", response.status, await response.text().catch(() => ''))
        }
      }
    } catch (apiError) {
      // If API call fails, continue anyway (theme already changed)
      console.error("Error saving to API:", apiError)
    }
  }

  // Calculate resolved theme even before mount to show correct icon immediately
  const displayResolvedTheme = resolveThemeToLightDark(localTheme)
  const displayIcon = displayResolvedTheme === "dark" ? (
    <Moon className="h-4 w-4" />
  ) : (
    <Sun className="h-4 w-4" />
  )

  if (!mounted) {
    // Use localTheme even before mount to show correct icon immediately
    return (
      <Button variant="outline" size="icon" className="h-9 w-9">
        {displayIcon}
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          {displayIcon}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className={theme === "light" ? "bg-accent" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>{t('light')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className={theme === "dark" ? "bg-accent" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>{t('dark')}</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className={theme === "system" ? "bg-accent" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>{t('system')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

