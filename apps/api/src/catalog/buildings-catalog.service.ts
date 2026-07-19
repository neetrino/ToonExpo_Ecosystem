import { Injectable, NotFoundException } from "@nestjs/common";
import type { BuildingDetail } from "@toonexpo/contracts";
import { PublicationStatus } from "@toonexpo/db";

import { AnalyticsService } from "../analytics/analytics.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { PUBLIC_PUBLICATION_STATUS } from "./catalog.constants.js";
import type { CatalogViewerContext } from "./projects.service.js";
import { publishedApartmentWhere } from "./mappers/catalog.mapper.js";
import { mapBuildingDetail } from "./mappers/inventory.mapper.js";
import { loadTranslations } from "./utils/load-translations.js";
import {
  resolveCatalogLocale,
  TRANSLATION_ENTITY,
} from "./utils/resolve-translation.js";

@Injectable()
export class BuildingsCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

  async getBuildingById(
    buildingId: string,
    viewer: CatalogViewerContext,
  ): Promise<BuildingDetail> {
    const locale = resolveCatalogLocale(viewer.locale);
    const building = await this.prisma.db.building.findFirst({
      where: {
        id: buildingId,
        publicationStatus: PUBLIC_PUBLICATION_STATUS,
        project: { publicationStatus: PublicationStatus.published },
      },
      include: {
        coverMedia: true,
        project: { select: { id: true, name: true, slug: true } },
        apartments: {
          where: publishedApartmentWhere(),
          select: { salesStatus: true },
        },
        floors: {
          where: { publicationStatus: PUBLIC_PUBLICATION_STATUS },
          orderBy: [{ displayOrder: "asc" }, { number: "asc" }],
          include: {
            apartments: {
              where: publishedApartmentWhere(),
              orderBy: [{ number: "asc" }],
              select: {
                id: true,
                number: true,
                salesStatus: true,
                rooms: true,
                areaTotal: true,
                price: true,
                priceCurrency: true,
                priceVisibility: true,
              },
            },
          },
        },
      },
    });

    if (!building) {
      throw new NotFoundException("Building not found");
    }

    const translations = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.project,
      [building.project.id],
    );

    this.analytics.track({
      eventType: "building_view",
      buildingId: building.id,
      projectId: building.projectId,
    });

    return mapBuildingDetail(building, {
      locale,
      isAuthenticated: viewer.isAuthenticated,
      translations,
    });
  }
}
