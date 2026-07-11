import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@toonexpo/db', () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    building: {
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    floor: {
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    apartment: {
      create: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, { code }: { code: string }) {
        super(message);
        this.code = code;
      }
    },
  },
}));

import { prisma } from '@toonexpo/db';

import {
  createBuilding,
  createFloor,
  updateBuilding,
  upsertApartment,
} from './inventory-mutations';

const FOREIGN_COMPANY_ID = 'company-foreign';

describe('inventory-mutations ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when createBuilding targets a foreign project', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const result = await createBuilding(FOREIGN_COMPANY_ID, {
      projectId: 'project-1',
      name: 'Building A',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: { id: 'project-1', companyId: FOREIGN_COMPANY_ID },
      select: { id: true },
    });
    expect(prisma.building.create).not.toHaveBeenCalled();
  });

  it('returns notFound when updateBuilding targets a foreign building', async () => {
    vi.mocked(prisma.building.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateBuilding(FOREIGN_COMPANY_ID, {
      buildingId: 'building-1',
      name: 'Renamed',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.building.updateMany).toHaveBeenCalledWith({
      where: { id: 'building-1', project: { companyId: FOREIGN_COMPANY_ID } },
      data: { name: 'Renamed' },
    });
  });

  it('returns notFound when createFloor targets a foreign building', async () => {
    vi.mocked(prisma.building.findFirst).mockResolvedValue(null);

    const result = await createFloor(FOREIGN_COMPANY_ID, {
      buildingId: 'building-1',
      name: 'Floor 1',
      level: 1,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.floor.create).not.toHaveBeenCalled();
  });

  it('returns notFound when upsertApartment targets a foreign floor', async () => {
    vi.mocked(prisma.floor.findFirst).mockResolvedValue(null);

    const result = await upsertApartment(FOREIGN_COMPANY_ID, {
      floorId: 'floor-1',
      code: 'A-101',
      status: 'AVAILABLE',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.floor.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'floor-1',
        building: { project: { companyId: FOREIGN_COMPANY_ID } },
      },
      select: { id: true },
    });
    expect(prisma.apartment.create).not.toHaveBeenCalled();
  });
});
