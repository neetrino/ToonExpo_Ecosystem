/**
 * Builder portal inventory CRUD contracts (company-scoped).
 */

import type {
  ApartmentSalesStatus,
  MediaAssetSummary,
  PaginatedResponse,
  PriceVisibility,
  PublicationStatus,
} from './catalog.js';

/** Per-locale string map for catalog content fields. */
export type LocaleTextMap = {
  hy?: string;
  ru?: string;
  en?: string;
};

/**
 * Optional translation payload on portal PATCH/POST bodies.
 * Field keys match catalog Translation.fieldName values.
 */
export type PortalTranslationsInput = {
  name?: LocaleTextMap;
  shortDescription?: LocaleTextMap;
  fullDescription?: LocaleTextMap;
  locationText?: LocaleTextMap;
  description?: LocaleTextMap;
};

export type PortalProjectListItem = {
  id: string;
  name: string;
  slug: string;
  publicationStatus: PublicationStatus;
  shortDescription: string | null;
  locationText: string | null;
  city: string | null;
  district: string | null;
  buildingsCount: number;
  apartmentsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PortalProjectDetail = {
  id: string;
  builderCompanyId: string;
  name: string;
  slug: string;
  publicationStatus: PublicationStatus;
  shortDescription: string | null;
  fullDescription: string | null;
  locationText: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  latitude: string | null;
  longitude: string | null;
  projectType: string | null;
  constructionStatus: string | null;
  completionDate: string | null;
  amenities: unknown;
  nearbyPlaces: unknown;
  coverMediaId: string | null;
  createdAt: string;
  updatedAt: string;
  buildings: PortalBuildingSummary[];
  /** Existing Translation rows grouped by field → locale (portal edit prefills). */
  translations?: PortalTranslationsInput;
};

export type PortalBuildingSummary = {
  id: string;
  projectId: string;
  name: string;
  publicationStatus: PublicationStatus;
  description: string | null;
  displayOrder: number;
  floorsCount: number | null;
  coverMediaId: string | null;
  floors: PortalFloorSummary[];
  createdAt: string;
  updatedAt: string;
};

export type PortalFloorSummary = {
  id: string;
  buildingId: string;
  number: number;
  publicationStatus: PublicationStatus;
  name: string | null;
  displayLabel: string | null;
  displayOrder: number;
  description: string | null;
  floorplanMediaId: string | null;
  apartmentsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PortalApartmentDetail = {
  id: string;
  projectId: string;
  buildingId: string;
  floorId: string;
  number: string;
  salesStatus: ApartmentSalesStatus;
  publicationStatus: PublicationStatus;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaTotal: string | null;
  areaLiving: string | null;
  balconyArea: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  description: string | null;
  matterportUrl: string | null;
  external3dUrl: string | null;
  orientation: string | null;
  viewType: string | null;
  features: unknown;
  planMediaId: string | null;
  plan: MediaAssetSummary | null;
  createdAt: string;
  updatedAt: string;
  /** Existing Translation rows grouped by field → locale (portal edit prefills). */
  translations?: PortalTranslationsInput;
};

export type PortalApartmentStatusHistoryItem = {
  id: string;
  apartmentId: string;
  previousStatus: ApartmentSalesStatus | null;
  newStatus: ApartmentSalesStatus;
  reason: string | null;
  changedByUserId: string | null;
  createdAt: string;
};

export type CreatePortalProjectRequest = {
  name: string;
  slug?: string;
  shortDescription?: string;
  fullDescription?: string;
  locationText?: string;
  address?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  projectType?: string;
  constructionStatus?: string;
  completionDate?: string;
  amenities?: unknown;
  nearbyPlaces?: unknown;
  coverMediaId?: string;
  translations?: PortalTranslationsInput;
};

export type UpdatePortalProjectRequest = {
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  fullDescription?: string | null;
  locationText?: string | null;
  address?: string | null;
  city?: string | null;
  district?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  projectType?: string | null;
  constructionStatus?: string | null;
  completionDate?: string | null;
  amenities?: unknown;
  nearbyPlaces?: unknown;
  coverMediaId?: string | null;
  translations?: PortalTranslationsInput;
};

export type UpdatePortalPublicationRequest = {
  publicationStatus: PublicationStatus;
};

export type CreatePortalBuildingRequest = {
  name: string;
  description?: string;
  displayOrder?: number;
  floorsCount?: number;
  coverMediaId?: string;
  internalCode?: string;
};

export type UpdatePortalBuildingRequest = {
  name?: string;
  description?: string | null;
  displayOrder?: number;
  floorsCount?: number | null;
  coverMediaId?: string | null;
  internalCode?: string | null;
};

export type CreatePortalFloorRequest = {
  floorNumber: number;
  name?: string;
  displayLabel?: string;
  displayOrder?: number;
  description?: string;
  floorplanMediaId?: string;
};

export type UpdatePortalFloorRequest = {
  floorNumber?: number;
  name?: string | null;
  displayLabel?: string | null;
  displayOrder?: number;
  description?: string | null;
  floorplanMediaId?: string | null;
};

export type CreatePortalApartmentRequest = {
  number: string;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaTotal?: number;
  areaLiving?: number;
  balconyArea?: number;
  price?: number;
  priceVisibility?: PriceVisibility;
  description?: string;
  matterportUrl?: string;
  external3dUrl?: string;
  orientation?: string;
  viewType?: string;
  features?: unknown;
  planMediaId?: string;
  salesStatus?: ApartmentSalesStatus;
  translations?: PortalTranslationsInput;
};

export type UpdatePortalApartmentRequest = {
  number?: string;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaTotal?: number | null;
  areaLiving?: number | null;
  balconyArea?: number | null;
  price?: number | null;
  priceVisibility?: PriceVisibility;
  description?: string | null;
  matterportUrl?: string | null;
  external3dUrl?: string | null;
  orientation?: string | null;
  viewType?: string | null;
  features?: unknown;
  planMediaId?: string | null;
  salesStatus?: ApartmentSalesStatus;
  statusChangeReason?: string;
  translations?: PortalTranslationsInput;
};

export type BulkCreatePortalApartmentsRequest = {
  apartments: CreatePortalApartmentRequest[];
};

export type PortalProjectListResponse = PaginatedResponse<PortalProjectListItem>;
