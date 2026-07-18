import type { PublicationStatus } from "./catalog.js";

export type EventStatus =
  | "planning"
  | "active"
  | "completed"
  | "archived"
  | "cancelled";

export type BoothType =
  | "builder"
  | "bank"
  | "partner"
  | "sponsor"
  | "service"
  | "info"
  | "entrance"
  | "other";

export type RouteNodeType =
  | "entrance"
  | "intersection"
  | "booth"
  | "info"
  | "other";

export type CheckInStatus =
  | "allowed"
  | "denied_invalid_qr"
  | "denied_blocked"
  | "duplicate_checkin"
  | "error";

export type EventSummary = {
  id: string;
  name: string;
  code: string;
  startDate: string | null;
  endDate: string | null;
  status: EventStatus;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type EventListResponse = {
  data: EventSummary[];
};

export type CreateEventRequest = {
  name: string;
  code: string;
  startDate?: string;
  endDate?: string;
  status?: EventStatus;
  publicationStatus?: PublicationStatus;
};

export type UpdateEventRequest = {
  name?: string;
  code?: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: EventStatus;
  publicationStatus?: PublicationStatus;
};

export type VenueMapSummary = {
  id: string;
  eventId: string;
  title: string;
  mediaAssetId: string;
  mediaUrl: string;
  publicationStatus: PublicationStatus;
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
};

export type VenueMapListResponse = {
  data: VenueMapSummary[];
};

export type CreateVenueMapRequest = {
  title: string;
  mediaAssetId: string;
  publicationStatus?: PublicationStatus;
  width?: number;
  height?: number;
};

export type UpdateVenueMapRequest = {
  title?: string;
  mediaAssetId?: string;
  publicationStatus?: PublicationStatus;
  width?: number | null;
  height?: number | null;
};

export type BoothSummary = {
  id: string;
  eventId: string;
  venueMapId: string;
  code: string;
  name: string | null;
  type: BoothType;
  xPercent: string;
  yPercent: string;
  locationText: string | null;
  publicationStatus: PublicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type BoothListResponse = {
  data: BoothSummary[];
};

export type CreateBoothRequest = {
  code: string;
  name?: string;
  type: BoothType;
  xPercent: number;
  yPercent: number;
  shapeData?: Record<string, unknown>;
  locationText?: string;
  publicationStatus?: PublicationStatus;
};

export type UpdateBoothRequest = {
  code?: string;
  name?: string | null;
  type?: BoothType;
  xPercent?: number;
  yPercent?: number;
  shapeData?: Record<string, unknown> | null;
  locationText?: string | null;
  publicationStatus?: PublicationStatus;
};

export type BoothAssignmentSummary = {
  id: string;
  boothId: string;
  companyId: string | null;
  projectId: string | null;
  assignmentLabel: string | null;
  sortOrder: number | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BoothAssignmentDetail = BoothAssignmentSummary & {
  companyName: string | null;
  projectName: string | null;
};

export type BoothAssignmentListResponse = {
  data: BoothAssignmentDetail[];
};

export type CreateBoothAssignmentRequest = {
  companyId?: string;
  projectId?: string;
  assignmentLabel?: string;
  sortOrder?: number;
  active?: boolean;
};

export type UpdateBoothAssignmentRequest = {
  companyId?: string | null;
  projectId?: string | null;
  assignmentLabel?: string | null;
  sortOrder?: number | null;
  active?: boolean;
};

export type RouteNodeInput = {
  id?: string;
  code?: string;
  label?: string;
  xPercent: number;
  yPercent: number;
  type: RouteNodeType;
  boothId?: string;
};

export type RouteEdgeInput = {
  fromNodeId: string;
  toNodeId: string;
  weight?: number;
  accessible?: boolean;
};

export type RouteGraphPayload = {
  nodes: RouteNodeInput[];
  edges: RouteEdgeInput[];
};

export type RouteNodeSummary = {
  id: string;
  venueMapId: string;
  code: string | null;
  label: string | null;
  xPercent: string;
  yPercent: string;
  type: RouteNodeType;
  boothId: string | null;
};

export type RouteEdgeSummary = {
  id: string;
  venueMapId: string;
  fromNodeId: string;
  toNodeId: string;
  weight: string | null;
  accessible: boolean | null;
};

export type RouteGraphResponse = {
  nodes: RouteNodeSummary[];
  edges: RouteEdgeSummary[];
};

export type CheckInSummaryResponse = {
  eventId: string;
  allowedCount: number;
  duplicateAttempts: number;
  deniedCount: number;
  uniqueVisitors: number;
  perDay: CheckInDayBreakdown[];
};

export type CheckInDayBreakdown = {
  date: string;
  allowedCount: number;
  duplicateAttempts: number;
  deniedCount: number;
};

export type ActiveEventResponse = {
  id: string;
  name: string;
  code: string;
  startDate: string | null;
  endDate: string | null;
};

export type CheckInScanRequest = {
  token: string;
  eventId: string;
};

export type CheckInScanResponse = {
  status: CheckInStatus;
  visitorDisplayName: string | null;
  checkedInAt: string | null;
  duplicateWarning: boolean;
};

export type RecentCheckInItem = {
  visitorDisplayName: string | null;
  status: CheckInStatus;
  checkedInAt: string;
};

export type RecentCheckInResponse = {
  data: RecentCheckInItem[];
};

export type CurrentEventResponse = {
  id: string;
  name: string;
  code: string;
  startDate: string | null;
  endDate: string | null;
  venueMaps: PublicVenueMapSummary[];
};

export type PublicVenueMapSummary = {
  id: string;
  title: string;
  mediaAssetId: string;
  mediaUrl: string;
  width: number | null;
  height: number | null;
};

export type PublicBoothAssignment = {
  id: string;
  displayName: string;
  companyId: string | null;
  projectId: string | null;
  assignmentLabel: string | null;
};

export type PublicBoothDetail = {
  id: string;
  code: string;
  name: string | null;
  type: BoothType;
  xPercent: string;
  yPercent: string;
  locationText: string | null;
  assignments: PublicBoothAssignment[];
};

export type PublicBoothListResponse = {
  data: PublicBoothDetail[];
};

export type BoothSearchResult = {
  name: string;
  boothId: string;
  boothCode: string;
  type: BoothType;
  locationText: string | null;
};

export type BoothSearchResponse = {
  data: BoothSearchResult[];
};

export type RoutePathNode = {
  id: string;
  xPercent: string;
  yPercent: string;
  label: string | null;
  type: RouteNodeType;
};

export type RoutePathResponse = {
  routeAvailable: boolean;
  nodes: RoutePathNode[];
};

export type PublicEntranceNode = {
  id: string;
  code: string | null;
  label: string | null;
  xPercent: string;
  yPercent: string;
};

export type PublicEntranceNodeListResponse = {
  data: PublicEntranceNode[];
};
