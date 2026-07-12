import {
  publicApartmentDetailSchema,
  publicProjectDetailSchema,
  type PublicApartment,
  type PublicApartmentDetail,
  type PublicBuilding,
  type PublicFloor,
  type PublicMediaAsset,
  type PublicProjectDetail,
  type PublicProjectSummary,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { ApartmentStatus, PriceVisibility } from '@toonexpo/domain';

import { mapProjectSummary } from './map-project-summary';
import type { PublishedProjectFilters } from './project-filters';
import { resolvePriceDisplay } from './resolve-price-display';

const IS_DEV = process.env.NODE_ENV === 'development';

/** Prisma cuid-ish ids (c + base36 body). Rejects path traversal / junk. */
const APARTMENT_ID_PATTERN = /^c[a-z0-9]{20,32}$/i;

type ProjectSummaryRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  company: {
    slug: string;
    name: string;
    description?: string | null;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    city?: string | null;
    address?: string | null;
  };
  media: { url: string }[];
};

type ApartmentRow = {
  id: string;
  code: string;
  status: ApartmentStatus;
  areaSqm: number | null;
  rooms: number | null;
  priceAmd: number | null;
  priceVisibility: PriceVisibility;
};

type FloorRow = {
  id: string;
  name: string;
  level: number;
  apartments: ApartmentRow[];
};

type BuildingRow = {
  id: string;
  name: string;
  description: string | null;
  floors: FloorRow[];
};

type ProjectDetailRow = ProjectSummaryRow & {
  companyId: string;
  description: string | null;
  address: string | null;
  media: { id: string; url: string; alt: string | null }[];
  buildings: BuildingRow[];
};

export type PublishedProjectLoad = {
  project: PublicProjectDetail;
  companyId: string;
};

function mapApartment(row: ApartmentRow, isAuthenticated: boolean): PublicApartment {
  const price = resolvePriceDisplay(row.priceVisibility, row.priceAmd, isAuthenticated);
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    areaSqm: row.areaSqm,
    rooms: row.rooms,
    priceVisibility: row.priceVisibility,
    priceDisplay: price.priceDisplay,
    priceAmd: price.priceAmd,
  };
}

function mapFloor(row: FloorRow, isAuthenticated: boolean): PublicFloor {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    apartments: row.apartments.map((apartment) => mapApartment(apartment, isAuthenticated)),
  };
}

function mapBuilding(row: BuildingRow, isAuthenticated: boolean): PublicBuilding {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    floors: row.floors.map((floor) => mapFloor(floor, isAuthenticated)),
  };
}

function mapMedia(row: { id: string; url: string; alt: string | null }): PublicMediaAsset {
  return { id: row.id, url: row.url, alt: row.alt };
}

function mapProjectDetail(row: ProjectDetailRow, isAuthenticated: boolean): PublicProjectDetail {
  const detail: PublicProjectDetail = {
    ...mapProjectSummary(row),
    description: row.description,
    address: row.address,
    media: row.media.map(mapMedia),
    buildings: row.buildings.map((building) => mapBuilding(building, isAuthenticated)),
    companyDescription: row.company.description ?? null,
    companyLogoUrl: row.company.logoUrl ?? null,
    companyPhone: row.company.phone ?? null,
    companyEmail: row.company.email ?? null,
    companyWebsite: row.company.website ?? null,
    companyCity: row.company.city ?? null,
    companyAddress: row.company.address ?? null,
  };
  return IS_DEV ? publicProjectDetailSchema.parse(detail) : detail;
}

function buildPublishedProjectsWhere(filters?: PublishedProjectFilters) {
  return {
    status: 'PUBLISHED' as const,
    ...(filters?.city
      ? { city: { contains: filters.city, mode: 'insensitive' as const } }
      : {}),
    ...(filters?.builderSlug ? { company: { slug: filters.builderSlug } } : {}),
  };
}

/** Returns published projects ordered by newest first; optional city/builder filters. */
export async function getPublishedProjects(
  filters?: PublishedProjectFilters,
): Promise<PublicProjectSummary[]> {
  const rows = await prisma.project.findMany({
    where: buildPublishedProjectsWhere(filters),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      slug: true,
      name: true,
      city: true,
      company: { select: { slug: true, name: true } },
      media: {
        orderBy: { sortOrder: 'asc' },
        take: 1,
        select: { url: true },
      },
    },
  });

  return rows.map(mapProjectSummary);
}

const apartmentPublicSelect = {
  id: true,
  code: true,
  status: true,
  areaSqm: true,
  rooms: true,
  priceAmd: true,
  priceVisibility: true,
} as const;

/** Returns a published project by company and project slug, or null if missing or not published. */
export async function getPublishedProjectBySlug(
  companySlug: string,
  projectSlug: string,
  isAuthenticated = false,
): Promise<PublishedProjectLoad | null> {
  const row = await prisma.project.findFirst({
    where: {
      slug: projectSlug,
      status: 'PUBLISHED',
      company: { slug: companySlug },
    },
    select: {
      id: true,
      companyId: true,
      slug: true,
      name: true,
      city: true,
      description: true,
      address: true,
      company: {
        select: {
          slug: true,
          name: true,
          description: true,
          logoUrl: true,
          phone: true,
          email: true,
          website: true,
          city: true,
          address: true,
        },
      },
      media: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, url: true, alt: true },
      },
      buildings: {
        where: { status: 'PUBLISHED' },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          description: true,
          floors: {
            where: { status: 'PUBLISHED' },
            orderBy: { level: 'asc' },
            select: {
              id: true,
              name: true,
              level: true,
              apartments: {
                orderBy: { code: 'asc' },
                select: apartmentPublicSelect,
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

  return {
    project: mapProjectDetail(row, isAuthenticated),
    companyId: row.companyId,
  };
}

/** Validates apartmentId shape before DB lookup. */
export function isValidApartmentId(apartmentId: string): boolean {
  return APARTMENT_ID_PATTERN.test(apartmentId);
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
