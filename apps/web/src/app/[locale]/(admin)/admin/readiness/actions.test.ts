import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/readiness-mutations', () => ({
  upsertAssessment: vi.fn(),
}));

vi.mock('@/lib/admin/readiness-category-mutations', () => ({
  upsertReadinessCategory: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { upsertReadinessCategory } from '@/lib/admin/readiness-category-mutations';
import { upsertAssessment } from '@/lib/admin/readiness-mutations';

import { upsertAssessmentAction, upsertReadinessCategoryAction } from './actions';

describe('admin readiness actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when assertAdminSession rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await upsertAssessmentAction('en', {
      targetType: 'BUILDER_COMPANY',
      companyId: 'company-1',
      status: 'IN_PROGRESS',
      categoryScores: [
        {
          categoryId: 'cat-1',
          status: 'NOT_STARTED',
        },
      ],
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(upsertAssessment).not.toHaveBeenCalled();
  });

  it('passes audit actor to upsertAssessment', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue({
      user: { id: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
    } as never);
    vi.mocked(upsertAssessment).mockResolvedValue({ ok: true, assessmentId: 'a1' });

    const result = await upsertAssessmentAction('en', {
      targetType: 'BUILDER_COMPANY',
      companyId: 'company-1',
      status: 'IN_PROGRESS',
      categoryScores: [{ categoryId: 'cat-1', status: 'NOT_STARTED' }],
    });

    expect(result).toEqual({ ok: true, assessmentId: 'a1' });
    expect(upsertAssessment).toHaveBeenCalledWith(
      expect.objectContaining({ companyId: 'company-1' }),
      { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
    );
  });

  it('upserts readiness categories after admin auth', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue({
      user: { id: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
    } as never);
    vi.mocked(upsertReadinessCategory).mockResolvedValue({ ok: true, categoryId: 'cat-1' });

    const result = await upsertReadinessCategoryAction('en', {
      key: 'media_materials',
      name: 'Media',
      sortOrder: 30,
      active: true,
    });

    expect(result).toEqual({ ok: true, categoryId: 'cat-1' });
    expect(upsertReadinessCategory).toHaveBeenCalled();
  });
});
