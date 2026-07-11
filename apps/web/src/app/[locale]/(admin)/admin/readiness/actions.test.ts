import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/readiness-mutations', () => ({
  upsertAssessment: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { upsertAssessment } from '@/lib/admin/readiness-mutations';

import { upsertAssessmentAction } from './actions';

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
});
