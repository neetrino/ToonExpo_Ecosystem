/**
 * Shared catalog types for public project / apartment / builder APIs.
 */

export type PublicationStatus = "draft" | "published" | "archived";

export type ApartmentSalesStatus = "available" | "reserved" | "sold";

export type PriceVisibility =
  | "public"
  | "by_request"
  | "visible_after_login";

/**
 * Offset pagination envelope used by public list endpoints.
 */
export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type MediaAssetSummary = {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  altText: string | null;
};

export type BuilderSummary = {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  publishedProjectCount: number;
};

export type CatalogProjectRef = {
  id: string;
  name: string;
  slug: string;
};

export type BuilderDetail = BuilderSummary & {
  projects: ProjectListItem[];
};

export type BuildingDetail = BuildingSummary & {
  project: CatalogProjectRef;
};

export type FloorDetail = FloorSummary & {
  project: CatalogProjectRef;
  building: {
    id: string;
    name: string;
  };
};

export type ApartmentAvailabilitySummary = {
  total: number;
  available: number;
  reserved: number;
  sold: number;
};

export type ProjectListItem = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  locationText: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  cover: MediaAssetSummary | null;
  builder: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  availability: ApartmentAvailabilitySummary;
  minPrice: string | null;
  maxPrice: string | null;
  priceCurrency: string | null;
};

/**
 * Compact apartment row nested under a floor on project detail.
 * Price is null when priceVisibility hides the amount from public viewers.
 */
export type FloorApartmentSummary = {
  id: string;
  number: string;
  salesStatus: ApartmentSalesStatus;
  rooms: number | null;
  areaTotal: string | null;
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
};

export type FloorSummary = {
  id: string;
  number: number;
  name: string | null;
  displayLabel: string | null;
  displayOrder: number;
  availability: ApartmentAvailabilitySummary;
  apartments: FloorApartmentSummary[];
};

export type BuildingSummary = {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  floorsCount: number | null;
  cover: MediaAssetSummary | null;
  floors: FloorSummary[];
  availability: ApartmentAvailabilitySummary;
};

export type ProjectDetail = {
  id: string;
  name: string;
  slug: string;
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
  cover: MediaAssetSummary | null;
  builder: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  buildings: BuildingSummary[];
  availability: ApartmentAvailabilitySummary;
  minPrice: string | null;
  maxPrice: string | null;
  priceCurrency: string | null;
};

export type ApartmentDetail = {
  id: string;
  number: string;
  salesStatus: ApartmentSalesStatus;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  areaTotal: string | null;
  areaLiving: string | null;
  balconyArea: string | null;
  /**
   * Null when priceVisibility hides the amount from anonymous public viewers.
   */
  price: string | null;
  priceCurrency: string;
  priceVisibility: PriceVisibility;
  description: string | null;
  matterportUrl: string | null;
  external3dUrl: string | null;
  orientation: string | null;
  viewType: string | null;
  features: unknown;
  plan: MediaAssetSummary | null;
  project: {
    id: string;
    name: string;
    slug: string;
  };
  building: {
    id: string;
    name: string;
  };
  floor: {
    id: string;
    number: number;
    displayLabel: string | null;
  };
  builder: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
};

/**
 * Authenticated price overlay item: an apartment whose numeric price is
 * hidden from anonymous viewers (`visible_after_login`) but visible to
 * the current session.
 */
export type ApartmentPriceOverlayItem = {
  id: string;
  price: string;
  priceCurrency: string;
};

/**
 * Authenticated min/max price range for one project (includes
 * `visible_after_login` apartments, matching the legacy logged-in view).
 */
export type ProjectPriceRangeOverlay = {
  projectId: string;
  minPrice: string | null;
  maxPrice: string | null;
  priceCurrency: string | null;
};

/**
 * Full authenticated price overlay for a project detail scope:
 * range plus per-apartment prices for `visible_after_login` units.
 */
export type ProjectPricesOverlay = ProjectPriceRangeOverlay & {
  apartments: ApartmentPriceOverlayItem[];
};

export type ProjectPriceRangeOverlayListResponse = {
  data: ProjectPriceRangeOverlay[];
};

export type ListProjectsQuery = {
  page?: number;
  pageSize?: number;
  salesStatus?: ApartmentSalesStatus;
  minPrice?: number;
  maxPrice?: number;
  rooms?: number;
  city?: string;
  builderId?: string;
  /** Catalog content locale (`hy` | `ru` | `en`). Falls back to Armenian. */
  locale?: string;
};
