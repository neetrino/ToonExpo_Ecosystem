import {
  publicBuilderDetailSchema,
  publicBuilderSummarySchema,
  type PublicBuilderDetail,
  type PublicBuilderSummary,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';

import { mapProjectSummary, projectSummarySelect } from '../catalog/map-project-summary';

const IS_DEV = process.env.NODE_ENV === 'development';

const publishedProjectWhere = { status: 'PUBLISHED' as const };

type BuilderSummaryRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  city: string | null;
  description: string | null;
  _count: { projects: number };
};

type BuilderDetailRow = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  city: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  _count: { projects: number };
  projects: Parameters<typeof mapProjectSummary>[0][];
};

const builderSummarySelect = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  city: true,
  description: true,
  _count: {
    select: {
      projects: { where: publishedProjectWhere },
    },
  },
} as const;

function mapBuilderSummary(row: BuilderSummaryRow): PublicBuilderSummary {
  const summary: PublicBuilderSummary = {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logoUrl: row.logoUrl,
    city: row.city,
    description: row.description,
    publishedProjectCount: row._count.projects,
  };
  return IS_DEV ? publicBuilderSummarySchema.parse(summary) : summary;
}

function mapBuilderDetail(row: BuilderDetailRow): PublicBuilderDetail {
  const detail: PublicBuilderDetail = {
    ...mapBuilderSummary(row),
    phone: row.phone,
    email: row.email,
    website: row.website,
    address: row.address,
    projects: row.projects.map(mapProjectSummary),
  };
  return IS_DEV ? publicBuilderDetailSchema.parse(detail) : detail;
}

/** Returns companies with at least one published project, ordered by name. */
export async function getPublicBuilders(): Promise<PublicBuilderSummary[]> {
  const rows = await prisma.company.findMany({
    where: { projects: { some: publishedProjectWhere } },
    orderBy: { name: 'asc' },
    select: builderSummarySelect,
  });

  return rows.map(mapBuilderSummary);
}

/** Returns a public builder by slug, or null if missing or has no published projects. */
export async function getPublicBuilderBySlug(slug: string): Promise<PublicBuilderDetail | null> {
  const row = await prisma.company.findFirst({
    where: { slug, projects: { some: publishedProjectWhere } },
    select: {
      ...builderSummarySelect,
      phone: true,
      email: true,
      website: true,
      address: true,
      projects: {
        where: publishedProjectWhere,
        orderBy: { createdAt: 'desc' },
        select: projectSummarySelect,
      },
    },
  });

  if (!row) {
    return null;
  }

  return mapBuilderDetail(row);
}
