import { beforeEach, describe, expect, it, vi } from 'vitest';

const { projectFindMany, analyticsGroupBy, dealGroupBy, dealCount, readinessFindMany } = vi.hoisted(
  () => ({
    projectFindMany: vi.fn(),
    analyticsGroupBy: vi.fn(),
    dealGroupBy: vi.fn(),
    dealCount: vi.fn(),
    readinessFindMany: vi.fn(),
  }),
);

vi.mock('@toonexpo/db', () => ({
  prisma: {
    project: { findMany: projectFindMany },
    analyticsEvent: { groupBy: analyticsGroupBy },
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
    analyticsGroupBy.mockResolvedValue([]);
    dealGroupBy.mockResolvedValue([]);
    dealCount.mockResolvedValue(0);
    readinessFindMany.mockResolvedValue([]);
  });

  it('scopes every query with the builder companyId', async () => {
    await loadBuilderAnalytics(COMPANY_ID);

    expect(projectFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: COMPANY_ID } }),
    );
    expect(analyticsGroupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ companyId: COMPANY_ID }),
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
