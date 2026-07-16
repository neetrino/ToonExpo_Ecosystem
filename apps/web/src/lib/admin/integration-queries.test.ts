import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    integrationAuditLog: { findMany },
  },
}));

import { INTEGRATION_AUDIT_LOG_LIMIT, loadIntegrationAuditLogs } from './integration-queries';

describe('loadIntegrationAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([]);
  });

  it('loads the latest rows with a narrow select', async () => {
    await loadIntegrationAuditLogs();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      take: INTEGRATION_AUDIT_LOG_LIMIT,
      select: {
        id: true,
        direction: true,
        operation: true,
        status: true,
        externalRef: true,
        createdAt: true,
      },
    });
  });
});
