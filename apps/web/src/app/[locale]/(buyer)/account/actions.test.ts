import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAuth = vi.fn();
const mockUpdateBuyerProfile = vi.fn();

vi.mock('@/auth', () => ({
  auth: () => mockAuth(),
}));

vi.mock('@/lib/buyer/profile-mutations', () => ({
  updateBuyerProfile: (...args: unknown[]) => mockUpdateBuyerProfile(...args),
}));

import { updateBuyerProfileAction } from './actions';

describe('updateBuyerProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when session is missing', async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateBuyerProfileAction('en', { name: 'Buyer' });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(mockUpdateBuyerProfile).not.toHaveBeenCalled();
  });

  it('returns unauthorized when role is not BUYER', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-builder', role: 'BUILDER' },
    });

    const result = await updateBuyerProfileAction('en', { name: 'Builder' });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(mockUpdateBuyerProfile).not.toHaveBeenCalled();
  });

  it('delegates to updateBuyerProfile for BUYER sessions', async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-buyer', role: 'BUYER' },
    });
    mockUpdateBuyerProfile.mockResolvedValue({ ok: true });

    const result = await updateBuyerProfileAction('en', {
      name: 'Buyer Name',
      phone: '+37491111111',
    });

    expect(result).toEqual({ ok: true });
    expect(mockUpdateBuyerProfile).toHaveBeenCalledWith('user-buyer', {
      name: 'Buyer Name',
      phone: '+37491111111',
    });
  });
});
