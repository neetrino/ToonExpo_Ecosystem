import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = vi.fn();
const mockToggleFavorite = vi.fn();
const mockAssertNotRateLimited = vi.fn();

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/favorites/mutations', () => ({
  toggleFavorite: (...args: unknown[]) => mockToggleFavorite(...args),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  assertNotRateLimited: (...args: unknown[]) => mockAssertNotRateLimited(...args),
}));

import { toggleFavoriteAction } from './actions';

const TARGET = {
  targetType: 'PROJECT' as const,
  targetId: 'clxxxxxxxxxxxxxxxxxxxx',
};

describe('toggleFavoriteAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAssertNotRateLimited.mockResolvedValue({ limited: false });
  });

  it('denies non-buyer sessions', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'u1', role: 'BUILDER' } });

    const result = await toggleFavoriteAction(TARGET);

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });

  it('denies missing session', async () => {
    mockAuth.mockResolvedValue(null);

    await expect(toggleFavoriteAction(TARGET)).resolves.toEqual({
      ok: false,
      errorKey: 'unauthorized',
    });
  });

  it('delegates to toggleFavorite for BUYER', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'buyer-1', role: 'BUYER' } });
    mockToggleFavorite.mockResolvedValue({ ok: true, favorited: true });

    const result = await toggleFavoriteAction(TARGET);

    expect(result).toEqual({ ok: true, favorited: true });
    expect(mockAssertNotRateLimited).toHaveBeenCalledWith('favoriteToggle', 'buyer-1');
    expect(mockToggleFavorite).toHaveBeenCalledWith('buyer-1', TARGET);
  });

  it('returns rateLimited when limited', async () => {
    mockAuth.mockResolvedValue({ user: { id: 'buyer-1', role: 'BUYER' } });
    mockAssertNotRateLimited.mockResolvedValue({ limited: true, errorKey: 'rateLimited' });

    const result = await toggleFavoriteAction(TARGET);

    expect(result).toEqual({ ok: false, errorKey: 'rateLimited' });
    expect(mockToggleFavorite).not.toHaveBeenCalled();
  });
});
