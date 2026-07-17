import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockUpdateBuyerProfile = vi.fn();

vi.mock('@/lib/buyer/profile-mutations', () => ({
  updateBuyerProfile: (...args: unknown[]) => mockUpdateBuyerProfile(...args),
}));

import { updateBuyerProfileAction } from './actions';

describe('updateBuyerProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns invalidInput for malformed data', async () => {
    const result = await updateBuyerProfileAction('en', { name: '' });

    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(mockUpdateBuyerProfile).not.toHaveBeenCalled();
  });

  it('preserves authorization failures from Nest', async () => {
    mockUpdateBuyerProfile.mockResolvedValue({ ok: false, errorKey: 'unauthorized' });
    const result = await updateBuyerProfileAction('en', { name: 'Buyer' });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
  });

  it('delegates validated input to the API wrapper', async () => {
    mockUpdateBuyerProfile.mockResolvedValue({ ok: true });

    const result = await updateBuyerProfileAction('en', {
      name: 'Buyer Name',
      phone: '+37491111111',
    });

    expect(result).toEqual({ ok: true });
    expect(mockUpdateBuyerProfile).toHaveBeenCalledWith({
      name: 'Buyer Name',
      phone: '+37491111111',
    });
  });
});
