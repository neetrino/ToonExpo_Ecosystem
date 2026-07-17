import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockServerApiRequest = vi.fn();

vi.mock('../api/server', () => ({
  serverApiRequest: (...args: unknown[]) => mockServerApiRequest(...args),
}));

import { ApiClientError } from '../api/errors';

import { getBuyerProfile, updateBuyerProfile } from './profile-mutations';

describe('updateBuyerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates name and phone through Nest', async () => {
    mockServerApiRequest.mockResolvedValue({ ok: true });

    const result = await updateBuyerProfile({
      name: 'Updated Name',
      phone: '+37491111111',
    });

    expect(result).toEqual({ ok: true });
    expect(mockServerApiRequest).toHaveBeenCalledWith('/buyer/profile', {
      method: 'PATCH',
      body: { name: 'Updated Name', phone: '+37491111111' },
    });
  });

  it('preserves notFound from Nest', async () => {
    mockServerApiRequest.mockRejectedValue(
      new ApiClientError(404, 'UNKNOWN', 'Not found', { error: 'notFound' }),
    );

    const result = await updateBuyerProfile({ name: 'Updated Name' });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('loads and validates the buyer profile through Nest', async () => {
    const profile = { name: 'Buyer', email: 'buyer@example.com', phone: null };
    mockServerApiRequest.mockResolvedValue(profile);

    await expect(getBuyerProfile()).resolves.toEqual(profile);
  });
});
