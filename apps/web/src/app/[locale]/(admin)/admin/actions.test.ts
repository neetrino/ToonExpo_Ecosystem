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

import { provisionAccountAction } from './actions';

const VALID_FORM = {
  email: 'builder@example.com',
  name: 'Jane Builder',
  role: 'BUILDER',
  temporaryPassword: 'temp-pass-1',
  companyName: 'Acme Development',
};

function buildFormData(overrides: Partial<typeof VALID_FORM> = {}): FormData {
  const data = { ...VALID_FORM, ...overrides };
  const formData = new FormData();
  formData.set('email', data.email);
  formData.set('name', data.name);
  formData.set('role', data.role);
  formData.set('temporaryPassword', data.temporaryPassword);
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
});
