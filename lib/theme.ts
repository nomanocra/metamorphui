import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { headers } from 'next/headers';

export type SupportedTheme = 'light' | 'dark' | 'system';

const DEFAULT_THEME: SupportedTheme = 'system';
const SUPPORTED_THEMES: SupportedTheme[] = ['light', 'dark', 'system'];

/**
 * Get user theme preference from database
 */
export async function getUserTheme(
  userId: string
): Promise<SupportedTheme | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { theme: true },
    });

    if (
      user?.theme &&
      SUPPORTED_THEMES.includes(user.theme as SupportedTheme)
    ) {
      return user.theme as SupportedTheme;
    }

    return null;
  } catch (error) {
    console.error('Error fetching user theme:', error);
    return null;
  }
}

/**
 * Get theme from cookies
 */
export async function getThemeFromCookie(): Promise<SupportedTheme | null> {
  try {
    const cookieStore = await cookies();
    const cookieTheme = cookieStore.get('NEXT_THEME')?.value;

    if (
      cookieTheme &&
      SUPPORTED_THEMES.includes(cookieTheme as SupportedTheme)
    ) {
      return cookieTheme as SupportedTheme;
    }

    return null;
  } catch (error) {
    console.error('Error reading theme cookie:', error);
    return null;
  }
}

/**
 * Get system/browser theme preference from prefers-color-scheme header
 * Note: This header is not always available server-side, so we default to 'system'
 */
export function getSystemTheme(
  prefersColorSchemeHeader?: string | null
): SupportedTheme {
  if (!prefersColorSchemeHeader) {
    return DEFAULT_THEME; // Default to 'system' if header not available
  }

  // Parse prefers-color-scheme header (e.g., "dark", "light", "no-preference")
  const prefersDark = prefersColorSchemeHeader.toLowerCase().includes('dark');
  const prefersLight = prefersColorSchemeHeader.toLowerCase().includes('light');

  // If explicit preference, we could return 'light' or 'dark'
  // But since we support 'system', we return 'system' to let the browser handle it
  // The actual resolved theme will be determined client-side by next-themes
  return DEFAULT_THEME;
}

/**
 * Determine theme with priority: user preference > cookies > system theme
 * For server-side context (uses getServerSession)
 */
export async function determineTheme(
  prefersColorSchemeHeader?: string | null
): Promise<SupportedTheme> {
  // Try to get session - getServerSession should work in server components
  const session = await getServerSession(authOptions);

  // Also try to get token from cookies as fallback (more reliable in some contexts)
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');

  let userId: string | null = null;

  if (session?.user?.id) {
    userId = session.user.id;
    console.log(
      '[determineTheme] Session found via getServerSession, User ID:',
      userId
    );
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
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (token?.id) {
        userId = token.id as string;
        console.log(
          '[determineTheme] Session found via token, User ID:',
          userId
        );
      }
    } catch (error) {
      console.log(
        '[determineTheme] Could not decode token (this is normal if not logged in):',
        error instanceof Error ? error.message : error
      );
    }
  }

  console.log('[determineTheme] Final User ID:', userId || 'No user');

  // If user is logged in
  if (userId) {
    const userTheme = await getUserTheme(userId);
    console.log(`[determineTheme] User ${userId} theme from DB:`, userTheme);

    // Priority 1: User preference in DB (highest priority)
    if (userTheme) {
      console.log(
        `[determineTheme] Using user preference from DB: ${userTheme}`
      );
      return userTheme;
    }

    // Priority 2: Cookie (if user has no preference, use cookie and save it)
    const cookieTheme = await getThemeFromCookie();
    console.log(`[determineTheme] Cookie theme:`, cookieTheme);

    if (cookieTheme) {
      console.log(
        `[determineTheme] User has no DB preference, using cookie (${cookieTheme}) and saving to DB`
      );
      // Save cookie preference to user preference in DB
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { theme: cookieTheme },
        });
        console.log(
          `[determineTheme] Saved cookie theme (${cookieTheme}) to user ${userId} preference`
        );
      } catch (error) {
        console.error(
          '[determineTheme] Error saving theme to user preference:',
          error
        );
      }
      return cookieTheme;
    }

    // Priority 3: System theme (if no cookie, detect and save)
    const systemTheme = getSystemTheme(prefersColorSchemeHeader);

    try {
      await prisma.user.update({
        where: { id: userId },
        data: { theme: systemTheme },
      });
      console.log(
        `[determineTheme] Saved system theme (${systemTheme}) to user ${userId} preference`
      );
    } catch (error) {
      console.error('Error saving system theme to user preference:', error);
    }

    return systemTheme;
  }

  // User not logged in
  console.log('[determineTheme] User not logged in, checking cookies');
  const cookieTheme = await getThemeFromCookie();

  if (cookieTheme) {
    console.log(`[determineTheme] Using cookie theme: ${cookieTheme}`);
    return cookieTheme;
  }

  // No cookie, detect system theme
  const systemTheme = getSystemTheme(prefersColorSchemeHeader);
  console.log(`[determineTheme] No cookie, using system theme: ${systemTheme}`);
  return systemTheme;
}

