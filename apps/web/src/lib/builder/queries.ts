import type { PublicationStatus } from '@toonexpo/domain';
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
