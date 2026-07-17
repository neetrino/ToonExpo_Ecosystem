import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockServerApiRequest = vi.fn();

vi.mock('@/lib/api/server', () => ({
  serverApiRequest: (...args: unknown[]) => mockServerApiRequest(...args),
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
    expect(mockServerApiRequest).not.toHaveBeenCalled();
  });

  it('delegates a valid toggle to Nest', async () => {
    mockServerApiRequest.mockResolvedValue({ favorited: true });

    const result = await toggleFavoriteAction(TARGET);

    expect(result).toEqual({ ok: true, favorited: true });
    expect(mockServerApiRequest).toHaveBeenCalledWith('/favorites/toggle', {
      method: 'POST',
      body: TARGET,
    });
  });

  it('preserves API rate-limit errors', async () => {
    mockServerApiRequest.mockRejectedValue(
      new ApiClientError(429, 'UNKNOWN', 'Too many requests', { error: 'rateLimited' }),
    );

    const result = await toggleFavoriteAction(TARGET);

    expect(result).toEqual({ ok: false, errorKey: 'rateLimited' });
  });
});
