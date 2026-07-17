import { describe, expect, it, vi } from 'vitest';

import { AuthService, type AuthMutationResult } from './auth.service';
import { verifyPassword } from './password';
import type { SessionService } from './session.service';

vi.mock('./password', () => ({
  hashPassword: vi.fn(async () => 'hashed'),
  verifyPassword: vi.fn(async () => true),
}));

function createAuthService(overrides?: {
  findUnique?: ReturnType<typeof vi.fn>;
  createSession?: ReturnType<typeof vi.fn>;
}): AuthService {
  const prisma = {
    client: {
      user: {
        findUnique: overrides?.findUnique ?? vi.fn().mockResolvedValue(null),
      },
    },
  };

  const sessions = {
    toAuthUser: vi.fn((user: { id: string; email: string; name: string | null; image: string | null; role: string }) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
    })),
    createSession:
      overrides?.createSession ??
      vi.fn(async () => ({
        sessionToken: 'session-token',
        expires: new Date('2030-01-01T00:00:00.000Z'),
      })),
    deleteSession: vi.fn(),
    resolveSession: vi.fn(),
    ensureBuyerQr: vi.fn(),
  } as unknown as SessionService;

  return new AuthService(prisma as never, sessions);
}

describe('AuthService.login', () => {
  it('returns INVALID_CREDENTIALS when the user is missing', async () => {
    const auth = createAuthService();
    const result = await auth.login({ email: 'a@example.com', password: 'sup3rsecret' });
    expect(result).toEqual({ ok: false, code: 'INVALID_CREDENTIALS' } satisfies AuthMutationResult);
  });

  it('creates a session when credentials are valid', async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: 'u1',
      email: 'a@example.com',
      name: 'Ada',
      image: null,
      role: 'BUYER',
      passwordHash: 'hashed',
    });
    vi.mocked(verifyPassword).mockResolvedValue(true);
    const auth = createAuthService({ findUnique });

    const result = await auth.login({ email: 'a@example.com', password: 'sup3rsecret' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.sessionToken).toBe('session-token');
      expect(result.session.user.email).toBe('a@example.com');
    }
  });
});
