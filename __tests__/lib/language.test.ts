import { describe, it, expect, vi, beforeEach } from 'vitest';
import { determineLanguage, saveLanguagePreference, getUserLanguage, getLanguageFromCookies } from '@/lib/language';
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

describe('lib/language', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to ensure clean state
    vi.resetAllMocks();
  });

  describe('getUserLanguage', () => {
    it('should return user language from database', async () => {
      const mockUser = { language: 'fr' };
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

      const language = await getUserLanguage('user-123');

      expect(language).toBe('fr');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { language: true },
      });
    });

    it('should return null if user has no language', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ language: null } as any);

      const language = await getUserLanguage('user-123');

      expect(language).toBeNull();
    });
  });

  describe('getLanguageFromCookies', () => {
    it('should return language from cookie', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'fr' }),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const language = await getLanguageFromCookies();

      expect(language).toBe('fr');
    });

    it('should return null if no cookie', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const language = await getLanguageFromCookies();

      expect(language).toBeNull();
    });
  });

  describe('determineLanguage', () => {
    it('should return user language from DB when logged in', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ language: 'fr' } as any);

      const language = await determineLanguage();

      expect(language).toBe('fr');
    });

    it('should use cookie language and save to DB if user has no DB preference', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'en' }),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ language: null } as any) // No language in DB
        .mockResolvedValueOnce({ language: 'en' } as any); // After update
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const language = await determineLanguage();

      expect(language).toBe('en');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { language: 'en' },
      });
    });

    it('should use system language and save to DB if no cookie and user logged in', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      // Mock cookieStore that returns undefined for NEXT_LOCALE (no cookie)
      // This ensures getLanguageFromCookies returns null
      const mockCookieStore = {
        get: vi.fn((name: string) => {
          // Explicitly return undefined to simulate no cookie
          return undefined;
        }),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      // Return the same mockCookieStore for all calls to cookies()
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      // First call: getUserLanguage (no language in DB)
      // Second call: getLanguageFromCookies will call cookies() again, so we need to return the same mock
      vi.mocked(prisma.user.findUnique)
        .mockResolvedValueOnce({ language: null } as any) // No language in DB
        .mockResolvedValueOnce({ language: null } as any); // After getLanguageFromCookies check
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const language = await determineLanguage('en-US,en;q=0.9');

      expect(language).toBe('en');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { language: 'en' },
      });
    });

    it('should detect French from Accept-Language header', async () => {
      const mockSession = {
        user: { id: 'user-123' },
      };
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(mockSession as any);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({ language: null } as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      const language = await determineLanguage('fr-FR,fr;q=0.9,en-US;q=0.8');

      expect(language).toBe('fr');
    });

    it('should use cookie language when not logged in', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue({ value: 'fr' }),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const language = await determineLanguage();

      expect(language).toBe('fr');
    });

    it('should use system language when not logged in and no cookie', async () => {
      const mockCookieStore = {
        get: vi.fn().mockReturnValue(undefined),
        getAll: vi.fn().mockReturnValue([]),
      };

      vi.mocked(getServerSession).mockResolvedValue(null);
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      const language = await determineLanguage('en-US,en;q=0.9');

      expect(language).toBe('en');
    });
  });

  describe('saveLanguagePreference', () => {
    it('should save language to cookie and DB when user is logged in', async () => {
      const mockCookieStore = {
        set: vi.fn(),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);
      vi.mocked(prisma.user.update).mockResolvedValue({} as any);

      await saveLanguagePreference('fr', 'user-123');

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'NEXT_LOCALE',
        'fr',
        expect.objectContaining({
          path: '/',
          maxAge: 60 * 60 * 24 * 365,
          sameSite: 'lax',
        })
      );
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { language: 'fr' },
      });
    });

    it('should only save to cookie when user is not logged in', async () => {
      const mockCookieStore = {
        set: vi.fn(),
      };
      vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

      await saveLanguagePreference('en');

      expect(mockCookieStore.set).toHaveBeenCalled();
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });
});

