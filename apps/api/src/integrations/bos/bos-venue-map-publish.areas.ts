import type { VenueMapPublishRequestBody, VenueMapSnapshotArea } from "@toonexpo/contracts";
import { PublicVenueAreaDisplayMode, PublicVenueMapSnapshotStatus, type Prisma } from "@toonexpo/db";

const DISPLAY_MODE: Record<
  VenueMapSnapshotArea["public_display_mode"],
  PublicVenueAreaDisplayMode
> = {
  organization: PublicVenueAreaDisplayMode.organization,
  custom_label: PublicVenueAreaDisplayMode.custom_label,
  hidden: PublicVenueAreaDisplayMode.hidden,
};

export const collectOccupantCompanyIds = (
  areas: readonly VenueMapSnapshotArea[],
): string[] => {
  const ids = new Set<string>();
  for (const area of areas) {
    if (area.public_display_mode !== "organization") {
      continue;
    }
    const companyId = area.occupant?.toonexpo_company_id?.trim();
    if (companyId) {
      ids.add(companyId);
    }
  }
  return [...ids];
};

export const toAreaCreateInput = (
  area: VenueMapSnapshotArea,
  sortOrder: number,
  knownCompanyIds: ReadonlySet<string>,
): Prisma.PublicVenueAreaCreateWithoutSnapshotInput => {
  const companyId = resolveCompanyId(area, knownCompanyIds);
  return {
    bosSpaceAreaId: area.code,
    code: area.code,
    name: area.name?.trim() || null,
    geometry: {
      type: "cells",
      cells: area.cells.map((cell) => ({ x: cell.x, y: cell.y })),
    },
    areaSqm: area.square_meters,
    displayMode: DISPLAY_MODE[area.public_display_mode],
    publicLabel: resolvePublicLabel(area),
    sortOrder,
    ...(companyId ? { company: { connect: { id: companyId } } } : {}),
  };
};

export const toSnapshotCreateData = (
  body: VenueMapPublishRequestBody,
  backgroundMediaAssetId: string,
  knownCompanyIds: ReadonlySet<string>,
  activatedAt: Date,
): Prisma.PublicVenueMapSnapshotCreateInput => ({
  schemaVersion: body.schema_version,
  bosVenuePlanId: body.bos_venue_plan_id,
  bosEventCycleId: body.bos_event_cycle_id,
  bosEventCycleCode: body.bos_event_cycle_code,
  snapshotVersion: body.snapshot_version,
  checksum: body.checksum.toLowerCase(),
  title: body.content.title.trim(),
  backgroundMedia: { connect: { id: backgroundMediaAssetId } },
  mapWidth: body.content.background.width,
  mapHeight: body.content.background.height,
  pixelsPerMeter: body.content.background.pixels_per_meter,
  gridOriginX: body.content.background.grid_origin_x,
  gridOriginY: body.content.background.grid_origin_y,
  status: PublicVenueMapSnapshotStatus.active,
  publishedByBosAt: new Date(body.published_at),
  activatedAt,
  areas: {
    create: body.content.areas.map((area, index) =>
      toAreaCreateInput(area, index, knownCompanyIds),
    ),
  },
});

const resolvePublicLabel = (area: VenueMapSnapshotArea): string | null => {
  if (area.public_display_mode === "hidden") {
    return null;
  }
  if (area.public_display_mode === "custom_label") {
    return area.custom_label?.trim() || null;
  }
  return area.occupant?.organization_name.trim() || null;
};

const resolveCompanyId = (
  area: VenueMapSnapshotArea,
  knownCompanyIds: ReadonlySet<string>,
): string | null => {
  if (area.public_display_mode !== "organization") {
    return null;
  }
  const companyId = area.occupant?.toonexpo_company_id?.trim();
  if (!companyId || !knownCompanyIds.has(companyId)) {
    return null;
  }
  return companyId;
};
