import type { PublicationStatus } from '@toonexpo/domain';
import { prisma } from '@toonexpo/db';

import type { ProjectStatusCounts } from '@/lib/builder/queries';

export type AdminCompanyRow = {
  id: string;
  name: string;
  slug: string;
  membersCount: number;
  projectsCount: ProjectStatusCounts;
  createdAt: Date;
};

export type AdminProjectRow = {
  id: string;
  name: string;
  companyName: string;
  status: PublicationStatus;
  buildingsCount: number;
  updatedAt: Date;
};

function emptyProjectStatusCounts(): ProjectStatusCounts {
  return { draft: 0, published: 0, archived: 0 };
}

function applyProjectGroup(
  counts: ProjectStatusCounts,
  status: PublicationStatus,
  count: number,
): void {
  if (status === 'DRAFT') {
    counts.draft = count;
  } else if (status === 'PUBLISHED') {
    counts.published = count;
  } else {
    counts.archived = count;
  }
}

export async function loadAllCompanies(): Promise<AdminCompanyRow[]> {
  const [companies, projectGroups] = await Promise.all([
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.project.groupBy({
      by: ['companyId', 'status'],
      _count: { _all: true },
    }),
  ]);

  const countsByCompany = new Map<string, ProjectStatusCounts>();

  for (const group of projectGroups) {
    const counts = countsByCompany.get(group.companyId) ?? emptyProjectStatusCounts();
    applyProjectGroup(counts, group.status, group._count._all);
    countsByCompany.set(group.companyId, counts);
  }

  return companies.map((company) => ({
    id: company.id,
    name: company.name,
    slug: company.slug,
    membersCount: company._count.members,
    projectsCount: countsByCompany.get(company.id) ?? emptyProjectStatusCounts(),
    createdAt: company.createdAt,
  }));
}

export async function loadAllProjects(
  statusFilter?: PublicationStatus,
): Promise<AdminProjectRow[]> {
  const projects = await prisma.project.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
      company: { select: { name: true } },
      _count: { select: { buildings: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    companyName: project.company.name,
    status: project.status,
    buildingsCount: project._count.buildings,
    updatedAt: project.updatedAt,
  }));
}
