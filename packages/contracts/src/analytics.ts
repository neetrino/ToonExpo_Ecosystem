/**
 * Analytics event types and dashboard overview contracts.
 */

import type { CrmDealStatus, RequestSource } from "./crm.js";
import type { ReadinessScoreStatus } from "./readiness.js";

/** Tracked analytics event types (v1). */
export type AnalyticsEventType =
  | "project_view"
  | "building_view"
  | "floor_view"
  | "apartment_view"
  | "builder_profile_view"
  | "partner_profile_view"
  | "mortgage_page_view"
  | "bank_offer_selected"
  | "favorite_added"
  | "request_created"
  | "qr_scanned"
  | "check_in_recorded"
  | "booth_selected"
  | "route_requested"
  | "crm_status_changed"
  | "readiness_status_changed";

export type AnalyticsDateRange = {
  from: string;
  to: string;
};

export type PlatformActivitySummary = {
  totalUsers: number;
  registeredBuyers: number;
  activeBuilderCompanies: number;
  activePartners: number;
  publishedProjects: number;
  publishedApartments: number;
};

export type EntityViewCount = {
  entityId: string;
  name: string | null;
  viewCount: number;
};

export type EntityFavoriteCount = {
  entityId: string;
  name: string | null;
  favoriteCount: number;
};

export type FavoritesSummary = {
  total: number;
  topProjects: EntityFavoriteCount[];
};

export type SourceCount = {
  source: RequestSource;
  count: number;
};

export type StatusCount<TStatus extends string = string> = {
  status: TStatus;
  count: number;
};

export type QrScanContextCount = {
  context: string;
  count: number;
};

export type CheckInSummary = {
  allowed: number;
  duplicate: number;
  denied: number;
};

export type ReadinessCategoryAverage = {
  categoryId: string;
  categoryName: string;
  averageScore: number;
};

export type AdminAnalyticsOverview = {
  range: AnalyticsDateRange;
  platformActivity: PlatformActivitySummary;
  topProjectsByViews: EntityViewCount[];
  favorites: FavoritesSummary;
  requests: {
    total: number;
    bySource: SourceCount[];
  };
  dealsByStatus: StatusCount<CrmDealStatus>[];
  qrScansByContext: QrScanContextCount[];
  checkIns: CheckInSummary;
  readiness: {
    assessmentsByStatus: StatusCount<ReadinessScoreStatus>[];
    weakestCategories: ReadinessCategoryAverage[];
  };
};

export type ApartmentSalesStatusSummary = {
  available: number;
  reserved: number;
  sold: number;
};

export type BuilderReadinessSummary = {
  companyStatus: ReadinessScoreStatus | null;
  companyOverallScore: number | null;
  projectStatus: ReadinessScoreStatus | null;
  projectOverallScore: number | null;
};

export type PortalAnalyticsOverview = {
  range: AnalyticsDateRange;
  topProjectsByViews: EntityViewCount[];
  topApartmentsByViews: EntityViewCount[];
  favorites: FavoritesSummary;
  requests: {
    total: number;
    bySource: SourceCount[];
  };
  dealsByStatus: StatusCount<CrmDealStatus>[];
  apartmentSalesStatus: ApartmentSalesStatusSummary;
  readiness: BuilderReadinessSummary;
};
