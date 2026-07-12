import { prisma } from '@toonexpo/db';

import type { CatalogPathParams } from './revalidate-catalog-paths';

type CatalogPathHint = {
  projectId?: string;
  buildingId?: string;
  floorId?: string;
  apartmentId?: string;
  mediaAssetId?: string;
};

function mapProjectToCatalogPaths(project: {
  id: string;
  slug: string;
  company: { slug: string };
}): CatalogPathParams {
  return {
    projectId: project.id,
    projectSlug: project.slug,
    companySlug: project.company.slug,
  };
}

/**
 * Resolves public catalog and portal detail path segments for cache revalidation.
 */
export async function resolveCatalogPaths(
  companyId: string,
  hint: CatalogPathHint,
): Promise<CatalogPathParams | null> {
  if (hint.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: hint.projectId, companyId },
      select: { id: true, slug: true, company: { select: { slug: true } } },
    });
    return project ? mapProjectToCatalogPaths(project) : null;
  }

  if (hint.buildingId) {
    const building = await prisma.building.findFirst({
      where: { id: hint.buildingId, project: { companyId } },
      select: {
        project: {
          select: { id: true, slug: true, company: { select: { slug: true } } },
        },
      },
    });
    return building ? mapProjectToCatalogPaths(building.project) : null;
  }

  if (hint.floorId) {
    const floor = await prisma.floor.findFirst({
      where: { id: hint.floorId, building: { project: { companyId } } },
      select: {
        building: {
          select: {
            project: {
              select: { id: true, slug: true, company: { select: { slug: true } } },
            },
          },
        },
      },
    });
    return floor ? mapProjectToCatalogPaths(floor.building.project) : null;
  }

  if (hint.apartmentId) {
    const apartment = await prisma.apartment.findFirst({
      where: { id: hint.apartmentId, floor: { building: { project: { companyId } } } },
      select: {
        floor: {
          select: {
            building: {
              select: {
                project: {
                  select: { id: true, slug: true, company: { select: { slug: true } } },
                },
              },
            },
          },
        },
      },
    });
    return apartment ? mapProjectToCatalogPaths(apartment.floor.building.project) : null;
  }

  if (hint.mediaAssetId) {
    const asset = await prisma.mediaAsset.findFirst({
      where: {
        id: hint.mediaAssetId,
        OR: [
          { project: { companyId } },
          { apartment: { floor: { building: { project: { companyId } } } } },
        ],
      },
      select: {
        project: {
          select: { id: true, slug: true, company: { select: { slug: true } } },
        },
        apartment: {
          select: {
            floor: {
              select: {
                building: {
                  select: {
                    project: {
                      select: { id: true, slug: true, company: { select: { slug: true } } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!asset) {
      return null;
    }
    const project = asset.project ?? asset.apartment?.floor.building.project;
    return project ? mapProjectToCatalogPaths(project) : null;
  }

  return null;
}

/**
 * Resolves catalog path segments for every company-owned project ID (deduped).
 */
export async function resolveCatalogPathsForProjects(
  companyId: string,
  projectIds: string[],
): Promise<CatalogPathParams[]> {
  if (projectIds.length === 0) {
    return [];
  }

  const uniqueIds = [...new Set(projectIds)];
  const projects = await prisma.project.findMany({
    where: { id: { in: uniqueIds }, companyId },
    select: { id: true, slug: true, company: { select: { slug: true } } },
  });

  return projects.map(mapProjectToCatalogPaths);
}

/**
 * Resolves catalog path segments for admin publication actions (any company).
 */
export async function resolveAdminCatalogPaths(
  projectId: string,
): Promise<CatalogPathParams | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { id: true, slug: true, company: { select: { slug: true } } },
  });
  return project ? mapProjectToCatalogPaths(project) : null;
}
