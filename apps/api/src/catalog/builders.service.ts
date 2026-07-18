import { Injectable } from "@nestjs/common";
import type { BuilderSummary } from "@toonexpo/contracts";
import { CompanyStatus, CompanyType, PublicationStatus } from "@toonexpo/db";

import { PrismaService } from "../prisma/prisma.service.js";
import type { CatalogViewerContext } from "./projects.service.js";
import { loadTranslations } from "./utils/load-translations.js";
import {
  resolveCatalogLocale,
  resolveTranslatedValue,
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
} from "./utils/resolve-translation.js";

@Injectable()
export class BuildersService {
  constructor(private readonly prisma: PrismaService) {}

  async listBuilders(viewer: CatalogViewerContext): Promise<BuilderSummary[]> {
    const locale = resolveCatalogLocale(viewer.locale);
    const builders = await this.prisma.db.company.findMany({
      where: {
        type: CompanyType.builder,
        status: CompanyStatus.active,
      },
      orderBy: { name: "asc" },
      include: {
        logoMedia: true,
        _count: {
          select: {
            projects: {
              where: { publicationStatus: PublicationStatus.published },
            },
          },
        },
      },
    });

    const translations = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.company,
      builders.map((builder) => builder.id),
    );

    return builders.map((builder) => {
      const name =
        resolveTranslatedValue(
          translations,
          TRANSLATION_ENTITY.company,
          builder.id,
          TRANSLATION_FIELD.name,
          locale,
          builder.name,
        ) ?? builder.name;

      return {
        id: builder.id,
        name,
        description: resolveTranslatedValue(
          translations,
          TRANSLATION_ENTITY.company,
          builder.id,
          TRANSLATION_FIELD.description,
          locale,
          builder.description,
        ),
        logoUrl: builder.logoMedia?.fileUrl ?? null,
        publishedProjectCount: builder._count.projects,
      };
    });
  }
}
