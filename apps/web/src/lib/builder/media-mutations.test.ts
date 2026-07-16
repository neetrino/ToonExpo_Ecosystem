import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@toonexpo/db', () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
    },
    apartment: {
      findFirst: vi.fn(),
    },
    mediaAsset: {
      findFirst: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (callback: (tx: typeof prisma) => Promise<unknown>) =>
      callback(prisma),
    ),
  },
}));

vi.mock('@/lib/storage', () => ({
  bestEffortDeleteR2Object: vi.fn(),
}));

import { prisma } from '@toonexpo/db';

import { bestEffortDeleteR2Object } from '@/lib/storage';

import { addMediaAsset, deleteMediaAsset, updateMediaAsset } from './media-mutations';

const FOREIGN_COMPANY_ID = 'company-foreign';
const OWN_COMPANY_ID = 'company-own';
const SAMPLE_URL = 'https://picsum.photos/seed/cover/800/600';
const R2_URL = 'https://cdn.example.com/media/company-own/2026/07/uuid.jpg';

describe('media-mutations ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns invalidInput when both projectId and apartmentId are set', async () => {
    const result = await addMediaAsset(OWN_COMPANY_ID, {
      projectId: 'project-1',
      apartmentId: 'apartment-1',
      url: SAMPLE_URL,
      sortOrder: 0,
    });

    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns invalidInput when neither owner is set', async () => {
    const result = await addMediaAsset(OWN_COMPANY_ID, {
      url: SAMPLE_URL,
      sortOrder: 0,
    });

    expect(result).toEqual({ ok: false, errorKey: 'invalidInput' });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('returns notFound when addMediaAsset targets a foreign project', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    const result = await addMediaAsset(FOREIGN_COMPANY_ID, {
      projectId: 'project-1',
      url: SAMPLE_URL,
      sortOrder: 0,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });

  it('returns notFound when addMediaAsset targets a foreign apartment', async () => {
    vi.mocked(prisma.apartment.findFirst).mockResolvedValue(null);

    const result = await addMediaAsset(FOREIGN_COMPANY_ID, {
      apartmentId: 'apartment-1',
      url: SAMPLE_URL,
      sortOrder: 0,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.mediaAsset.create).not.toHaveBeenCalled();
  });

  it('updates owned media inside a company-scoped transaction', async () => {
    vi.mocked(prisma.mediaAsset.findFirst).mockResolvedValue({
      projectId: 'project-1',
      apartmentId: null,
      url: SAMPLE_URL,
    } as never);
    vi.mocked(prisma.mediaAsset.updateMany).mockResolvedValue({ count: 1 });

    const result = await updateMediaAsset(OWN_COMPANY_ID, {
      mediaAssetId: 'media-1',
      projectId: 'project-1',
      url: SAMPLE_URL,
      sortOrder: 1,
    });

    expect(result).toEqual({ ok: true, mediaAssetId: 'media-1' });
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.mediaAsset.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'media-1',
        OR: [
          { project: { companyId: OWN_COMPANY_ID } },
          { apartment: { floor: { building: { project: { companyId: OWN_COMPANY_ID } } } } },
        ],
      },
      data: {
        url: SAMPLE_URL,
        alt: null,
        sortOrder: 1,
      },
    });
  });

  it('returns notFound when updateMediaAsset targets a foreign asset', async () => {
    vi.mocked(prisma.mediaAsset.findFirst).mockResolvedValue(null);

    const result = await updateMediaAsset(FOREIGN_COMPANY_ID, {
      mediaAssetId: 'media-1',
      projectId: 'project-1',
      url: SAMPLE_URL,
      sortOrder: 1,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.mediaAsset.updateMany).not.toHaveBeenCalled();
  });

  it('returns notFound when deleteMediaAsset targets a foreign asset', async () => {
    vi.mocked(prisma.mediaAsset.findFirst).mockResolvedValue(null);

    const result = await deleteMediaAsset(FOREIGN_COMPANY_ID, {
      mediaAssetId: 'media-1',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.mediaAsset.deleteMany).not.toHaveBeenCalled();
    expect(bestEffortDeleteR2Object).not.toHaveBeenCalled();
  });

  it('deletes owned media then best-effort deletes the R2 object', async () => {
    vi.mocked(prisma.mediaAsset.findFirst).mockResolvedValue({
      projectId: 'project-1',
      apartmentId: null,
      url: R2_URL,
    } as never);
    vi.mocked(prisma.mediaAsset.deleteMany).mockResolvedValue({ count: 1 });

    const result = await deleteMediaAsset(OWN_COMPANY_ID, {
      mediaAssetId: 'media-1',
    });

    expect(result).toEqual({ ok: true, mediaAssetId: 'media-1' });
    expect(bestEffortDeleteR2Object).toHaveBeenCalledWith(R2_URL);
  });
});
