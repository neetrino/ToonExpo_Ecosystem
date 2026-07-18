import type { PublicationStatus } from "../catalog.js";
import type { PublicVenueMapSummary } from "./venue-maps.js";

export type EventStatus =
  | "planning"
  | "active"
  | "completed"
  | "archived"
  | "cancelled";

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

export type ActiveEventResponse = {
  id: string;
  name: string;
  code: string;
  startDate: string | null;
  endDate: string | null;
};

export type CurrentEventResponse = {
  id: string;
  name: string;
  code: string;
  startDate: string | null;
  endDate: string | null;
  venueMaps: PublicVenueMapSummary[];
};
