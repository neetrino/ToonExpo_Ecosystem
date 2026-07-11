import { prisma } from '@toonexpo/db';

import type { CatalogPathParams } from './revalidate-catalog-paths';

type CatalogPathHint = {
  projectId?: string;
  buildingId?: string;
  floorId?: string;
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

  return null;
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
