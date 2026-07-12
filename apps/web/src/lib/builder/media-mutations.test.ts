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

import { prisma } from '@toonexpo/db';

import { addMediaAsset, deleteMediaAsset, updateMediaAsset } from './media-mutations';

const FOREIGN_COMPANY_ID = 'company-foreign';
const OWN_COMPANY_ID = 'company-own';
const SAMPLE_URL = 'https://picsum.photos/seed/cover/800/600';

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
  });
});
