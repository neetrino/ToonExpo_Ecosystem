import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    auditLog: { findMany },
  },
}));

import { AUDIT_LOG_PAGE_LIMIT, loadAuditLogs, parseAuditEntityTypeFilter } from './audit-queries';

describe('parseAuditEntityTypeFilter', () => {
  it('returns undefined for empty or invalid values', () => {
    expect(parseAuditEntityTypeFilter(undefined)).toBeUndefined();
    expect(parseAuditEntityTypeFilter('')).toBeUndefined();
    expect(parseAuditEntityTypeFilter('NOPE')).toBeUndefined();
  });

  it('accepts known entity types', () => {
    expect(parseAuditEntityTypeFilter('PROJECT')).toBe('PROJECT');
  });
});

describe('loadAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    findMany.mockResolvedValue([]);
  });

  it('loads the latest rows with actor join', async () => {
    await loadAuditLogs();

    expect(findMany).toHaveBeenCalledWith({
      where: undefined,
      orderBy: { createdAt: 'desc' },
      take: AUDIT_LOG_PAGE_LIMIT,
      select: {
        id: true,
        actorRole: true,
        action: true,
        entityType: true,
        entityId: true,
        detail: true,
        createdAt: true,
        actorUser: { select: { email: true, name: true } },
      },
    });
  });

  it('filters by entityType when provided', async () => {
    await loadAuditLogs('PROJECT');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { entityType: 'PROJECT' },
      }),
    );
  });
});
