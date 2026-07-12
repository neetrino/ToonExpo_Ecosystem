import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/buyer/profile-mutations', () => ({
  updateBuyerProfile: vi.fn(),
}));

import { auth } from '@/auth';
import { updateBuyerProfile } from '@/lib/buyer/profile-mutations';

import { updateBuyerProfileAction } from './actions';

describe('updateBuyerProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized without a session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    const result = await updateBuyerProfileAction('en', {
      name: 'Anna',
      phone: '+37491111111',
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(updateBuyerProfile).not.toHaveBeenCalled();
  });

  it('ignores email and role fields via schema whitelist', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'user-1', email: 'anna@example.com', name: 'Anna', role: 'BUYER' },
      expires: '2099-01-01',
    } as never);
    vi.mocked(updateBuyerProfile).mockResolvedValue({ ok: true });

    await updateBuyerProfileAction('en', {
      name: 'Anna Updated',
      email: 'hacker@example.com',
      role: 'BIGPROJECTS_ADMIN',
    });

    expect(updateBuyerProfile).toHaveBeenCalledWith('user-1', { name: 'Anna Updated' });
  });
});
