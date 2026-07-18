import { Injectable, NotFoundException } from "@nestjs/common";
import type { BuilderDetail, BuilderSummary } from "@toonexpo/contracts";
import { CompanyStatus, CompanyType, PublicationStatus } from "@toonexpo/db";

import { AnalyticsService } from "../analytics/analytics.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { publishedApartmentWhere } from "./mappers/catalog.mapper.js";
import { mapProjectListItem } from "./mappers/project.mapper.js";
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: AnalyticsService,
  ) {}

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

    return builders.map((builder) =>
      this.mapBuilderSummary(builder, locale, translations),
    );
  }

  async getBuilderById(
    builderId: string,
    viewer: CatalogViewerContext,
  ): Promise<BuilderDetail> {
    const locale = resolveCatalogLocale(viewer.locale);
    const builder = await this.prisma.db.company.findFirst({
      where: {
        id: builderId,
        type: CompanyType.builder,
        status: CompanyStatus.active,
      },
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

    if (!builder) {
      throw new NotFoundException("Builder not found");
    }

    const projects = await this.prisma.db.project.findMany({
      where: {
        builderCompanyId: builder.id,
        publicationStatus: PublicationStatus.published,
      },
      orderBy: [{ name: "asc" }],
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

    const translations = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.company,
      [builder.id],
    );
    const projectTranslations = await loadTranslations(
      this.prisma.db,
      TRANSLATION_ENTITY.project,
      projects.map((project) => project.id),
    );
    const mergedTranslations = [...translations, ...projectTranslations];

    this.analytics.track({
      eventType: "builder_profile_view",
      companyId: builder.id,
    });

    const summary = this.mapBuilderSummary(
      builder,
      locale,
      translations,
    );

    return {
      ...summary,
      projects: projects.map((project) =>
        mapProjectListItem(project, {
          locale,
          isAuthenticated: viewer.isAuthenticated,
          translations: mergedTranslations,
        }),
      ),
    };
  }

  private mapBuilderSummary(
    builder: {
      id: string;
      name: string;
      description: string | null;
      logoMedia: { fileUrl: string } | null;
      _count: { projects: number };
    },
    locale: ReturnType<typeof resolveCatalogLocale>,
    translations: Awaited<ReturnType<typeof loadTranslations>>,
  ): BuilderSummary {
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
  }
}
