import type { Prisma } from '@toonexpo/db';

export const duplicateFloorInclude = {
  building: {
    select: {
      id: true,
      projectId: true,
      project: { select: { slug: true } },
    },
  },
  apartments: {
    orderBy: { number: 'asc' },
    include: {
      galleryImages: { orderBy: { sortOrder: 'asc' } },
    },
  },
} satisfies Prisma.FloorInclude;

export type DuplicateFloorSource = Prisma.FloorGetPayload<{
  include: typeof duplicateFloorInclude;
}>;

export const duplicateCanvasInclude = {
  hotspots: true,
} satisfies Prisma.VisualMapCanvasInclude;

export type DuplicateFloorCanvas = Prisma.VisualMapCanvasGetPayload<{
  include: typeof duplicateCanvasInclude;
}>;

export type DuplicateApartmentTranslation = {
  entityId: string;
  entityType: string;
  fieldName: string;
  locale: string;
  value: string;
};

export type DuplicateFloorInput = {
  companyId: string;
  userId: string;
  floorId: string;
  floorNumber: number;
  name?: string;
  displayLabel?: string;
};

export type DuplicateFloorResult = {
  floor: Prisma.FloorGetPayload<{ include: { _count: { select: { apartments: true } } } }>;
  projectId: string;
  revalidate: boolean;
};
