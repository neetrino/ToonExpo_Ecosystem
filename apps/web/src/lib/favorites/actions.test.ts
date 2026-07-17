import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockapiRequest = vi.fn();

vi.mock('../api/client', () => ({
  apiRequest: (...args: unknown[]) => mockapiRequest(...args),
}));

import { ApiClientError } from '../api/errors';

import { toggleFavoriteAction } from './actions';

const TARGET = {
  targetType: 'PROJECT' as const,
  targetId: 'clxxxxxxxxxxxxxxxxxxxx',
};

describe('toggleFavoriteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid input before calling the API', async () => {
    const result = await toggleFavoriteAction({ targetType: 'PROJECT', targetId: 'invalid' });

    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(mockapiRequest).not.toHaveBeenCalled();
  });

  it('delegates a valid toggle to Nest', async () => {
    mockapiRequest.mockResolvedValue({ favorited: true });

    const result = await toggleFavoriteAction(TARGET);

    expect(result).toEqual({ ok: true, favorited: true });
    expect(mockapiRequest).toHaveBeenCalledWith('/favorites/toggle', {
      method: 'POST',
      body: TARGET,
    });
  });

  it('preserves API rate-limit errors', async () => {
    mockapiRequest.mockRejectedValue(
      new ApiClientError(429, 'UNKNOWN', 'Too many requests', { error: 'rateLimited' }),
    );

    const result = await toggleFavoriteAction(TARGET);

    expect(result).toEqual({ ok: false, errorKey: 'rateLimited' });
  });
});
