import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';
import { determineLanguage } from './lib/language';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  console.log('[i18n.ts] getRequestConfig called');
  
  // Get Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  console.log('[i18n.ts] Accept-Language header:', acceptLanguage);
  
  // Determine locale using our priority logic (user preference > cookies > system)
  // This will automatically save to DB if user is logged in and has no preference
  console.log('[i18n.ts] Calling determineLanguage...');
  const locale = await determineLanguage(acceptLanguage);
  console.log('[i18n.ts] Determined locale:', locale);
  
  // Note: Cookies cannot be modified in getRequestConfig
  // Cookie sync will be handled by middleware or API routes
  const cookieStore = await cookies();
  const currentCookie = cookieStore.get('NEXT_LOCALE')?.value;
  console.log('[i18n.ts] Current cookie:', currentCookie, 'Determined locale:', locale);

  console.log('[i18n.ts] Returning locale:', locale);
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

