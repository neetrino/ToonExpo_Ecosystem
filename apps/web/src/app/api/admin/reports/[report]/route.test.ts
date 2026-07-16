import { beforeEach, describe, expect, it, vi } from 'vitest';

const { assertAdminSession, buildAdminReportCsv, adminReportNameSchema } = vi.hoisted(() => {
  const names = new Set(['deals', 'checkins', 'project-views', 'audit']);
  return {
    assertAdminSession: vi.fn(),
    buildAdminReportCsv: vi.fn(),
    adminReportNameSchema: {
      safeParse: (value: unknown) =>
        typeof value === 'string' && names.has(value)
          ? { success: true as const, data: value }
          : { success: false as const, error: new Error('invalid') },
    },
  };
});

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession,
}));

vi.mock('@/lib/admin/reports/build-report', () => ({
  adminReportNameSchema,
  buildAdminReportCsv,
}));

import { GET } from './route';

describe('GET /api/admin/reports/[report]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 JSON when there is no admin session', async () => {
    assertAdminSession.mockResolvedValue(null);

    const response = await GET(new Request('http://localhost/api/admin/reports/deals'), {
      params: Promise.resolve({ report: 'deals' }),
    });

    expect(response.status).toBe(401);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ error: 'unauthorized' });
    expect(buildAdminReportCsv).not.toHaveBeenCalled();
  });

  it('returns CSV attachment on happy path', async () => {
    assertAdminSession.mockResolvedValue({
      user: { id: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
    });
    buildAdminReportCsv.mockResolvedValue('\uFEFFcompany,project\r\nAcme,Tower\r\n');

    const response = await GET(new Request('http://localhost/api/admin/reports/deals'), {
      params: Promise.resolve({ report: 'deals' }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/csv');
    expect(response.headers.get('content-disposition')).toContain('toonexpo-deals.csv');
    await expect(response.text()).resolves.toContain('Acme,Tower');
  });

  it('returns 404 for unknown report names', async () => {
    assertAdminSession.mockResolvedValue({
      user: { id: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
    });

    const response = await GET(new Request('http://localhost/api/admin/reports/secrets'), {
      params: Promise.resolve({ report: 'secrets' }),
    });

    expect(response.status).toBe(404);
    expect(buildAdminReportCsv).not.toHaveBeenCalled();
  });
});
