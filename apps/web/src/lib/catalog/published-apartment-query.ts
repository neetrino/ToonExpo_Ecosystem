import {
  publicApartmentDetailSchema,
  type PublicApartmentDetail,
  type PublicMediaAsset,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { ApartmentStatus, PriceVisibility } from '@toonexpo/domain';

import { resolvePriceDisplay } from './resolve-price-display';

const IS_DEV = process.env.NODE_ENV === 'development';

/** Prisma cuid-ish ids (c + base36 body). Rejects path traversal / junk. */
const APARTMENT_ID_PATTERN = /^c[a-z0-9]{20,32}$/i;

const apartmentPublicSelect = {
  id: true,
  code: true,
  status: true,
  areaSqm: true,
  rooms: true,
  priceAmd: true,
  priceVisibility: true,
} as const;

function mapMedia(row: { id: string; url: string; alt: string | null }): PublicMediaAsset {
  return { id: row.id, url: row.url, alt: row.alt };
}

/** Validates apartmentId shape before DB lookup. */
export function isValidApartmentId(apartmentId: string): boolean {
  return APARTMENT_ID_PATTERN.test(apartmentId);
}

type ApartmentDetailRow = {
  id: string;
  code: string;
  status: ApartmentStatus;
  areaSqm: number | null;
  rooms: number | null;
  priceAmd: number | null;
  priceVisibility: PriceVisibility;
  matterportUrl: string | null;
  media: { id: string; url: string; alt: string | null }[];
  floor: {
    name: string;
    building: {
      name: string;
      project: {
        id: string;
        name: string;
        slug: string;
        companyId: string;
        company: { slug: string; name: string };
      };
    };
  };
};

function mapPublishedApartmentDetail(
  row: ApartmentDetailRow,
  isAuthenticated: boolean,
): PublicApartmentDetail {
  const price = resolvePriceDisplay(row.priceVisibility, row.priceAmd, isAuthenticated);
  const project = row.floor.building.project;
  const detail: PublicApartmentDetail = {
    id: row.id,
    code: row.code,
    status: row.status,
    areaSqm: row.areaSqm,
    rooms: row.rooms,
    priceVisibility: row.priceVisibility,
    priceDisplay: price.priceDisplay,
    priceAmd: price.priceAmd,
    matterportUrl: row.matterportUrl,
    buildingName: row.floor.building.name,
    floorName: row.floor.name,
    media: row.media.map(mapMedia),
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      companySlug: project.company.slug,
      companyName: project.company.name,
      companyId: project.companyId,
    },
  };

  return IS_DEV ? publicApartmentDetailSchema.parse(detail) : detail;
}

/**
 * Published apartment detail for public page.
 * Requires apartment → floor → building → project PUBLISHED chain matching slugs.
 */
export async function getPublishedApartment(
  companySlug: string,
  projectSlug: string,
  apartmentId: string,
  isAuthenticated: boolean,
): Promise<PublicApartmentDetail | null> {
  if (!isValidApartmentId(apartmentId)) {
    return null;
  }

  const row = await prisma.apartment.findFirst({
    where: {
      id: apartmentId,
      floor: {
        status: 'PUBLISHED',
        building: {
          status: 'PUBLISHED',
          project: {
            slug: projectSlug,
            status: 'PUBLISHED',
            company: { slug: companySlug },
          },
        },
      },
    },
    select: {
      ...apartmentPublicSelect,
      matterportUrl: true,
      media: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, url: true, alt: true },
      },
      floor: {
        select: {
          name: true,
          building: {
            select: {
              name: true,
              project: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  companyId: true,
                  company: { select: { slug: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!row) {
    return null;
  }

  return mapPublishedApartmentDetail(row, isAuthenticated);
}
