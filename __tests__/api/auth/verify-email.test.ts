import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/auth/verify-email/route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    verificationToken: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('GET /api/auth/verify-email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should verify email successfully with valid token', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 24);

    const mockToken = {
      token: 'valid-token-123',
      identifier: 'test@example.com',
      expires: futureDate,
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      emailVerified: null,
      name: 'Test User',
      password: 'hashed',
      theme: 'system',
      language: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(mockToken);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
    vi.mocked(prisma.user.update).mockResolvedValue({
      ...mockUser,
      emailVerified: new Date(),
    });
    vi.mocked(prisma.verificationToken.delete).mockResolvedValue(mockToken);

    const request = new Request('http://localhost/api/auth/verify-email?token=valid-token-123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toContain('vérifié avec succès');
    expect(prisma.verificationToken.findUnique).toHaveBeenCalledWith({
      where: { token: 'valid-token-123' },
    });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { emailVerified: expect.any(Date) },
    });
    expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { token: 'valid-token-123' },
    });
  });

  it('should return 400 if token is missing', async () => {
    const request = new Request('http://localhost/api/auth/verify-email');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Token de vérification manquant');
    expect(prisma.verificationToken.findUnique).not.toHaveBeenCalled();
  });

  it('should return 400 if token is invalid', async () => {
    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost/api/auth/verify-email?token=invalid-token');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Token de vérification invalide');
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('should return 400 if token is expired', async () => {
    const pastDate = new Date();
    pastDate.setHours(pastDate.getHours() - 1); // Expired 1 hour ago

    const mockToken = {
      token: 'expired-token-123',
      identifier: 'test@example.com',
      expires: pastDate,
    };

    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(mockToken);
    vi.mocked(prisma.verificationToken.delete).mockResolvedValue(mockToken);

    const request = new Request('http://localhost/api/auth/verify-email?token=expired-token-123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('expiré');
    expect(prisma.verificationToken.delete).toHaveBeenCalledWith({
      where: { token: 'expired-token-123' },
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should return 404 if user is not found', async () => {
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 24);

    const mockToken = {
      token: 'valid-token-123',
      identifier: 'test@example.com',
      expires: futureDate,
    };

    vi.mocked(prisma.verificationToken.findUnique).mockResolvedValue(mockToken);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const request = new Request('http://localhost/api/auth/verify-email?token=valid-token-123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('Utilisateur introuvable');
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.verificationToken.findUnique).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/auth/verify-email?token=valid-token-123');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('erreur est survenue');
  });
});

