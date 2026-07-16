import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  companyFindUnique,
  projectFindUnique,
  transaction,
  loadActiveReadinessCategories,
  recordAudit,
} = vi.hoisted(() => ({
  companyFindUnique: vi.fn(),
  projectFindUnique: vi.fn(),
  transaction: vi.fn(),
  loadActiveReadinessCategories: vi.fn(),
  recordAudit: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    company: { findUnique: companyFindUnique },
    project: { findUnique: projectFindUnique },
    $transaction: transaction,
  },
}));

vi.mock('./readiness-queries', () => ({
  loadActiveReadinessCategories,
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit,
  formatStatusTransition: (from: string, to: string) => `${from}→${to}`,
}));

vi.mock('@/lib/readiness/score', () => ({
  computeOverallScore: (
    scores: ReadonlyArray<{ score: number; weight: number | null }>,
  ): number | null => {
    if (scores.length === 0) {
      return null;
    }
    const total = scores.reduce((sum, entry) => sum + entry.score, 0);
    return Math.round(total / scores.length);
  },
}));

import { upsertAssessment } from './readiness-mutations';

const actor = { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' as const };

const baseInput = {
  targetType: 'BUILDER_COMPANY' as const,
  companyId: 'company-1',
  status: 'IN_PROGRESS' as const,
  categoryScores: [{ categoryId: 'cat-1', score: 50, status: 'IN_PROGRESS' as const }],
};

describe('upsertAssessment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    companyFindUnique.mockResolvedValue({ id: 'company-1' });
    loadActiveReadinessCategories.mockResolvedValue([
      {
        id: 'cat-1',
        key: 'media',
        name: 'Media',
        weight: 1,
        sortOrder: 1,
        serviceCategoryKey: null,
      },
    ]);
    recordAudit.mockResolvedValue(undefined);
  });

  it('audits create inside the transaction', async () => {
    const create = vi.fn().mockResolvedValue({ id: 'assessment-1' });
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        readinessAssessment: { create },
        readinessCategoryScore: { deleteMany: vi.fn(), createMany: vi.fn() },
        auditLog: { create: vi.fn() },
      }),
    );

    const result = await upsertAssessment(baseInput, actor);

    expect(result).toEqual({ ok: true, assessmentId: 'assessment-1' });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        action: 'READINESS_ASSESSMENT_UPSERT',
        entityType: 'READINESS_ASSESSMENT',
        entityId: 'assessment-1',
        companyId: 'company-1',
        detail: expect.stringContaining('create:IN_PROGRESS'),
      }),
    );
  });

  it('audits update only when status or score changes', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 'assessment-1',
      status: 'NOT_STARTED',
      overallScore: null,
    });
    const update = vi.fn().mockResolvedValue({});
    const deleteMany = vi.fn().mockResolvedValue({});
    const createMany = vi.fn().mockResolvedValue({});
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        readinessAssessment: { findFirst, update },
        readinessCategoryScore: { deleteMany, createMany },
        auditLog: { create: vi.fn() },
      }),
    );

    const result = await upsertAssessment(
      { ...baseInput, assessmentId: 'assessment-1', status: 'READY' },
      actor,
    );

    expect(result).toEqual({ ok: true, assessmentId: 'assessment-1' });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        detail: expect.stringContaining('NOT_STARTED→READY'),
      }),
    );
  });

  it('skips audit when status and score are unchanged', async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: 'assessment-1',
      status: 'IN_PROGRESS',
      overallScore: 50,
    });
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        readinessAssessment: { findFirst, update: vi.fn() },
        readinessCategoryScore: { deleteMany: vi.fn(), createMany: vi.fn() },
        auditLog: { create: vi.fn() },
      }),
    );

    await upsertAssessment({ ...baseInput, assessmentId: 'assessment-1' }, actor);

    expect(recordAudit).not.toHaveBeenCalled();
  });
});
