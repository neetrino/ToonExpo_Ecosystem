import {
  favoriteListItemSchema,
  type FavoriteListItem,
  type FavoriteToggleInput,
} from '@toonexpo/contracts';
import { prisma } from '@toonexpo/db';
import type { ApartmentStatus, FavoriteTargetType, PriceVisibility } from '@toonexpo/domain';

import { resolvePriceDisplay } from '@/lib/catalog/resolve-price-display';

const IS_DEV = process.env.NODE_ENV === 'development';

type FavoriteRow = {
  id: string;
  targetType: FavoriteTargetType;
  targetId: string;
  createdAt: Date;
};

type ProjectTarget = {
  id: string;
  name: string;
  slug: string;
  company: { name: string; slug: string };
};

type ApartmentTarget = {
  id: string;
  code: string;
  status: ApartmentStatus;
  priceAmd: number | null;
  priceVisibility: PriceVisibility;
  floor: {
    building: {
      project: {
        name: string;
        slug: string;
        company: { name: string; slug: string };
      };
    };
  };
};

function mapProjectFavorite(row: FavoriteRow, project: ProjectTarget): FavoriteListItem {
  const item: FavoriteListItem = {
    id: row.id,
    targetType: 'PROJECT',
    targetId: row.targetId,
    createdAt: row.createdAt,
    title: project.name,
    companyName: project.company.name,
    companySlug: project.company.slug,
    projectName: project.name,
    projectSlug: project.slug,
    apartmentStatus: null,
    priceDisplay: null,
    priceAmd: null,
  };
  return IS_DEV ? favoriteListItemSchema.parse(item) : item;
}

function mapApartmentFavorite(row: FavoriteRow, apartment: ApartmentTarget): FavoriteListItem {
  const project = apartment.floor.building.project;
  const price = resolvePriceDisplay(apartment.priceVisibility, apartment.priceAmd, true);
  const item: FavoriteListItem = {
    id: row.id,
    targetType: 'APARTMENT',
    targetId: row.targetId,
    createdAt: row.createdAt,
    title: apartment.code,
    companyName: project.company.name,
    companySlug: project.company.slug,
    projectName: project.name,
    projectSlug: project.slug,
    apartmentStatus: apartment.status,
    priceDisplay: price.priceDisplay,
    priceAmd: price.priceAmd,
  };
  return IS_DEV ? favoriteListItemSchema.parse(item) : item;
}

async function loadProjectsByIds(ids: string[]): Promise<Map<string, ProjectTarget>> {
  if (ids.length === 0) {
    return new Map();
  }
  const rows = await prisma.project.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      name: true,
      slug: true,
      company: { select: { name: true, slug: true } },
    },
  });
  return new Map(rows.map((row) => [row.id, row]));
}

async function loadApartmentsByIds(ids: string[]): Promise<Map<string, ApartmentTarget>> {
  if (ids.length === 0) {
    return new Map();
  }
  const rows = await prisma.apartment.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      code: true,
      status: true,
      priceAmd: true,
      priceVisibility: true,
      floor: {
        select: {
          building: {
            select: {
              project: {
                select: {
                  name: true,
                  slug: true,
                  company: { select: { name: true, slug: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  return new Map(rows.map((row) => [row.id, row]));
}

function idsForType(rows: FavoriteRow[], type: FavoriteTargetType): string[] {
  return rows.filter((row) => row.targetType === type).map((row) => row.targetId);
}

/**
 * Buyer-private favorite list for account UI.
 * Keeps rows even when apartment status becomes RESERVED/SOLD.
 * Drops rows whose target was deleted.
 */
export async function listBuyerFavorites(userId: string): Promise<FavoriteListItem[]> {
  const rows = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      targetType: true,
      targetId: true,
      createdAt: true,
    },
  });

  const projects = await loadProjectsByIds(idsForType(rows, 'PROJECT'));
  const apartments = await loadApartmentsByIds(idsForType(rows, 'APARTMENT'));

  const items: FavoriteListItem[] = [];
  for (const row of rows) {
    if (row.targetType === 'PROJECT') {
      const project = projects.get(row.targetId);
      if (project) {
        items.push(mapProjectFavorite(row, project));
      }
      continue;
    }
    const apartment = apartments.get(row.targetId);
    if (apartment) {
      items.push(mapApartmentFavorite(row, apartment));
    }
  }
  return items;
}

/** Whether the buyer already saved this target (for public page toggle state). */
export async function isFavorited(userId: string, input: FavoriteToggleInput): Promise<boolean> {
  const row = await prisma.favorite.findUnique({
    where: {
      userId_targetType_targetId: {
        userId,
        targetType: input.targetType,
        targetId: input.targetId,
      },
    },
    select: { id: true },
  });
  return Boolean(row);
}
