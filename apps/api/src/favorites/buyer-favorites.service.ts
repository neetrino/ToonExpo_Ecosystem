import { BadRequestException, Injectable } from "@nestjs/common";
import type {
  BuyerFavoritesListResponse,
  BuyerFavoritesStatusResponse,
  FavoriteTargetType,
} from "@toonexpo/contracts";
import { FavoriteTargetType as DbFavoriteTargetType, PublicationStatus } from "@toonexpo/db";

import { AnalyticsService } from "../analytics/analytics.service.js";
import type { CatalogViewerContext } from "../catalog/projects.service.js";
import { PUBLIC_PUBLICATION_STATUS } from "../catalog/catalog.constants.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { entityNotFound } from "../portal/utils/access.js";
import { FAVORITES_STATUS_BATCH_LIMIT } from "./favorites.constants.js";
import {
  favoriteTargetKey,
  toDbFavoriteTargetType,
} from "./utils/favorite-target.js";
import { resolveFavoriteListItems } from "./utils/favorite-catalog-resolver.js";

type PublishedTargetContext = {
  companyId: string;
  projectId: string | null;
  apartmentId: string | null;
};

@Injectable()
export class BuyerFavoritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async add(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<void> {
    const profile = await this.requireBuyerProfile(userId);
    const target = await this.requirePublishedTarget(targetType, targetId);
    const dbTargetType = toDbFavoriteTargetType(targetType);

    const existing = await this.prisma.db.buyerFavorite.findUnique({
      where: {
        buyerProfileId_targetType_targetId: {
          buyerProfileId: profile.id,
          targetType: dbTargetType,
          targetId,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return;
    }

    await this.prisma.db.buyerFavorite.create({
      data: {
        buyerProfileId: profile.id,
        targetType: dbTargetType,
        targetId,
      },
    });

    this.analytics.track({
      eventType: "favorite_added",
      actorUserId: userId,
      actorRole: "buyer",
      companyId: target.companyId,
      projectId: target.projectId,
      apartmentId: target.apartmentId,
    });
  }

  async remove(
    userId: string,
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<void> {
    const profile = await this.requireBuyerProfile(userId);
    const dbTargetType = toDbFavoriteTargetType(targetType);

    await this.prisma.db.buyerFavorite.deleteMany({
      where: {
        buyerProfileId: profile.id,
        targetType: dbTargetType,
        targetId,
      },
    });
  }

  async listMine(
    userId: string,
    locale: string | undefined,
  ): Promise<BuyerFavoritesListResponse> {
    const profile = await this.requireBuyerProfile(userId);
    const favorites = await this.prisma.db.buyerFavorite.findMany({
      where: { buyerProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        targetType: true,
        targetId: true,
        createdAt: true,
      },
    });

    const viewer: CatalogViewerContext = {
      locale,
      isAuthenticated: true,
    };
    const items = await resolveFavoriteListItems(
      this.prisma,
      favorites,
      viewer,
    );

    return { items };
  }

  async statusBatch(
    userId: string,
    targets: Array<{ targetType: FavoriteTargetType; targetId: string }>,
  ): Promise<BuyerFavoritesStatusResponse> {
    if (targets.length > FAVORITES_STATUS_BATCH_LIMIT) {
      throw new BadRequestException(
        `At most ${FAVORITES_STATUS_BATCH_LIMIT} targets allowed per request`,
      );
    }

    const profile = await this.requireBuyerProfile(userId);
    if (targets.length === 0) {
      return { favorited: [] };
    }

    const rows = await this.prisma.db.buyerFavorite.findMany({
      where: {
        buyerProfileId: profile.id,
        OR: targets.map((target) => ({
          targetType: toDbFavoriteTargetType(target.targetType),
          targetId: target.targetId,
        })),
      },
      select: { targetType: true, targetId: true },
    });

    const favorited = rows.map((row) =>
      favoriteTargetKey(
        row.targetType === DbFavoriteTargetType.project ? "project" : "apartment",
        row.targetId,
      ),
    );

    return { favorited };
  }

  private async requireBuyerProfile(userId: string) {
    const profile = await this.prisma.db.buyerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!profile) {
      throw entityNotFound("Buyer profile");
    }

    return profile;
  }

  private async requirePublishedTarget(
    targetType: FavoriteTargetType,
    targetId: string,
  ): Promise<PublishedTargetContext> {
    if (targetType === "project") {
      const project = await this.prisma.db.project.findFirst({
        where: {
          id: targetId,
          publicationStatus: PublicationStatus.published,
        },
        select: { id: true, builderCompanyId: true },
      });
      if (!project) {
        throw entityNotFound("Project");
      }

      return {
        companyId: project.builderCompanyId,
        projectId: project.id,
        apartmentId: null,
      };
    }

    const apartment = await this.prisma.db.apartment.findFirst({
      where: {
        id: targetId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
        project: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
        building: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
        floor: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
      },
      select: {
        id: true,
        projectId: true,
        project: { select: { builderCompanyId: true } },
      },
    });
    if (!apartment) {
      throw entityNotFound("Apartment");
    }

    return {
      companyId: apartment.project.builderCompanyId,
      projectId: apartment.projectId,
      apartmentId: apartment.id,
    };
  }
}
