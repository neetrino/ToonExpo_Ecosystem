import type { AdminAnalyticsSnapshot as Snapshot } from './admin-types';
import { adminApiRequest } from '../admin/admin-api';

export type { CheckInEventCount, ReadinessCompanyAverage } from './admin-types';
export type AdminAnalyticsSnapshot = Snapshot;

export function loadAdminAnalytics(): Promise<AdminAnalyticsSnapshot> {
  return adminApiRequest('/analytics');
}
