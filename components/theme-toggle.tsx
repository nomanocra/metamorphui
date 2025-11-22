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

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const t = useTranslations('common.theme')
  const [mounted, setMounted] = React.useState(false)
  const [localTheme, setLocalTheme] = React.useState<"light" | "dark" | "system">(theme)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Sync local theme with context theme immediately
  React.useEffect(() => {
    setLocalTheme(theme)
  }, [theme])

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

  // Determine icon to display: Monitor for system, Sun/Moon based on resolvedTheme
  // Use localTheme for optimistic updates, but resolvedTheme from context for server consistency
  const displayIcon = localTheme === "system" ? (
    <Monitor className="h-4 w-4" />
  ) : resolvedTheme === "dark" ? (
    <Moon className="h-4 w-4" />
  ) : (
    <Sun className="h-4 w-4" />
  )

  if (!mounted) {
    // Use theme and resolvedTheme from context to match server-rendered value (avoid hydration mismatch)
    const serverIcon = theme === "system" ? (
      <Monitor className="h-4 w-4" />
    ) : resolvedTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    )
    return (
      <Button variant="outline" size="icon" className="h-9 w-9">
        {serverIcon}
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

