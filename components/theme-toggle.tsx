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

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    if (newTheme === theme) return

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

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  // Use resolvedTheme for icon display (resolvedTheme is 'light' or 'dark', not 'system')
  const displayIcon = resolvedTheme === "dark" ? (
    <Moon className="h-4 w-4" />
  ) : (
    <Sun className="h-4 w-4" />
  )

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

