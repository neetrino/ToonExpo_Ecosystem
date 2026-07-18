import { Injectable, NotFoundException } from "@nestjs/common";
import type { BoothSearchResponse } from "@toonexpo/contracts";
import {
  EventStatus,
  PublicationStatus,
} from "@toonexpo/db";
import { resolveCatalogLocale } from "@toonexpo/shared";

import {
  TRANSLATION_ENTITY,
  TRANSLATION_FIELD,
  resolveTranslatedValue,
} from "../../catalog/utils/resolve-translation.js";
import { loadEntityTranslations } from "../utils/load-entity-translations.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import {
  BOOTH_SEARCH_MAX_RESULTS,
  BOOTH_SEARCH_MIN_QUERY_LENGTH,
} from "../exhibition.constants.js";

@Injectable()
export class PublicBoothSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(
    mapId: string,
    query: string,
    localeInput?: string,
  ): Promise<BoothSearchResponse> {
    await this.requirePublishedMap(mapId);

    const trimmed = query.trim();
    if (trimmed.length < BOOTH_SEARCH_MIN_QUERY_LENGTH) {
      return { data: [] };
    }

    const locale = resolveCatalogLocale(localeInput);
    const needle = trimmed.toLowerCase();

    const booths = await this.prisma.db.booth.findMany({
      where: {
        venueMapId: mapId,
        publicationStatus: PublicationStatus.published,
      },
      include: {
        assignments: {
          where: { active: true },
          include: {
            company: { select: { id: true, name: true, type: true } },
            project: { select: { id: true, name: true } },
          },
        },
      },
    });

    const entityIds = {
      companyIds: [
        ...new Set(
          booths.flatMap((booth) =>
            booth.assignments
              .map((assignment) => assignment.company?.id)
              .filter((id): id is string => id != null),
          ),
        ),
      ],
      projectIds: [
        ...new Set(
          booths.flatMap((booth) =>
            booth.assignments
              .map((assignment) => assignment.project?.id)
              .filter((id): id is string => id != null),
          ),
        ),
      ],
    };

    const translations = await loadEntityTranslations(
      this.prisma.db,
      entityIds,
    );
    const results = booths.flatMap((booth) =>
      matchBooth(booth, needle, locale, translations),
    );

    return { data: results.slice(0, BOOTH_SEARCH_MAX_RESULTS) };
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

const matchBooth = (
  booth: {
    id: string;
    code: string;
    type: string;
    locationText: string | null;
    assignments: {
      assignmentLabel: string | null;
      company: { id: string; name: string; type: string } | null;
      project: { id: string; name: string } | null;
    }[];
  },
  needle: string,
  locale: ReturnType<typeof resolveCatalogLocale>,
  translations: Awaited<ReturnType<typeof loadEntityTranslations>>,
) => {
  const cards: BoothSearchResponse["data"] = [];

  if (booth.code.toLowerCase().includes(needle)) {
      cards.push(buildCard(booth, booth.code));
      return cards;
    }

    if (booth.type.toLowerCase().includes(needle)) {
      cards.push(buildCard(booth, booth.type));
  }

  for (const assignment of booth.assignments) {
    const companyName = assignment.company
      ? resolveTranslatedValue(
          translations,
          TRANSLATION_ENTITY.company,
          assignment.company.id,
          TRANSLATION_FIELD.name,
          locale,
          assignment.company.name,
        ) ?? assignment.company.name
      : null;

    const projectName = assignment.project
      ? resolveTranslatedValue(
          translations,
          TRANSLATION_ENTITY.project,
          assignment.project.id,
          TRANSLATION_FIELD.name,
          locale,
          assignment.project.name,
        ) ?? assignment.project.name
      : null;

    const partnerType = assignment.company?.type ?? null;

    if (
      (companyName && companyName.toLowerCase().includes(needle)) ||
      (projectName && projectName.toLowerCase().includes(needle)) ||
      (partnerType && partnerType.toLowerCase().includes(needle)) ||
      (assignment.assignmentLabel &&
        assignment.assignmentLabel.toLowerCase().includes(needle))
    ) {
      cards.push(
        buildCard(
          booth,
          projectName ?? companyName ?? assignment.assignmentLabel ?? booth.code,
        ),
      );
    }
  }

  return cards;
};

const buildCard = (
  booth: {
    id: string;
    code: string;
    type: string;
    locationText: string | null;
  },
  name: string,
): BoothSearchResponse["data"][number] => ({
  name,
  boothId: booth.id,
  boothCode: booth.code,
  type: booth.type as BoothSearchResponse["data"][number]["type"],
  locationText: booth.locationText,
});
