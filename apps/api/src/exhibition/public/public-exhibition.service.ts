import { Injectable, NotFoundException } from "@nestjs/common";
import type {
  BoothSearchResponse,
  CurrentEventResponse,
  PublicBoothDetail,
  PublicBoothListResponse,
  PublicEntranceNodeListResponse,
  RoutePathResponse,
} from "@toonexpo/contracts";
import {
  EventStatus,
  PublicationStatus,
} from "@toonexpo/db";
import { resolveCatalogLocale, type SupportedLocale } from "@toonexpo/shared";

import { AnalyticsService } from "../../analytics/analytics.service.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  resolveTranslatedValue,
  type TranslationRow,
} from "../../catalog/utils/resolve-translation.js";
import { PublicBoothSearchService } from "./public-booth-search.service.js";
import { PublicRouteService } from "./public-route.service.js";
import { loadEntityTranslations } from "../utils/load-entity-translations.js";

@Injectable()
export class PublicExhibitionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boothSearch: PublicBoothSearchService,
    private readonly routeService: PublicRouteService,
    private readonly analytics: AnalyticsService,
  ) {}

  async getCurrentEvent(): Promise<CurrentEventResponse> {
    const event = await this.prisma.db.event.findFirst({
      where: {
        status: EventStatus.active,
        publicationStatus: PublicationStatus.published,
      },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        venueMaps: {
          where: { publicationStatus: PublicationStatus.published },
          orderBy: [{ updatedAt: "desc" }],
          include: { mediaAsset: { select: { fileUrl: true } } },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("No published active event");
    }

    return {
      id: event.id,
      name: event.name,
      code: event.code,
      startDate: formatDate(event.startDate),
      endDate: formatDate(event.endDate),
      venueMaps: event.venueMaps.map((map) => ({
        id: map.id,
        title: map.title,
        mediaAssetId: map.mediaAssetId,
        mediaUrl: map.mediaAsset.fileUrl,
        width: map.width,
        height: map.height,
      })),
    };
  }

  async listPublishedBooths(
    mapId: string,
    localeInput?: string,
  ): Promise<PublicBoothListResponse> {
    await this.requirePublishedMap(mapId);
    const locale = resolveCatalogLocale(localeInput);

    const booths = await this.prisma.db.booth.findMany({
      where: {
        venueMapId: mapId,
        publicationStatus: PublicationStatus.published,
      },
      include: {
        assignments: {
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: {
            company: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: [{ code: "asc" }],
    });

    const entityIds = collectTranslationEntityIds(booths);
    const translations = await loadEntityTranslations(
      this.prisma.db,
      entityIds,
    );

    return {
      data: booths.map((booth) => ({
        id: booth.id,
        code: booth.code,
        name: booth.name,
        type: booth.type,
        xPercent: booth.xPercent.toString(),
        yPercent: booth.yPercent.toString(),
        locationText: booth.locationText,
        assignments: booth.assignments.map((assignment) => ({
          id: assignment.id,
          displayName: resolveAssignmentDisplayName(assignment, locale, translations),
          companyId: assignment.companyId,
          projectId: assignment.projectId,
          assignmentLabel: assignment.assignmentLabel,
        })),
      })),
    };
  }

  searchBooths(
    mapId: string,
    query: string,
    localeInput?: string,
  ): Promise<BoothSearchResponse> {
    return this.boothSearch.search(mapId, query, localeInput);
  }

  async getPublishedBoothById(
    boothId: string,
    localeInput?: string,
  ): Promise<PublicBoothDetail> {
    const locale = resolveCatalogLocale(localeInput);
    const booth = await this.prisma.db.booth.findFirst({
      where: {
        id: boothId,
        publicationStatus: PublicationStatus.published,
        venueMap: {
          publicationStatus: PublicationStatus.published,
          event: {
            status: EventStatus.active,
            publicationStatus: PublicationStatus.published,
          },
        },
      },
      include: {
        venueMap: { select: { id: true, eventId: true } },
        assignments: {
          where: { active: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          include: {
            company: { select: { id: true, name: true } },
            project: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!booth) {
      throw new NotFoundException("Published booth not found");
    }

    const entityIds = collectTranslationEntityIds([booth]);
    const translations = await loadEntityTranslations(
      this.prisma.db,
      entityIds,
    );

    this.analytics.track({
      eventType: "booth_selected",
      boothId: booth.id,
      eventId: booth.venueMap.eventId,
    });

    return {
      id: booth.id,
      code: booth.code,
      name: booth.name,
      type: booth.type,
      xPercent: booth.xPercent.toString(),
      yPercent: booth.yPercent.toString(),
      locationText: booth.locationText,
      assignments: booth.assignments.map((assignment) => ({
        id: assignment.id,
        displayName: resolveAssignmentDisplayName(assignment, locale, translations),
        companyId: assignment.companyId,
        projectId: assignment.projectId,
        assignmentLabel: assignment.assignmentLabel,
      })),
    };
  }

  computeRoute(
    mapId: string,
    fromNodeId: string,
    toBoothId: string,
  ): Promise<RoutePathResponse> {
    return this.routeService.computeRoute(mapId, fromNodeId, toBoothId);
  }

  listEntranceNodes(mapId: string): Promise<PublicEntranceNodeListResponse> {
    return this.routeService.listEntranceNodes(mapId);
  }

  private async requirePublishedMap(mapId: string): Promise<void> {
    const map = await this.prisma.db.venueMap.findFirst({
      where: {
        id: mapId,
        publicationStatus: PublicationStatus.published,
        event: {
          status: EventStatus.active,
          publicationStatus: PublicationStatus.published,
        },
      },
      select: { id: true },
    });

    if (!map) {
      throw new NotFoundException("Published venue map not found");
    }
  }
}

const formatDate = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;

const collectTranslationEntityIds = (
  booths: {
    assignments: {
      company: { id: string; name: string } | null;
      project: { id: string; name: string } | null;
    }[];
  }[],
): { companyIds: string[]; projectIds: string[] } => {
  const companyIds = new Set<string>();
  const projectIds = new Set<string>();

  for (const booth of booths) {
    for (const assignment of booth.assignments) {
      if (assignment.company) {
        companyIds.add(assignment.company.id);
      }
      if (assignment.project) {
        projectIds.add(assignment.project.id);
      }
    }
  }

  return {
    companyIds: [...companyIds],
    projectIds: [...projectIds],
  };
};

const resolveAssignmentDisplayName = (
  assignment: {
    assignmentLabel: string | null;
    company: { id: string; name: string } | null;
    project: { id: string; name: string } | null;
  },
  locale: SupportedLocale,
  translations: TranslationRow[],
): string => {
  if (assignment.assignmentLabel) {
    return assignment.assignmentLabel;
  }

  if (assignment.project) {
    return (
      resolveTranslatedValue(
        translations,
        TRANSLATION_ENTITY.project,
        assignment.project.id,
        TRANSLATION_FIELD.name,
        locale,
        assignment.project.name,
      ) ?? assignment.project.name
    );
  }

  if (assignment.company) {
    return (
      resolveTranslatedValue(
        translations,
        TRANSLATION_ENTITY.company,
        assignment.company.id,
        TRANSLATION_FIELD.name,
        locale,
        assignment.company.name,
      ) ?? assignment.company.name
    );
  }

  return "Unassigned";
};
