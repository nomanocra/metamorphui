import { getRequestConfig } from 'next-intl/server';
import { routing } from './i18n/routing';
import { determineLanguage } from './lib/language';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  // Get Accept-Language header
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  
  // Determine locale using our priority logic (user preference > cookies > system)
  // This will automatically save to DB if user is logged in and has no preference
  const locale = await determineLanguage(acceptLanguage);
  
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});

