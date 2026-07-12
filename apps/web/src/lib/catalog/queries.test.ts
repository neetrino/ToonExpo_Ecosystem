import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@toonexpo/db', () => ({
  prisma: {
    apartment: {
      findFirst: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import { prisma } from '@toonexpo/db';

import {
  getPublishedApartment,
  getPublishedProjectBySlug,
  getPublishedProjects,
  isValidApartmentId,
} from './queries';

const VALID_APARTMENT_ID = 'clxxxxxxxxxxxxxxxxxx01';
const SAMPLE_PRICE = 85_000_000;

describe('isValidApartmentId', () => {
  it('accepts cuid-ish ids', () => {
    expect(isValidApartmentId(VALID_APARTMENT_ID)).toBe(true);
  });

  it('rejects path junk', () => {
    expect(isValidApartmentId('../etc')).toBe(false);
    expect(isValidApartmentId('short')).toBe(false);
  });
});

describe('getPublishedApartment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null for draft / missing project chain', async () => {
    vi.mocked(prisma.apartment.findFirst).mockResolvedValue(null);

    const result = await getPublishedApartment(
      'demo-development',
      'hidden-court',
      VALID_APARTMENT_ID,
      false,
    );

    expect(result).toBeNull();
    expect(prisma.apartment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: VALID_APARTMENT_ID,
          floor: {
            status: 'PUBLISHED',
            building: {
              status: 'PUBLISHED',
              project: {
                slug: 'hidden-court',
                status: 'PUBLISHED',
                company: { slug: 'demo-development' },
              },
            },
          },
        }),
      }),
    );
  });

  it('returns null when apartment belongs to another project', async () => {
    vi.mocked(prisma.apartment.findFirst).mockResolvedValue(null);

    const result = await getPublishedApartment(
      'demo-development',
      'sunrise-residence',
      VALID_APARTMENT_ID,
      false,
    );

    expect(result).toBeNull();
  });

  it('strips priceAmd for VISIBLE_AFTER_LOGIN when anonymous', async () => {
    vi.mocked(prisma.apartment.findFirst).mockResolvedValue({
      id: VALID_APARTMENT_ID,
      code: '202',
      status: 'AVAILABLE',
      areaSqm: 110,
      rooms: 4,
      priceAmd: SAMPLE_PRICE,
      priceVisibility: 'VISIBLE_AFTER_LOGIN',
      matterportUrl: null,
      media: [],
      floor: {
        name: 'Floor 2',
        building: {
          name: 'Tower A',
          project: {
            id: 'project-1',
            name: 'Sunrise Residence',
            slug: 'sunrise-residence',
            companyId: 'company-1',
            company: { slug: 'demo-development', name: 'Demo Development' },
          },
        },
      },
    } as never);

    const result = await getPublishedApartment(
      'demo-development',
      'sunrise-residence',
      VALID_APARTMENT_ID,
      false,
    );

    expect(result).not.toBeNull();
    expect(result?.priceDisplay).toBe('LOGIN_REQUIRED');
    expect(result?.priceAmd).toBeNull();
  });

  it('returns null when floor or building is not PUBLISHED', async () => {
    vi.mocked(prisma.apartment.findFirst).mockResolvedValue(null);

    const result = await getPublishedApartment(
      'demo-development',
      'sunrise-residence',
      VALID_APARTMENT_ID,
      false,
    );

    expect(result).toBeNull();
    expect(prisma.apartment.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          floor: {
            status: 'PUBLISHED',
            building: {
              status: 'PUBLISHED',
              project: {
                slug: 'sunrise-residence',
                status: 'PUBLISHED',
                company: { slug: 'demo-development' },
              },
            },
          },
        }),
      }),
    );
  });
});

describe('getPublishedProjectBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries only published buildings and floors', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null);

    await getPublishedProjectBySlug('demo-development', 'sunrise-residence');

    expect(prisma.project.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          buildings: expect.objectContaining({
            where: { status: 'PUBLISHED' },
            select: expect.objectContaining({
              floors: expect.objectContaining({
                where: { status: 'PUBLISHED' },
              }),
            }),
          }),
        }),
      }),
    );
  });
});

describe('getPublishedProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);
  });

  it('applies city contains filter case-insensitively', async () => {
    await getPublishedProjects({ city: 'Yerevan' });

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'PUBLISHED',
          city: { contains: 'Yerevan', mode: 'insensitive' },
        },
      }),
    );
  });

  it('applies builder slug filter via company relation', async () => {
    await getPublishedProjects({ builderSlug: 'demo-development' });

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'PUBLISHED',
          company: { slug: 'demo-development' },
        },
      }),
    );
  });
});
