import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/exhibition-mutations', () => ({
  upsertExhibitionEvent: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { upsertExhibitionEvent } from '@/lib/admin/exhibition-mutations';

import { upsertExhibitionEventAction } from './actions';

describe('admin exhibition actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when assertAdminSession rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await upsertExhibitionEventAction('en', {
      name: 'Demo',
      code: 'demo',
      status: 'ACTIVE',
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(upsertExhibitionEvent).not.toHaveBeenCalled();
  });
});
