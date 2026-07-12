import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@toonexpo/db', () => ({
  prisma: {
    apartment: {
      findFirst: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from '@toonexpo/db';

import { getPublishedApartment, isValidApartmentId } from './queries';

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
            building: {
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
});
