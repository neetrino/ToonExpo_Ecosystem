import { beforeEach, describe, expect, it, vi } from 'vitest';

const boothFindUnique = vi.hoisted(() => vi.fn());
const scheduleAnalyticsEvent = vi.hoisted(() => vi.fn());
const resolveRequestUserAgent = vi.hoisted(() => vi.fn());

vi.mock('@toonexpo/db', () => ({
  prisma: {
    booth: { findUnique: boothFindUnique },
  },
}));

vi.mock('@/lib/analytics/record-event', () => ({
  scheduleAnalyticsEvent: (...args: unknown[]) => scheduleAnalyticsEvent(...args),
}));

vi.mock('@/lib/analytics/request-user-agent', () => ({
  resolveRequestUserAgent: (...args: unknown[]) => resolveRequestUserAgent(...args),
}));

import { recordVenueBoothEventAction } from './venue-analytics-actions';

describe('recordVenueBoothEventAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveRequestUserAgent.mockResolvedValue('Mozilla/5.0');
  });

  it('schedules BOOTH_SELECTED with company and project scope', async () => {
    boothFindUnique.mockResolvedValue({
      companyId: 'co-1',
      projectId: 'proj-1',
      project: { companyId: 'co-1' },
      partner: null,
    });

    await recordVenueBoothEventAction('booth-1', 'BOOTH_SELECTED');

    expect(scheduleAnalyticsEvent).toHaveBeenCalledWith({
      type: 'BOOTH_SELECTED',
      companyId: 'co-1',
      projectId: 'proj-1',
      userAgent: 'Mozilla/5.0',
    });
  });

  it('skips when booth has no company scope', async () => {
    boothFindUnique.mockResolvedValue({
      companyId: null,
      projectId: null,
      project: null,
      partner: { companyId: null },
    });

    await recordVenueBoothEventAction('booth-2', 'ROUTE_REQUESTED');

    expect(scheduleAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('ignores non-venue event types', async () => {
    await recordVenueBoothEventAction('booth-1', 'PROJECT_VIEW');
    expect(boothFindUnique).not.toHaveBeenCalled();
    expect(scheduleAnalyticsEvent).not.toHaveBeenCalled();
  });
});
