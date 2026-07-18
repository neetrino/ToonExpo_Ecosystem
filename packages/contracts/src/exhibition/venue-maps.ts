import type { PublicationStatus } from "../catalog.js";

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

export type PublicVenueMapSummary = {
  id: string;
  title: string;
  mediaAssetId: string;
  mediaUrl: string;
  width: number | null;
  height: number | null;
};
