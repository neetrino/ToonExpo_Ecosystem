import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@toonexpo/db', () => ({
  prisma: {
    user: {
      updateMany: vi.fn(),
    },
  },
}));

import { prisma } from '@toonexpo/db';

import { updateBuyerProfile } from './profile-mutations';

describe('updateBuyerProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates name and phone for buyer user', async () => {
    vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 1 });

    const result = await updateBuyerProfile('user-1', {
      name: 'Updated Name',
      phone: '+37491111111',
    });

    expect(result).toEqual({ ok: true });
    expect(prisma.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'user-1', role: 'BUYER' },
      data: { name: 'Updated Name', phone: '+37491111111' },
    });
  });

  it('returns notFound when user is not a buyer', async () => {
    vi.mocked(prisma.user.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateBuyerProfile('user-foreign', {
      name: 'Updated Name',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });
});
