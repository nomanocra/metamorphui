import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

export type SupportedLocale = 'fr' | 'en';

const DEFAULT_LOCALE: SupportedLocale = 'en';
const SUPPORTED_LOCALES: SupportedLocale[] = ['fr', 'en'];

/**
 * Get user language preference from database
 */
export async function getUserLanguage(userId: string): Promise<SupportedLocale | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { language: true },
    });
    
    if (user?.language && SUPPORTED_LOCALES.includes(user.language as SupportedLocale)) {
      return user.language as SupportedLocale;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching user language:', error);
    return null;
  }
}

/**
 * Get language from cookies
 */
export async function getLanguageFromCookies(): Promise<SupportedLocale | null> {
  try {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
    
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as SupportedLocale)) {
      return cookieLocale as SupportedLocale;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading language cookie:', error);
    return null;
  }
}

/**
 * Get system/browser language from Accept-Language header
 */
export function getSystemLanguage(acceptLanguageHeader?: string | null): SupportedLocale {
  if (!acceptLanguageHeader) {
    return DEFAULT_LOCALE;
  }
  
  // Parse Accept-Language header (e.g., "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7")
  const languages = acceptLanguageHeader
    .split(',')
    .map(lang => lang.split(';')[0].trim().split('-')[0].toLowerCase());
  
  // Find first supported language
  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
      return lang as SupportedLocale;
    }
  }
  
  return DEFAULT_LOCALE;
}

/**
 * Determine language with priority: user preference > cookies > system language
 * For server-side context (uses getServerSession)
 */
export async function determineLanguage(
  acceptLanguageHeader?: string | null
): Promise<SupportedLocale> {
  // Try to get session - getServerSession should work in server components
  const session = await getServerSession(authOptions);
  
  // Also try to get token from cookies as fallback (more reliable in some contexts)
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  
  let userId: string | null = null;
  
  if (session?.user?.id) {
    userId = session.user.id;
    console.log('[determineLanguage] Session found via getServerSession, User ID:', userId);
  } else if (allCookies) {
    // Try to decode token to get user ID as fallback
    try {
      // Create a minimal request object for getToken
      const mockRequest = {
        headers: {
          get: (name: string) => {
            if (name.toLowerCase() === 'cookie') return allCookies;
            return null;
          },
        },
        cookies: {
          get: (name: string) => cookieStore.get(name),
        },
      } as any;
      
      const token = await getToken({ 
        req: mockRequest,
        secret: process.env.NEXTAUTH_SECRET 
      });
      if (token?.id) {
        userId = token.id as string;
        console.log('[determineLanguage] Session found via token, User ID:', userId);
      }
    } catch (error) {
      console.log('[determineLanguage] Could not decode token (this is normal if not logged in):', error instanceof Error ? error.message : error);
    }
  }
  
  console.log('[determineLanguage] Final User ID:', userId || 'No user');
  
  // If user is logged in
  if (userId) {
    const userLanguage = await getUserLanguage(userId);
    console.log(`[determineLanguage] User ${userId} language from DB:`, userLanguage);
    
    // Priority 1: User preference in DB (highest priority)
    if (userLanguage) {
      console.log(`[determineLanguage] Using user preference from DB: ${userLanguage}`);
      // Note: Cookie sync will be handled by middleware or i18n.ts
      return userLanguage;
    }
    
    // Priority 2: Cookie (if user has no preference, use cookie and save it)
    const cookieLanguage = await getLanguageFromCookies();
    console.log(`[determineLanguage] Cookie language:`, cookieLanguage);
    
    if (cookieLanguage) {
      console.log(`[determineLanguage] User has no DB preference, using cookie (${cookieLanguage}) and saving to DB`);
      // Save cookie preference to user preference in DB
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { language: cookieLanguage },
        });
        console.log(`[determineLanguage] Saved cookie language (${cookieLanguage}) to user ${userId} preference`);
      } catch (error) {
        console.error('[determineLanguage] Error saving language to user preference:', error);
      }
      return cookieLanguage;
    }
    
    // Priority 3: System language (if no cookie, detect and save)
    const systemLanguage = getSystemLanguage(acceptLanguageHeader);
    
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { language: systemLanguage },
      });
      // Note: Cookie will be set by middleware or i18n.ts
      console.log(`[determineLanguage] Saved system language (${systemLanguage}) to user ${userId} preference`);
    } catch (error) {
      console.error('Error saving system language to user preference:', error);
    }
    
    return systemLanguage;
  }
  
  // User not logged in
  console.log('[determineLanguage] User not logged in, checking cookies');
  const cookieLanguage = await getLanguageFromCookies();
  
  if (cookieLanguage) {
    console.log(`[determineLanguage] Using cookie language: ${cookieLanguage}`);
    return cookieLanguage;
  }
  
  // No cookie, detect system language
  const systemLanguage = getSystemLanguage(acceptLanguageHeader);
  console.log(`[determineLanguage] No cookie, using system language: ${systemLanguage}`);
  return systemLanguage;
}

/**
 * Determine language in middleware context (using getToken instead of getServerSession)
 */
export async function determineLanguageInMiddleware(
  request: NextRequest
): Promise<SupportedLocale> {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  
  // Try to get user token
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // If user is logged in
  if (token?.id) {
    const userLanguage = await getUserLanguage(token.id as string);
    
    // Priority 1: User preference in DB (highest priority)
    if (userLanguage) {
      return userLanguage;
    }
    
    // Priority 2: Cookie (if user has no preference, use cookie and save it)
    if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as SupportedLocale)) {
      // Save cookie preference to user preference in DB
      try {
        await prisma.user.update({
          where: { id: token.id as string },
          data: { language: cookieLocale as SupportedLocale },
        });
        console.log(`[Middleware] Saved cookie language (${cookieLocale}) to user ${token.id} preference`);
      } catch (error) {
        console.error('Error saving language to user preference:', error);
      }
      return cookieLocale as SupportedLocale;
    }
    
    // Priority 3: System language (if no cookie, detect and save)
    const acceptLanguage = request.headers.get('accept-language');
    const systemLanguage = getSystemLanguage(acceptLanguage);
    
    try {
      await prisma.user.update({
        where: { id: token.id as string },
        data: { language: systemLanguage },
      });
      console.log(`[Middleware] Saved system language (${systemLanguage}) to user ${token.id} preference`);
    } catch (error) {
      console.error('Error saving system language to user preference:', error);
    }
    
    return systemLanguage;
  }
  
  // User not logged in
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as SupportedLocale)) {
    return cookieLocale as SupportedLocale;
  }
  
  // No cookie, detect system language
  const acceptLanguage = request.headers.get('accept-language');
  return getSystemLanguage(acceptLanguage);
}

/**
 * Save language preference
 * - If user is logged in: save to database
 * - Always: save to cookies
 */
export async function saveLanguagePreference(
  locale: SupportedLocale,
  userId?: string
): Promise<void> {
  // Save to cookies
  const cookieStore = await cookies();
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });
  
  // Save to user preference if logged in
  if (userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { language: locale },
      });
      console.log(`Saved language preference (${locale}) to user ${userId}`);
    } catch (error) {
      console.error('Error saving language to user preference:', error);
      throw error; // Re-throw to let API route handle it
    }
  }
}

