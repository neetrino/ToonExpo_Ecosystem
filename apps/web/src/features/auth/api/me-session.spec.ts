import type { UserResponse } from '@toonexpo/contracts';
import { describe, expect, it, vi } from 'vitest';

import { ApiError, ApiNetworkError } from '@/shared/api/errors';

import { lookupMeSession } from './me-session';

const user = { id: 'usr_1' } as UserResponse;

describe('lookupMeSession', () => {
  it('returns a ready session when /auth/me succeeds', async () => {
    await expect(lookupMeSession(async () => user)).resolves.toEqual({
      status: 'ready',
      user,
    });
  });

  it('returns ready with null when the visitor is logged out', async () => {
    await expect(lookupMeSession(async () => null)).resolves.toEqual({
      status: 'ready',
      user: null,
    });
  });

  it('returns unavailable when the API cannot be reached', async () => {
    const load = vi.fn(async () => {
      throw new ApiNetworkError();
    });

    await expect(lookupMeSession(load)).resolves.toEqual({ status: 'unavailable' });
  });

  it('rethrows non-network API failures', async () => {
    const error = new ApiError(500, 'Server Error');

    await expect(
      lookupMeSession(async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });
});
