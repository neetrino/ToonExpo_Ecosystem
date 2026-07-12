import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/entrance/assert-entrance-session', () => ({
  assertEntranceSession: vi.fn(),
}));

vi.mock('@/lib/qr/check-in-mutations', () => ({
  performEntranceCheckIn: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertEntranceSession } from '@/lib/entrance/assert-entrance-session';
import { performEntranceCheckIn } from '@/lib/qr/check-in-mutations';

import { performCheckInAction } from './check-in-actions';

describe('performCheckInAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized for non-entrance roles', async () => {
    vi.mocked(assertEntranceSession).mockResolvedValue(null);

    const result = await performCheckInAction('en', { qrToken: 'token-1' });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(performEntranceCheckIn).not.toHaveBeenCalled();
  });
});
