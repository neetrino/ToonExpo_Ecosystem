import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/provision', () => ({
  provisionAccount: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { provisionAccount } from '@/lib/admin/provision';

const ADMIN_SESSION = { user: { id: 'admin-1', role: 'BIGPROJECTS_ADMIN' as const } };

import { provisionAccountAction } from './actions';

const VALID_FORM = {
  email: 'builder@example.com',
  name: 'Jane Builder',
  role: 'BUILDER',
  companyName: 'Acme Development',
};

function buildFormData(overrides: Partial<typeof VALID_FORM> = {}): FormData {
  const data = { ...VALID_FORM, ...overrides };
  const formData = new FormData();
  formData.set('email', data.email);
  formData.set('name', data.name);
  formData.set('role', data.role);
  if (data.companyName) {
    formData.set('companyName', data.companyName);
  }
  return formData;
}

describe('provisionAccountAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when assertAdminSession rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await provisionAccountAction('en', {}, buildFormData());

    expect(result).toEqual({ errorKey: 'unauthorized' });
    expect(provisionAccount).not.toHaveBeenCalled();
  });

  it('returns provisioned when the invite email was sent', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(ADMIN_SESSION as never);
    vi.mocked(provisionAccount).mockResolvedValue({
      ok: true,
      userId: 'user-1',
      emailSent: true,
    });

    const result = await provisionAccountAction('en', {}, buildFormData());

    expect(result).toEqual({ successKey: 'provisioned', inviteUrl: undefined });
  });

  it('returns provisionedEmailFailed with a dev inviteUrl when the email did not send', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(ADMIN_SESSION as never);
    vi.mocked(provisionAccount).mockResolvedValue({
      ok: true,
      userId: 'user-1',
      emailSent: false,
      inviteUrl: 'https://app.example.com/en/invite/raw-token',
    });

    const result = await provisionAccountAction('en', {}, buildFormData());

    expect(result).toEqual({
      successKey: 'provisionedEmailFailed',
      inviteUrl: 'https://app.example.com/en/invite/raw-token',
    });
  });
});
