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

/** Absolute metric with period-over-period percent change. */
export type AnalyticsTrendMetric = {
  value: number;
  /** Percent change vs comparison baseline; null when undefined. */
  changePercent: number | null;
};

export type PlatformActivitySummary = {
  totalUsers: AnalyticsTrendMetric;
  registeredBuyers: AnalyticsTrendMetric;
  activeBuilderCompanies: AnalyticsTrendMetric;
  activePartners: AnalyticsTrendMetric;
  publishedProjects: AnalyticsTrendMetric;
  publishedApartments: AnalyticsTrendMetric;
};

/** Daily new users / projects for the admin activity chart. */
export type PlatformActivitySeriesPoint = {
  date: string;
  users: number;
  projects: number;
};

/** New entities created in the selected range, with prior-window comparison. */
export type PlatformActivityGrowth = {
  newUsers: AnalyticsTrendMetric;
  newProjects: AnalyticsTrendMetric;
  newApartments: AnalyticsTrendMetric;
};

export type EntityViewCount = {
  entityId: string;
  name: string | null;
  viewCount: number;
  coverUrl?: string | null;
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
  activitySeries: PlatformActivitySeriesPoint[];
  activityGrowth: PlatformActivityGrowth;
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
