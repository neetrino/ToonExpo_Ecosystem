import {
  publicProjectDetailSchema,
  publicProjectSummarySchema,
  type PublicApartment,
  type PublicBuilding,
  type PublicFloor,
  type PublicMediaAsset,
  type PublicProjectDetail,
  type PublicProjectSummary,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { ApartmentStatus } from '@toonexpo/domain';

const IS_DEV = process.env.NODE_ENV === 'development';

type ProjectSummaryRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  company: { slug: string; name: string };
  media: { url: string }[];
};

type ApartmentRow = {
  id: string;
  code: string;
  status: ApartmentStatus;
  areaSqm: number | null;
  rooms: number | null;
  priceAmd: number | null;
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

function mapApartment(row: ApartmentRow): PublicApartment {
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    areaSqm: row.areaSqm,
    rooms: row.rooms,
    priceAmd: row.priceAmd,
  };
}

function mapFloor(row: FloorRow): PublicFloor {
  return {
    id: row.id,
    name: row.name,
    level: row.level,
    apartments: row.apartments.map(mapApartment),
  };
}

function mapBuilding(row: BuildingRow): PublicBuilding {
  return {
    id: row.id,
    name: row.name,
    floors: row.floors.map(mapFloor),
  };
}

function mapMedia(row: { id: string; url: string; alt: string | null }): PublicMediaAsset {
  return { id: row.id, url: row.url, alt: row.alt };
}

function mapProjectSummary(row: ProjectSummaryRow): PublicProjectSummary {
  const summary: PublicProjectSummary = {
    id: row.id,
    slug: row.slug,
    companySlug: row.company.slug,
    companyName: row.company.name,
    name: row.name,
    city: row.city,
    coverImageUrl: row.media[0]?.url ?? null,
  };
  return IS_DEV ? publicProjectSummarySchema.parse(summary) : summary;
}

function mapProjectDetail(row: ProjectDetailRow): PublicProjectDetail {
  const detail: PublicProjectDetail = {
    ...mapProjectSummary(row),
    description: row.description,
    address: row.address,
    media: row.media.map(mapMedia),
    buildings: row.buildings.map(mapBuilding),
  };
  return IS_DEV ? publicProjectDetailSchema.parse(detail) : detail;
}

/** Returns published projects ordered by newest first. */
export async function getPublishedProjects(): Promise<PublicProjectSummary[]> {
  const rows = await prisma.project.findMany({
    where: { status: 'PUBLISHED' },
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

/** Returns a published project by company and project slug, or null if missing or not published. */
export async function getPublishedProjectBySlug(
  companySlug: string,
  projectSlug: string,
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
      company: { select: { slug: true, name: true } },
      media: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, url: true, alt: true },
      },
      buildings: {
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          floors: {
            orderBy: { level: 'asc' },
            select: {
              id: true,
              name: true,
              level: true,
              apartments: {
                orderBy: { code: 'asc' },
                select: {
                  id: true,
                  code: true,
                  status: true,
                  areaSqm: true,
                  rooms: true,
                  priceAmd: true,
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

  return {
    project: mapProjectDetail(row),
    companyId: row.companyId,
  };
}
