"use client"

import { useEffect } from 'react'
import { useLocale } from 'next-intl'

/**
 * Component that syncs the cookie with the determined language
 * This ensures that when a user logs in with a DB preference,
 * the cookie is updated to match that preference
 */
export function LanguageSync() {
  const locale = useLocale()

  useEffect(() => {
    // Get current cookie
    const currentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('NEXT_LOCALE='))
      ?.split('=')[1]

    // If cookie doesn't match the current locale (from DB if logged in, or system/cookie if not),
    // sync it. This ensures the cookie reflects the actual language being used.
    if (currentCookie !== locale) {
      document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    }
  }, [locale])

  return null // This component doesn't render anything
}

