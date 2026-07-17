import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthSession } from '@toonexpo/contracts';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';

import { assertAdminSession } from './assert-admin-session';

const ADMIN_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'BIGPROJECTS_ADMIN',
  },
} as AuthSession;

const BUYER_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'buyer-1',
    email: 'buyer@example.com',
    name: 'Buyer User',
    role: 'BUYER',
  },
} as AuthSession;

describe('assertAdminSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(assertAdminSession()).resolves.toBeNull();
  });

  it('returns null when the user is not BIGPROJECTS_ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue(BUYER_SESSION as never);

    await expect(assertAdminSession()).resolves.toBeNull();
  });

  it('returns the session for BIGPROJECTS_ADMIN', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never);

    await expect(assertAdminSession()).resolves.toEqual(ADMIN_SESSION);
  });
});
