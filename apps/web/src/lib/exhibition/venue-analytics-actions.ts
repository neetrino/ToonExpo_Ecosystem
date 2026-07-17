'use server';

import type { AnalyticsEventType } from '@toonexpo/domain';

import { serverApiRequest } from '@/lib/api/server';

const VENUE_ANALYTICS_TYPES = new Set<AnalyticsEventType>(['BOOTH_SELECTED', 'ROUTE_REQUESTED']);

/**
 * Records a booth interaction from the public venue map (no PII).
 * Resolves company scope server-side so clients cannot spoof companyId.
 */
export async function recordVenueBoothEventAction(
  boothId: string,
  type: AnalyticsEventType,
): Promise<void> {
  if (!VENUE_ANALYTICS_TYPES.has(type) || !boothId.trim()) {
    return;
  }

  await serverApiRequest<void>('/analytics/events', {
    method: 'POST',
    body: { boothId, type },
  });
}
