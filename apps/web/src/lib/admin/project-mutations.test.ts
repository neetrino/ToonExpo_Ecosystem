import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUnique, update, transaction } = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update: vi.fn(),
  transaction: vi.fn(),
}));

const { recordAudit } = vi.hoisted(() => ({
  recordAudit: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    project: { findUnique, update },
    $transaction: transaction,
  },
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit,
  formatStatusTransition: (from: string, to: string) => `${from}→${to}`,
}));

import { setProjectPublicationAsAdmin } from './project-mutations';

const ACTOR = { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' as const };

describe('setProjectPublicationAsAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({ project: { findUnique, update }, auditLog: { create: vi.fn() } }),
    );
  });

  it('writes an audit row when admin changes publication status', async () => {
    findUnique.mockResolvedValue({
      id: 'project-1',
      status: 'PUBLISHED',
      companyId: 'company-1',
    });
    update.mockResolvedValue({ id: 'project-1' });
    recordAudit.mockResolvedValue(undefined);

    const result = await setProjectPublicationAsAdmin(
      { projectId: 'project-1', status: 'ARCHIVED' },
      ACTOR,
    );

    expect(result).toEqual({ ok: true, projectId: 'project-1' });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actor: ACTOR,
        action: 'PUBLICATION_CHANGE',
        entityType: 'PROJECT',
        detail: 'PUBLISHED→ARCHIVED',
      }),
    );
  });
});
