import { publicProjectSummarySchema, type PublicProjectSummary } from '@toonexpo/contracts';

const IS_DEV = process.env.NODE_ENV === 'development';

export type ProjectSummaryRow = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  company: {
    slug: string;
    name: string;
  };
  media: { url: string }[];
};

/** Maps a Prisma project summary row to the public catalog DTO. */
export function mapProjectSummary(row: ProjectSummaryRow): PublicProjectSummary {
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

export const projectSummarySelect = {
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
} as const;
