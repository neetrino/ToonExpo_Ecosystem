import type {
  BoothSummary,
  BoothType,
  CheckInStatus,
  EventStatus,
  EventSummary,
  RouteEdgeSummary,
  RouteNodeSummary,
  RouteNodeType,
  VenueMapSummary,
} from "@toonexpo/contracts";
import type {
  BoothType as DbBoothType,
  CheckInStatus as DbCheckInStatus,
  EventStatus as DbEventStatus,
  PublicationStatus,
} from "@toonexpo/db";

type EventRow = {
  id: string;
  name: string;
  code: string;
  startDate: Date | null;
  endDate: Date | null;
  status: DbEventStatus;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
};

type VenueMapRow = {
  id: string;
  eventId: string;
  title: string;
  mediaAssetId: string;
  publicationStatus: PublicationStatus;
  width: number | null;
  height: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type BoothRow = {
  id: string;
  eventId: string;
  venueMapId: string;
  code: string;
  name: string | null;
  type: DbBoothType;
  xPercent: { toString(): string };
  yPercent: { toString(): string };
  locationText: string | null;
  publicationStatus: PublicationStatus;
  createdAt: Date;
  updatedAt: Date;
};

type RouteNodeRow = {
  id: string;
  venueMapId: string;
  code: string | null;
  label: string | null;
  xPercent: { toString(): string };
  yPercent: { toString(): string };
  type: string;
  boothId: string | null;
};

type RouteEdgeRow = {
  id: string;
  venueMapId: string;
  fromNodeId: string;
  toNodeId: string;
  weight: { toString(): string } | null;
  accessible: boolean | null;
};

export const toEventSummary = (event: EventRow): EventSummary => ({
  id: event.id,
  name: event.name,
  code: event.code,
  startDate: formatDate(event.startDate),
  endDate: formatDate(event.endDate),
  status: event.status as EventStatus,
  publicationStatus: event.publicationStatus,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
});

export const toVenueMapSummary = (map: VenueMapRow): VenueMapSummary => ({
  id: map.id,
  eventId: map.eventId,
  title: map.title,
  mediaAssetId: map.mediaAssetId,
  publicationStatus: map.publicationStatus,
  width: map.width,
  height: map.height,
  createdAt: map.createdAt.toISOString(),
  updatedAt: map.updatedAt.toISOString(),
});

export const toBoothSummary = (booth: BoothRow): BoothSummary => ({
  id: booth.id,
  eventId: booth.eventId,
  venueMapId: booth.venueMapId,
  code: booth.code,
  name: booth.name,
  type: booth.type as BoothType,
  xPercent: booth.xPercent.toString(),
  yPercent: booth.yPercent.toString(),
  locationText: booth.locationText,
  publicationStatus: booth.publicationStatus,
  createdAt: booth.createdAt.toISOString(),
  updatedAt: booth.updatedAt.toISOString(),
});

export const toRouteNodeSummary = (node: RouteNodeRow): RouteNodeSummary => ({
  id: node.id,
  venueMapId: node.venueMapId,
  code: node.code,
  label: node.label,
  xPercent: node.xPercent.toString(),
  yPercent: node.yPercent.toString(),
  type: node.type as RouteNodeType,
  boothId: node.boothId,
});

export const toRouteEdgeSummary = (edge: RouteEdgeRow): RouteEdgeSummary => ({
  id: edge.id,
  venueMapId: edge.venueMapId,
  fromNodeId: edge.fromNodeId,
  toNodeId: edge.toNodeId,
  weight: edge.weight?.toString() ?? null,
  accessible: edge.accessible,
});

export const toDbEventStatus = (status: EventStatus): DbEventStatus =>
  status as DbEventStatus;

export const toDbBoothType = (type: BoothType): DbBoothType =>
  type as DbBoothType;

export const toDbCheckInStatus = (status: CheckInStatus): DbCheckInStatus =>
  status as DbCheckInStatus;

const formatDate = (value: Date | null): string | null =>
  value ? value.toISOString().slice(0, 10) : null;
