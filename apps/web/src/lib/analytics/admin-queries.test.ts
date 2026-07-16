import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  analyticsCount,
  dealGroupBy,
  qrGroupBy,
  checkInGroupBy,
  projectGroupBy,
  apartmentGroupBy,
  partnerGroupBy,
  readinessGroupBy,
  exhibitionFindMany,
  companyFindMany,
} = vi.hoisted(() => ({
  analyticsCount: vi.fn(),
  dealGroupBy: vi.fn(),
  qrGroupBy: vi.fn(),
  checkInGroupBy: vi.fn(),
  projectGroupBy: vi.fn(),
  apartmentGroupBy: vi.fn(),
  partnerGroupBy: vi.fn(),
  readinessGroupBy: vi.fn(),
  exhibitionFindMany: vi.fn(),
  companyFindMany: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    analyticsEvent: { count: analyticsCount },
    deal: { groupBy: dealGroupBy },
    qrScanLog: { groupBy: qrGroupBy },
    checkIn: { groupBy: checkInGroupBy },
    project: { groupBy: projectGroupBy },
    apartment: { groupBy: apartmentGroupBy },
    partner: { groupBy: partnerGroupBy },
    readinessAssessment: { groupBy: readinessGroupBy },
    exhibitionEvent: { findMany: exhibitionFindMany },
    company: { findMany: companyFindMany },
  },
}));

import { loadAdminAnalytics } from './admin-queries';

describe('loadAdminAnalytics event counts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    analyticsCount.mockResolvedValue(2);
    dealGroupBy.mockResolvedValue([]);
    qrGroupBy.mockResolvedValue([]);
    checkInGroupBy.mockResolvedValue([]);
    projectGroupBy.mockResolvedValue([]);
    apartmentGroupBy.mockResolvedValue([]);
    partnerGroupBy.mockResolvedValue([]);
    readinessGroupBy.mockResolvedValue([]);
    exhibitionFindMany.mockResolvedValue([]);
    companyFindMany.mockResolvedValue([]);
  });

  it('counts project, apartment, booth, and route analytics types', async () => {
    const snapshot = await loadAdminAnalytics();

    expect(snapshot.projectViewsTotal).toBe(2);
    expect(snapshot.apartmentViewsTotal).toBe(2);
    expect(snapshot.boothSelectedTotal).toBe(2);
    expect(snapshot.routeRequestedTotal).toBe(2);

    const types = analyticsCount.mock.calls.map(
      (call) => (call[0] as { where: { type: string } }).where.type,
    );
    expect(types).toEqual(
      expect.arrayContaining([
        'PROJECT_VIEW',
        'APARTMENT_VIEW',
        'BOOTH_SELECTED',
        'ROUTE_REQUESTED',
      ]),
    );
  });
});
