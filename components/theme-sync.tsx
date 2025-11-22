"use client"

import { useEffect } from 'react'
import { useTheme } from '@/lib/theme-context'

interface ThemeSyncProps {
  serverTheme: 'light' | 'dark' | 'system'
}

/**
 * Component that syncs the cookie with the determined theme
 * This ensures that when a user logs in with a DB preference,
 * the cookie is updated to match that preference
 * 
 * serverTheme is determined server-side with priority: DB > cookie > system
 * When the page reloads after login/logout, serverTheme is recalculated and this component
 * automatically syncs the theme, just like LanguageSync does for the language
 */
export function ThemeSync({ serverTheme }: ThemeSyncProps) {
  const { setTheme, theme } = useTheme()

  // Sync when serverTheme changes (on mount and after page reload following login/logout)
  // Do NOT include theme in dependencies to avoid interfering with user changes
  useEffect(() => {
    // Sync cookie with server theme
    const currentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_THEME='))
      ?.split('=')[1]

    // If cookie doesn't match the server theme (from DB if logged in, or system/cookie if not),
    // sync it. This ensures the cookie reflects the actual theme being used.
    if (currentCookie !== serverTheme) {
      document.cookie = `NEXT_THEME=${serverTheme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    }

    // Update theme via context
    // This will update when serverTheme changes (e.g., after page reload following login/logout)
    setTheme(serverTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverTheme]) // Only depend on serverTheme, not theme, to avoid interfering with user changes

  return null // This component doesn't render anything
}

