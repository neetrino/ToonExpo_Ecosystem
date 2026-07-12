import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/settings-mutations', () => ({
  upsertSetting: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { upsertSetting } from '@/lib/admin/settings-mutations';

import { upsertSettingAction } from './actions';

describe('admin settings actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when upsertSettingAction rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await upsertSettingAction('en', {
      key: 'CONTACT_EMAIL',
      value: 'contact@toonexpo.com',
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(upsertSetting).not.toHaveBeenCalled();
  });
});
