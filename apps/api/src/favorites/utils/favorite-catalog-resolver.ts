import type {
  FavoriteApartmentCard,
  FavoriteListItem,
  ProjectListItem,
} from "@toonexpo/contracts";
import type { FavoriteTargetType as DbFavoriteTargetType } from "@toonexpo/db";

import type { CatalogViewerContext } from "../../catalog/projects.service.js";
import { publishedApartmentWhere } from "../../catalog/mappers/catalog.mapper.js";
import { mapProjectListItem } from "../../catalog/mappers/project.mapper.js";
import { PUBLIC_PUBLICATION_STATUS } from "../../catalog/catalog.constants.js";
import { loadTranslations } from "../../catalog/utils/load-translations.js";
import {
  resolveCatalogLocale,
  TRANSLATION_ENTITY,
} from "../../catalog/utils/resolve-translation.js";
import type { PrismaService } from "../../prisma/prisma.service.js";
import { fromDbFavoriteTargetType } from "../utils/favorite-target.js";
import { mapFavoriteApartmentCard } from "../mappers/favorite-apartment.mapper.js";

type FavoriteRow = {
  id: string;
  targetType: DbFavoriteTargetType;
  targetId: string;
  createdAt: Date;
};

/**
 * Resolves favorite rows to catalog card shapes.
 * Unpublished/deleted targets are omitted from the response; favorite rows remain in DB.
 */
export const resolveFavoriteListItems = async (
  prisma: PrismaService,
  favorites: FavoriteRow[],
  viewer: CatalogViewerContext,
): Promise<FavoriteListItem[]> => {
  if (favorites.length === 0) {
    return [];
  }

  const locale = resolveCatalogLocale(viewer.locale);
  const projectIds = favorites
    .filter((row) => row.targetType === "project")
    .map((row) => row.targetId);
  const apartmentIds = favorites
    .filter((row) => row.targetType === "apartment")
    .map((row) => row.targetId);

  const [projectCards, apartmentCards] = await Promise.all([
    loadProjectCards(prisma, projectIds, viewer, locale),
    loadApartmentCards(prisma, apartmentIds, viewer, locale),
  ]);

  const items: FavoriteListItem[] = [];

  for (const favorite of favorites) {
    const targetType = fromDbFavoriteTargetType(favorite.targetType);

    if (targetType === "project") {
      const project = projectCards.get(favorite.targetId);
      if (!project) {
        continue;
      }

      items.push({
        id: favorite.id,
        targetType,
        targetId: favorite.targetId,
        savedAt: favorite.createdAt.toISOString(),
        project,
      });
      continue;
    }

    const apartment = apartmentCards.get(favorite.targetId);
    if (!apartment) {
      continue;
    }

    items.push({
      id: favorite.id,
      targetType,
      targetId: favorite.targetId,
      savedAt: favorite.createdAt.toISOString(),
      apartment,
    });
  }

  return items;
};

const loadProjectCards = async (
  prisma: PrismaService,
  projectIds: string[],
  viewer: CatalogViewerContext,
  locale: ReturnType<typeof resolveCatalogLocale>,
): Promise<Map<string, ProjectListItem>> => {
  if (projectIds.length === 0) {
    return new Map();
  }

  const projects = await prisma.db.project.findMany({
    where: {
      id: { in: projectIds },
      publicationStatus: PUBLIC_PUBLICATION_STATUS,
    },
    include: {
      builderCompany: { include: { logoMedia: true } },
      coverMedia: true,
      apartments: {
        where: publishedApartmentWhere(),
        select: {
          salesStatus: true,
          price: true,
          priceCurrency: true,
          priceVisibility: true,
        },
      },
    },
  });

  const projectIdList = [...new Set(projects.map((project) => project.id))];
  const builderIds = [
    ...new Set(projects.map((project) => project.builderCompany.id)),
  ];

  const [projectRows, companyRows] = await Promise.all([
    loadTranslations(prisma.db, TRANSLATION_ENTITY.project, projectIdList),
    loadTranslations(prisma.db, TRANSLATION_ENTITY.company, builderIds),
  ]);
  const translations = [...projectRows, ...companyRows];

  return new Map(
    projects.map((project) => [
      project.id,
      mapProjectListItem(project, {
        locale,
        isAuthenticated: viewer.isAuthenticated,
        translations,
      }),
    ]),
  );
};

const loadApartmentCards = async (
  prisma: PrismaService,
  apartmentIds: string[],
  viewer: CatalogViewerContext,
  locale: ReturnType<typeof resolveCatalogLocale>,
): Promise<Map<string, FavoriteApartmentCard>> => {
  if (apartmentIds.length === 0) {
    return new Map();
  }

  const apartments = await prisma.db.apartment.findMany({
    where: {
      id: { in: apartmentIds },
      publicationStatus: PUBLIC_PUBLICATION_STATUS,
      project: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      building: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      floor: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
    },
    include: {
      project: {
        include: {
          builderCompany: { include: { logoMedia: true } },
        },
      },
    },
  });

  const projectIds = [...new Set(apartments.map((apartment) => apartment.project.id))];
  const builderIds = [
    ...new Set(
      apartments.map((apartment) => apartment.project.builderCompany.id),
    ),
  ];

  const [projectRows, companyRows] = await Promise.all([
    loadTranslations(prisma.db, TRANSLATION_ENTITY.project, projectIds),
    loadTranslations(prisma.db, TRANSLATION_ENTITY.company, builderIds),
  ]);
  const translations = [...projectRows, ...companyRows];

  return new Map(
    apartments.map((apartment) => [
      apartment.id,
      mapFavoriteApartmentCard(apartment, {
        locale,
        isAuthenticated: viewer.isAuthenticated,
        translations,
      }),
    ]),
  );
};
