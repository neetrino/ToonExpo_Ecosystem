import type { ReadinessStatus } from '@toonexpo/domain';

import { serverApiRequest } from '@/lib/api/server';

import type { NamedCount } from './aggregates';

export type ProjectViewRow = {
  projectId: string;
  projectName: string;
  total: number;
  lastPeriod: number;
};

export type BuilderReadinessSnapshotRow = {
  id: string;
  label: string;
  status: ReadinessStatus;
  overallScore: number | null;
};

export type BuilderAnalyticsSnapshot = {
  lookbackDays: number;
  projectViews: ProjectViewRow[];
  apartmentViewsTotal: number;
  apartmentViewsLastPeriod: number;
  dealsByStage: NamedCount[];
  dealsBySource: NamedCount[];
  qrScanCreatedDealsCount: number;
  readiness: BuilderReadinessSnapshotRow[];
};

/** Company scope is resolved and enforced by Nest from the session cookie. */
export async function loadBuilderAnalytics(companyId: string): Promise<BuilderAnalyticsSnapshot> {
  void companyId;
  return serverApiRequest<BuilderAnalyticsSnapshot>('/builder/analytics');
}
