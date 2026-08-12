import type {
  PublicVenueMapArea,
  PublicVenueMapCompanyLink,
  PublicVenueMapSnapshotResponse,
} from "@toonexpo/contracts";
import type { Prisma } from "@toonexpo/db";
import { PublicationStatus } from "@toonexpo/db";

import {
  cellsToRects,
  isVenueMapCellGeometry,
  rectsCentroid,
  type VenueMapCalibration,
} from "./public-venue-map.geometry.js";

type SnapshotRow = Prisma.PublicVenueMapSnapshotGetPayload<{
  include: {
    backgroundMedia: { select: { fileUrl: true } };
    areas: {
      include: {
        company: {
          select: {
            id: true;
            name: true;
            type: true;
            partnerCompany: {
              select: { slug: true; publicationStatus: true };
            };
          };
        };
      };
    };
  };
}>;

type AreaRow = SnapshotRow["areas"][number];

export const toPublicVenueMapSnapshot = (
  snapshot: SnapshotRow,
): PublicVenueMapSnapshotResponse | null => {
  const calibration: VenueMapCalibration = {
    pixelsPerMeter: Number(snapshot.pixelsPerMeter),
    gridOriginX: snapshot.gridOriginX,
    gridOriginY: snapshot.gridOriginY,
  };
  if (!Number.isFinite(calibration.pixelsPerMeter) || calibration.pixelsPerMeter <= 0) {
    return null;
  }

  return {
    id: snapshot.id,
    title: snapshot.title,
    snapshotVersion: snapshot.snapshotVersion,
    mapWidth: snapshot.mapWidth,
    mapHeight: snapshot.mapHeight,
    backgroundUrl: snapshot.backgroundMedia.fileUrl,
    areas: snapshot.areas.flatMap((area) => toPublicArea(area, calibration) ?? []),
  };
};

const toPublicArea = (
  area: AreaRow,
  calibration: VenueMapCalibration,
): PublicVenueMapArea | null => {
  if (!isVenueMapCellGeometry(area.geometry)) {
    return null;
  }
  const rects = cellsToRects(area.geometry.cells, calibration);
  if (rects.length === 0) {
    return null;
  }
  const center = rectsCentroid(rects);
  return {
    id: area.id,
    code: area.code,
    name: area.name,
    displayMode: area.displayMode,
    publicLabel: area.publicLabel,
    areaSqm: Number(area.areaSqm),
    rects,
    labelX: center.x,
    labelY: center.y,
    company: toCompanyLink(area),
  };
};

const toCompanyLink = (area: AreaRow): PublicVenueMapCompanyLink | null => {
  if (area.displayMode !== "organization" || !area.company) {
    return null;
  }
  return {
    id: area.company.id,
    name: area.company.name,
    type: area.company.type,
    href: resolveCompanyHref(area.company),
  };
};

const resolveCompanyHref = (
  company: NonNullable<AreaRow["company"]>,
): string | null => {
  if (company.type === "builder") {
    return `/builders/${company.id}`;
  }
  const partner = company.partnerCompany;
  if (
    partner &&
    partner.publicationStatus === PublicationStatus.published &&
    (company.type === "partner" || company.type === "bank")
  ) {
    return `/partners/${partner.slug}`;
  }
  return null;
};
