import type { ApartmentStatus, PriceVisibility, PublicationStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

export type ProjectStatusCounts = {
  draft: number;
  published: number;
  archived: number;
};

export type BuilderProjectRow = {
  id: string;
  name: string;
  city: string | null;
  status: PublicationStatus;
  updatedAt: Date;
  buildingsCount: number;
};

export async function loadProjectStatusCounts(companyId: string): Promise<ProjectStatusCounts> {
  const groups = await prisma.project.groupBy({
    by: ['status'],
    where: { companyId },
    _count: { _all: true },
  });

  return mapProjectStatusCounts(groups);
}

export async function loadCompanyProjects(companyId: string): Promise<BuilderProjectRow[]> {
  const projects = await prisma.project.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      city: true,
      status: true,
      updatedAt: true,
      _count: { select: { buildings: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    city: project.city,
    status: project.status,
    updatedAt: project.updatedAt,
    buildingsCount: project._count.buildings,
  }));
}

function mapProjectStatusCounts(
  groups: ReadonlyArray<{ status: PublicationStatus; _count: { _all: number } }>,
): ProjectStatusCounts {
  const counts: ProjectStatusCounts = { draft: 0, published: 0, archived: 0 };

  for (const group of groups) {
    if (group.status === 'DRAFT') {
      counts.draft = group._count._all;
    } else if (group.status === 'PUBLISHED') {
      counts.published = group._count._all;
    } else if (group.status === 'ARCHIVED') {
      counts.archived = group._count._all;
    }
  }

  return counts;
}

export type BuilderProjectApartment = {
  id: string;
  code: string;
  rooms: number | null;
  areaSqm: number | null;
  priceAmd: number | null;
  priceVisibility: PriceVisibility;
  matterportUrl: string | null;
  status: ApartmentStatus;
  media: BuilderMediaAsset[];
};

export type BuilderMediaAsset = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
};

export type BuilderProjectFloor = {
  id: string;
  name: string;
  level: number;
  status: PublicationStatus;
  apartments: BuilderProjectApartment[];
};

export type BuilderProjectBuilding = {
  id: string;
  name: string;
  description: string | null;
  status: PublicationStatus;
  floors: BuilderProjectFloor[];
};

export type BuilderProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  address: string | null;
  status: PublicationStatus;
  media: BuilderMediaAsset[];
  buildings: BuilderProjectBuilding[];
};

export async function loadCompanyProjectDetail(
  companyId: string,
  projectId: string,
): Promise<BuilderProjectDetail | null> {
  return prisma.project.findFirst({
    where: { id: projectId, companyId },
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      address: true,
      status: true,
      media: {
        orderBy: { sortOrder: 'asc' },
        select: { id: true, url: true, alt: true, sortOrder: true },
      },
      buildings: {
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          floors: {
            select: {
              id: true,
              name: true,
              level: true,
              status: true,
              apartments: {
                select: {
                  id: true,
                  code: true,
                  rooms: true,
                  areaSqm: true,
                  priceAmd: true,
                  priceVisibility: true,
                  matterportUrl: true,
                  status: true,
                  media: {
                    orderBy: { sortOrder: 'asc' },
                    select: { id: true, url: true, alt: true, sortOrder: true },
                  },
                },
                orderBy: { code: 'asc' },
              },
            },
            orderBy: { level: 'asc' },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
  });
}
