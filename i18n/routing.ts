import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // Define supported locales
  locales: ['fr', 'en'],
  
  // Default locale
  defaultLocale: 'en',
  
  // Don't use locale prefix in URLs
  localePrefix: 'never'
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);

