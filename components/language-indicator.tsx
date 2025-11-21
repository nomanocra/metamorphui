"use client"

import { useLocale } from 'next-intl';

export function LanguageIndicator() {
  // Use next-intl's useLocale to get the actual locale being used
  // This respects the priority: DB > cookie > system
  const locale = useLocale();
  
  // Convert to uppercase for display
  const displayLocale = locale.toUpperCase() as 'FR' | 'EN';

  return (
    <span className="text-xs font-semibold text-muted-foreground px-2 py-1 bg-muted rounded">
      {displayLocale}
    </span>
  )
}

