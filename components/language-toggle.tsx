"use client"

import * as React from "react"
import { Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale } from 'next-intl'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
  const router = useRouter()
  // Use next-intl's useLocale to get the actual locale being used
  // This respects the priority: DB > cookie > system
  const currentLocale = useLocale() as 'fr' | 'en'
  const [mounted, setMounted] = React.useState(false)
  // Initialize with currentLocale to match server-rendered value (avoid hydration mismatch)
  const [localLocale, setLocalLocale] = React.useState<'fr' | 'en'>(currentLocale)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Sync local locale with context locale (e.g., after page reload or login/logout)
  React.useEffect(() => {
    setLocalLocale(currentLocale)
  }, [currentLocale])

  const handleLanguageChange = async (newLocale: "fr" | "en") => {
    if (newLocale === currentLocale) return

    // Optimistic update: update local state immediately
    setLocalLocale(newLocale)

    try {
      // Always try to save to API (API will check if user is logged in)
      // If user is logged in, it will save to DB. If not, it returns 401 but we continue.
      try {
        const response = await fetch("/api/user/preferences/language", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ language: newLocale }),
        })
        
        if (!response.ok && response.status !== 401) {
          // Only log if it's not a 401 (unauthorized is expected if not logged in)
          console.error("Error saving to API:", response.status)
        }
      } catch (apiError) {
        // If API call fails, continue with cookie save
        console.error("Error saving to API:", apiError)
      }
      
      // Always save to cookies
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`

      // Use router.refresh() instead of window.location.reload() for smoother experience
      // This will refresh server components without full page reload
      router.refresh()
    } catch (error) {
      console.error("Error changing language:", error)
      // Revert optimistic update on error
      setLocalLocale(currentLocale)
    }
  }

  if (!mounted) {
    // Use localLocale even before mount to show correct value immediately
    const displayLocale = localLocale.toUpperCase() as 'FR' | 'EN'
    return (
      <Button variant="outline" size="icon" className="h-9 w-9">
        <span className="text-xs font-semibold text-muted-foreground">{displayLocale}</span>
        <span className="sr-only">Toggle language</span>
      </Button>
    )
  }

  // Display local locale (optimistically updated) in uppercase
  const displayLocale = localLocale.toUpperCase() as 'FR' | 'EN'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <span className="text-xs font-semibold text-muted-foreground">{displayLocale}</span>
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("fr")}
          className={currentLocale === "fr" ? "bg-accent" : ""}
        >
          <span>Français</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleLanguageChange("en")}
          className={currentLocale === "en" ? "bg-accent" : ""}
        >
          <span>English</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

