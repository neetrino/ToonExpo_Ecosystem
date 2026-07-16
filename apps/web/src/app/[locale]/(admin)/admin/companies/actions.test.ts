import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/company-mutations', () => ({
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { createCompany, updateCompany } from '@/lib/admin/company-mutations';

import { createCompanyAction, updateCompanyAction } from './actions';

describe('admin company actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when createCompanyAction rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await createCompanyAction('en', { name: 'Acme Development' });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(createCompany).not.toHaveBeenCalled();
  });

  it('returns unauthorized when updateCompanyAction rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await updateCompanyAction('en', {
      companyId: 'company-1',
      name: 'Acme Development',
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(updateCompany).not.toHaveBeenCalled();
  });
});
