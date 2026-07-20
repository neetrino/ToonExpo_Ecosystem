import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api/errors';

import { getMeOrNull } from './auth-api';

vi.mock('@/shared/api/client', () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from '@/shared/api/client';

const mockedApiFetch = vi.mocked(apiFetch);

describe('getMeOrNull', () => {
  it('skips the network when no session cookie hint is present', async () => {
    await expect(getMeOrNull()).resolves.toBeNull();
    expect(mockedApiFetch).not.toHaveBeenCalled();
  });

  it('returns the user when authenticated', async () => {
    const user = {
      id: 'user-1',
      name: 'Ani',
      email: 'ani@example.com',
      phone: '+37491111222',
      accountType: 'buyer' as const,
      status: 'active' as const,
      defaultLocale: 'hy',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };
    mockedApiFetch.mockResolvedValueOnce(user);

    await expect(getMeOrNull('toonexpo_session=abc')).resolves.toEqual(user);
    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/auth/me',
        headers: { Cookie: 'toonexpo_session=abc' },
      }),
    );
  });

  it('returns null on 204 (anonymous with cookie present)', async () => {
    mockedApiFetch.mockResolvedValueOnce(undefined);

    await expect(getMeOrNull('toonexpo_session=stale')).resolves.toBeNull();
  });

  it('returns null on legacy 401', async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError(401, 'Unauthorized'));

    await expect(getMeOrNull('toonexpo_session=stale')).resolves.toBeNull();
  });

  it('rethrows non-401 errors', async () => {
    mockedApiFetch.mockRejectedValueOnce(new ApiError(500, 'Server Error'));

    await expect(getMeOrNull('toonexpo_session=abc')).rejects.toMatchObject({
      status: 500,
    });
  });
});
