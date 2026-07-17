import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock('../../common/prisma.service', () => ({
  PrismaService: class {
    client = {
      user: {
        findFirst: mocks.findFirst,
        updateMany: mocks.updateMany,
      },
    };
  },
}));

import { PrismaService } from '../../common/prisma.service';
import { BuyerService } from './buyer.service';

describe('BuyerService', () => {
  let service: BuyerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BuyerService(new PrismaService());
  });

  it('loads only a buyer profile', async () => {
    const profile = { name: 'Buyer', email: 'buyer@example.com', phone: null };
    mocks.findFirst.mockResolvedValue(profile);

    await expect(service.getProfile('buyer-1')).resolves.toEqual(profile);
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { id: 'buyer-1', role: 'BUYER' },
      select: { name: true, email: true, phone: true },
    });
  });

  it('returns null when no buyer row is updated', async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.updateProfile('builder-1', { name: 'Builder' })).resolves.toBeNull();
  });
});
