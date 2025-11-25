import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/signup/route';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    verificationToken: {
      create: vi.fn(),
    },
  },
}));

// Mock email service
vi.mock('@/lib/email', () => ({
  sendVerificationEmail: vi.fn(),
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

describe('POST /api/auth/signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new user successfully', async () => {
    // Mock: user doesn't exist
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    // Mock: user creation
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      emailVerified: null,
      theme: 'system',
      language: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
    
    // Mock: verification token creation
    vi.mocked(prisma.verificationToken.create).mockResolvedValue({
      identifier: 'test@example.com',
      token: 'token-123',
      expires: new Date(),
    });
    
    // Mock: bcrypt hash
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    
    // Mock: email sent successfully
    vi.mocked(sendVerificationEmail).mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.message).toContain('Compte créé avec succès');
    expect(data.requiresVerification).toBe(true);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(prisma.user.create).toHaveBeenCalled();
    expect(sendVerificationEmail).toHaveBeenCalled();
  });

  it('should return 400 if email is missing', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Email et mot de passe requis');
  });

  it('should return 400 if password is missing', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Email et mot de passe requis');
  });

  it('should return 400 if password is too short', async () => {
    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: '12345', // Less than 6 characters
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('6 caractères');
  });

  it('should return 400 if user already exists and email is verified', async () => {
    const existingUser = {
      id: 'user-123',
      email: 'test@example.com',
      emailVerified: new Date(),
      name: 'Existing User',
      password: 'hashed',
      theme: 'system',
      language: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('existe déjà');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should return 400 if user exists but email is not verified', async () => {
    const existingUser = {
      id: 'user-123',
      email: 'test@example.com',
      emailVerified: null, // Not verified
      name: 'Existing User',
      password: 'hashed',
      theme: 'system',
      language: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);

    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('n\'a pas été vérifié');
    expect(data.requiresVerification).toBe(true);
    expect(data.resendVerificationUrl).toBe('/resend-verification');
  });

  it('should still create user if email sending fails', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: null,
      password: 'hashed-password',
      emailVerified: null,
      theme: 'system',
      language: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
    vi.mocked(prisma.verificationToken.create).mockResolvedValue({
      identifier: 'test@example.com',
      token: 'token-123',
      expires: new Date(),
    });
    vi.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    
    // Mock: email sending fails
    vi.mocked(sendVerificationEmail).mockRejectedValue(new Error('Email service unavailable'));

    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    // Should still succeed even if email fails
    expect(response.status).toBe(201);
    expect(data.requiresVerification).toBe(true);
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should return 500 on database error', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('Database error'));

    const request = new Request('http://localhost/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('erreur est survenue');
  });
});

