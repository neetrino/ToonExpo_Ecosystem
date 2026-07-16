'use server';

import { prisma } from '@toonexpo/db';
import type { AnalyticsEventType } from '@toonexpo/domain';

import { scheduleAnalyticsEvent } from '@/lib/analytics/record-event';
import { resolveRequestUserAgent } from '@/lib/analytics/request-user-agent';

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

  const booth = await prisma.booth.findUnique({
    where: { id: boothId },
    select: {
      companyId: true,
      projectId: true,
      project: { select: { companyId: true } },
      partner: { select: { companyId: true } },
    },
  });
  if (!booth) {
    return;
  }

  const companyId = booth.companyId ?? booth.project?.companyId ?? booth.partner?.companyId ?? null;
  if (!companyId) {
    return;
  }

  scheduleAnalyticsEvent({
    type,
    companyId,
    projectId: booth.projectId ?? undefined,
    userAgent: await resolveRequestUserAgent(),
  });
}