/**
 * Determine theme in middleware context (using getToken instead of getServerSession)
 */
export async function determineThemeInMiddleware(
  request: NextRequest
): Promise<SupportedTheme> {
  const cookieTheme = request.cookies.get('NEXT_THEME')?.value;

  // Try to get user token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If user is logged in
  if (token?.id) {
    const userTheme = await getUserTheme(token.id as string);

    // Priority 1: User preference in DB (highest priority)
    if (userTheme) {
      return userTheme;
    }

    // Priority 2: Cookie (if user has no preference, use cookie and save it)
    if (
      cookieTheme &&
      SUPPORTED_THEMES.includes(cookieTheme as SupportedTheme)
    ) {
      // Save cookie preference to user preference in DB
      try {
        await prisma.user.update({
          where: { id: token.id as string },
          data: { theme: cookieTheme as SupportedTheme },
        });
        console.log(
          `[Middleware] Saved cookie theme (${cookieTheme}) to user ${token.id} preference`
        );
      } catch (error) {
        console.error('Error saving theme to user preference:', error);
      }
      return cookieTheme as SupportedTheme;
    }

    // Priority 3: System theme (if no cookie, detect and save)
    const prefersColorScheme = request.headers.get('prefers-color-scheme');
    const systemTheme = getSystemTheme(prefersColorScheme);

    try {
      await prisma.user.update({
        where: { id: token.id as string },
        data: { theme: systemTheme },
      });
      console.log(
        `[Middleware] Saved system theme (${systemTheme}) to user ${token.id} preference`
      );
    } catch (error) {
      console.error('Error saving system theme to user preference:', error);
    }

    return systemTheme;
  }

  // User not logged in
  if (cookieTheme && SUPPORTED_THEMES.includes(cookieTheme as SupportedTheme)) {
    return cookieTheme as SupportedTheme;
  }

  // No cookie, detect system theme
  const prefersColorScheme = request.headers.get('prefers-color-scheme');
  return getSystemTheme(prefersColorScheme);
}

/**
 * Save theme preference
 * - If user is logged in: save to database
 * - Always: save to cookies
 */
export async function saveThemePreference(
  theme: SupportedTheme,
  userId?: string
): Promise<void> {
  // Save to cookies
  const cookieStore = await cookies();
  cookieStore.set('NEXT_THEME', theme, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: 'lax',
  });

  // Save to user preference if logged in
  if (userId) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { theme: theme },
      });
      console.log(`Saved theme preference (${theme}) to user ${userId}`);
    } catch (error) {
      console.error('Error saving theme to user preference:', error);
      throw error; // Re-throw to let API route handle it
    }
  }
}
