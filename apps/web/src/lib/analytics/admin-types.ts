import type { NamedCount } from './aggregates';

export type CheckInEventCount = {
  eventId: string;
  eventName: string;
  count: number;
};

export type ReadinessCompanyAverage = {
  companyId: string;
  companyName: string;
  avgScore: number | null;
  assessmentCount: number;
};

export type AdminAnalyticsSnapshot = {
  lookbackDays: number;
  projectViewsTotal: number;
  projectViewsLastPeriod: number;
  apartmentViewsTotal: number;
  apartmentViewsLastPeriod: number;
  boothSelectedTotal: number;
  boothSelectedLastPeriod: number;
  routeRequestedTotal: number;
  routeRequestedLastPeriod: number;
  dealsBySource: NamedCount[];
  dealsBySourceLastPeriod: NamedCount[];
  dealsByStage: NamedCount[];
  qrScansByPurpose: NamedCount[];
  qrScansByPurposeLastPeriod: NamedCount[];
  checkInsByEvent: CheckInEventCount[];
  projectsByStatus: NamedCount[];
  apartmentsByStatus: NamedCount[];
  readinessAvgByCompany: ReadinessCompanyAverage[];
  partnersByType: NamedCount[];
};
