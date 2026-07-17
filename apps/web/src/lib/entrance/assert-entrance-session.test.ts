import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthSession } from '@toonexpo/contracts';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';

import { assertEntranceSession } from './assert-entrance-session';

const ENTRANCE_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'entrance-1',
    email: 'entrance@example.com',
    name: 'Entrance Staff',
    role: 'ENTRANCE_STAFF',
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

const ADMIN_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'BIGPROJECTS_ADMIN',
  },
} as AuthSession;

const BUILDER_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'builder-1',
    email: 'builder@example.com',
    name: 'Builder User',
    role: 'BUILDER',
  },
} as AuthSession;

describe('assertEntranceSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(assertEntranceSession()).resolves.toBeNull();
  });

  it('returns null for non-entrance roles', async () => {
    vi.mocked(auth).mockResolvedValue(BUYER_SESSION as never);
    await expect(assertEntranceSession()).resolves.toBeNull();

    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never);
    await expect(assertEntranceSession()).resolves.toBeNull();

    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    await expect(assertEntranceSession()).resolves.toBeNull();
  });

  it('returns the session for ENTRANCE_STAFF', async () => {
    vi.mocked(auth).mockResolvedValue(ENTRANCE_SESSION as never);

    await expect(assertEntranceSession()).resolves.toEqual(ENTRANCE_SESSION);
  });
});
