import { describe, it, expect, vi, beforeEach } from 'vitest';
import { determineTheme, saveThemePreference, getUserTheme, getThemeFromCookie } from '@/lib/theme';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';
import { getToken } from 'next-auth/jwt';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
  headers: vi.fn(),
}));

// Mock next-auth/jwt
vi.mock('next-auth/jwt', () => ({
  getToken: vi.fn(),
}));

describe('lib/theme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to ensure clean state
    vi.resetAllMocks();
  });

  describe('getUserTheme', () => {
    it('should return user theme from database', async () => {
      const mockUser = { theme: 'dark' };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const theme = await getUserTheme('user-123');

      expect(theme).toBe('dark');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { theme: true },
      });
    });

    it('should return null if user has no theme', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ theme: null } as any);

      const theme = await getUserTheme('user-123');

      expect(theme).toBeNull();
    });

    it('should return null on error', async () => {
      vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB error'));

      const theme = await getUserTheme('user-123');

      expect(theme).toBeNull();
    });
  });

  describe('getThemeFromCookie', () => {
    it('should return theme from cookie', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'dark' }),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const theme = await getThemeFromCookie();

      expect(theme).toBe('dark');
    });

    it('should return null if no cookie', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const theme = await getThemeFromCookie();

      expect(theme).toBeNull();
    });
  });

  describe('determineTheme', () => {
    it('should return user theme from DB when logged in', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ theme: 'dark' } as any);

      const theme = await determineTheme();

      expect(theme).toBe('dark');
    });

    it('should use cookie theme and save to DB if user has no DB preference', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'light' }),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ theme: null } as any) // No theme in DB
        .mockResolvedValueOnce({ theme: 'light' } as any); // After update
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const theme = await determineTheme();

      expect(theme).toBe('light');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { theme: 'light' },
      });
    });

    it('should use system theme and save to DB if no cookie and user logged in', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      // Mock cookieStore that returns undefined for NEXT_THEME (no cookie)
      // This ensures getThemeFromCookie returns null
      const mockCookieStore = {
        get: vi.fn((name: string) => {
          // Explicitly return undefined for NEXT_THEME to simulate no cookie
          return undefined;
        }),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      // Return the same mockCookieStore for all calls to cookies()
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      // First call: getUserTheme (no theme in DB)
      // Second call: getThemeFromCookie will call cookies() again, so we need to return the same mock
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ theme: null } as any) // No theme in DB
        .mockResolvedValueOnce({ theme: null } as any); // After getThemeFromCookie check
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const theme = await determineTheme();

      expect(theme).toBe('system');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { theme: 'system' },
      });
    });

    it('should use cookie theme when not logged in', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'dark' }),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const theme = await determineTheme();

      expect(theme).toBe('dark');
    });

    it('should use system theme when not logged in and no cookie', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const theme = await determineTheme();

      expect(theme).toBe('system');
    });
  });

  describe('saveThemePreference', () => {
    it('should save theme to cookie and DB when user is logged in', async () => {
      const mockCookieStore = {
        set: vi.fn(),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await saveThemePreference('dark', 'user-123');

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'NEXT_THEME',
        'dark',
        expect.objectContaining({
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax',
        })
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { theme: 'dark' },
      });
    });

    it('should only save to cookie when user is not logged in', async () => {
      const mockCookieStore = {
        set: vi.fn(),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      await saveThemePreference('light');

      expect(mockCookieStore.set).toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});

