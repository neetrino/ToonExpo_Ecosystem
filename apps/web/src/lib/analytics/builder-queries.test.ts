import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  projectFindMany,
  apartmentFindMany,
  analyticsGroupBy,
  analyticsCount,
  dealGroupBy,
  dealCount,
  readinessFindMany,
} = vi.hoisted(() => ({
  projectFindMany: vi.fn(),
  apartmentFindMany: vi.fn(),
  analyticsGroupBy: vi.fn(),
  analyticsCount: vi.fn(),
  dealGroupBy: vi.fn(),
  dealCount: vi.fn(),
  readinessFindMany: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    project: { findMany: projectFindMany },
    apartment: { findMany: apartmentFindMany },
    analyticsEvent: { groupBy: analyticsGroupBy, count: analyticsCount },
    deal: { groupBy: dealGroupBy, count: dealCount },
    readinessAssessment: { findMany: readinessFindMany },
  },
}));

import { loadBuilderAnalytics } from './builder-queries';

const COMPANY_ID = 'company-owned';

describe('loadBuilderAnalytics company scoping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    projectFindMany.mockResolvedValue([{ id: 'p1', name: 'Sunrise' }]);
    apartmentFindMany.mockResolvedValue([{ id: 'apt-1' }]);
    analyticsGroupBy.mockResolvedValue([]);
    analyticsCount.mockResolvedValue(3);
    dealGroupBy.mockResolvedValue([]);
    dealCount.mockResolvedValue(0);
    readinessFindMany.mockResolvedValue([]);
  });

  it('scopes every query with the builder companyId', async () => {
    const snapshot = await loadBuilderAnalytics(COMPANY_ID);

    expect(snapshot.apartmentViewsTotal).toBe(3);
    expect(snapshot.apartmentViewsLastPeriod).toBe(3);

    expect(projectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: COMPANY_ID } }),
    );
    expect(apartmentFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { floor: { building: { project: { companyId: COMPANY_ID } } } },
      }),
    );
    expect(analyticsGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: COMPANY_ID }),
      }),
    );
    expect(analyticsCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          companyId: COMPANY_ID,
          type: 'APARTMENT_VIEW',
        }),
      }),
    );
    expect(dealGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: COMPANY_ID } }),
    );
    expect(dealCount).toHaveBeenCalledWith({
      where: { companyId: COMPANY_ID, source: 'BUILDER_QR_SCAN' },
    });
    expect(readinessFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { companyId: COMPANY_ID, archivedAt: null },
      }),
    );
  });
});
