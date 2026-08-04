import { describe, expect, it, vi } from 'vitest';
import { PublicationStatus } from '@toonexpo/db';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { ensurePublishedHotspotTarget } from './ensure-published-hotspot-target.js';

describe('ensurePublishedHotspotTarget', () => {
  it('publishes floor and apartment targets (not only district/building)', async () => {
    const floorUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const apartmentUpdateMany = vi.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      db: {
        floor: { updateMany: floorUpdateMany },
        apartment: { updateMany: apartmentUpdateMany },
      },
    } as unknown as PrismaService;

    await ensurePublishedHotspotTarget(prisma, 'floor', 'floor_1');
    expect(floorUpdateMany).toHaveBeenCalledWith({
      where: {
        id: 'floor_1',
        publicationStatus: { not: PublicationStatus.published },
      },
      data: { publicationStatus: PublicationStatus.published },
    });

    await ensurePublishedHotspotTarget(prisma, 'apartment', 'apt_1');
    expect(apartmentUpdateMany).toHaveBeenCalledWith({
      where: {
        id: 'apt_1',
        publicationStatus: { not: PublicationStatus.published },
      },
      data: { publicationStatus: PublicationStatus.published },
    });
  });
});
