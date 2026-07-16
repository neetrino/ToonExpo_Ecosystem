import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/admin/project-mutations', () => ({
  setProjectPublicationAsAdmin: vi.fn(),
}));

vi.mock('@/lib/shared/resolve-catalog-paths', () => ({
  resolveAdminCatalogPaths: vi.fn(),
}));

vi.mock('@/lib/shared/revalidate-catalog-paths', () => ({
  revalidateAdminCatalogPaths: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { setProjectPublicationAsAdmin } from '@/lib/admin/project-mutations';

import { setProjectPublicationAsAdminAction } from './actions';

describe('setProjectPublicationAsAdminAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns unauthorized when assertAdminSession rejects the caller', async () => {
    vi.mocked(assertAdminSession).mockResolvedValue(null);

    const result = await setProjectPublicationAsAdminAction('en', {
      projectId: 'project-1',
      status: 'PUBLISHED',
    });

    expect(result).toEqual({ ok: false, errorKey: 'unauthorized' });
    expect(setProjectPublicationAsAdmin).not.toHaveBeenCalled();
  });
});
