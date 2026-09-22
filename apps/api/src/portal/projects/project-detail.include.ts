import type { Prisma } from '@toonexpo/db';

const PROJECT_MEDIA_SELECT = {
  id: true,
  fileUrl: true,
  thumbnailUrl: true,
  altText: true,
} as const;

/**
 * Relations loaded for a portal project detail response.
 */
export const projectDetailInclude = {
  coverMedia: { select: PROJECT_MEDIA_SELECT },
  buildings: {
    orderBy: [{ displayOrder: 'asc' as const }, { name: 'asc' as const }],
    include: {
      floors: {
        orderBy: [{ displayOrder: 'asc' as const }, { number: 'asc' as const }],
        include: { _count: { select: { apartments: true } } },
      },
    },
  },
} satisfies Prisma.ProjectInclude;
