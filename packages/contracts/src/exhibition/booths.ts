import type { PublicationStatus } from "../catalog.js";

export type BoothType =
  | "builder"
  | "bank"
  | "partner"
  | "sponsor"
  | "service"
  | "info"
  | "entrance"
  | "other";

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
