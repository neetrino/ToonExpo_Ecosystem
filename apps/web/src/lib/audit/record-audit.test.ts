import { beforeEach, describe, expect, it, vi } from 'vitest';

import { formatStatusTransition, recordAudit } from './record-audit';

describe('formatStatusTransition', () => {
  it('joins from and to with an arrow', () => {
    expect(formatStatusTransition('DRAFT', 'PUBLISHED')).toBe('DRAFT→PUBLISHED');
  });
});

describe('recordAudit', () => {
  const create = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts an audit row on success', async () => {
    create.mockResolvedValue({ id: 'audit-1' });

    await recordAudit(
      { auditLog: { create } },
      {
        actor: { userId: 'user-1', role: 'BUILDER' },
        action: 'PUBLICATION_CHANGE',
        entityType: 'PROJECT',
        entityId: 'project-1',
        companyId: 'company-1',
        detail: 'DRAFT→PUBLISHED',
      },
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        actorUserId: 'user-1',
        actorRole: 'BUILDER',
        action: 'PUBLICATION_CHANGE',
        entityType: 'PROJECT',
        entityId: 'project-1',
        companyId: 'company-1',
        detail: 'DRAFT→PUBLISHED',
      },
    });
  });

  it('propagates create failures so the caller transaction can roll back', async () => {
    create.mockRejectedValue(new Error('db down'));

    await expect(
      recordAudit(
        { auditLog: { create } },
        {
          actor: { userId: 'user-1', role: 'BIGPROJECTS_ADMIN' },
          action: 'PROVISION_ACCOUNT',
          entityType: 'USER',
          entityId: 'user-2',
        },
      ),
    ).rejects.toThrow('db down');
  });
});
