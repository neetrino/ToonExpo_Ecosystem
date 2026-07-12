import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./bos-provisioning.crypto', () => ({
  allocateUniqueSlug: vi.fn(async (base: string) => base),
}));

import { allocateUniqueSlug } from './bos-provisioning.crypto';

import { resolveCompanyId } from './bos-provisioning.accounts';

describe('resolveCompanyId', () => {
  const findFirst = vi.fn();
  const findUnique = vi.fn();
  const create = vi.fn();

  const tx = {
    company: { findFirst, findUnique, create },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    findFirst.mockResolvedValue(null);
    findUnique.mockResolvedValue(null);
    create.mockResolvedValue({ id: 'co-new' });
    vi.mocked(allocateUniqueSlug).mockResolvedValue('acme-builders');
  });

  it('reuses an existing company by name without probing slug variants', async () => {
    findFirst.mockResolvedValue({ id: 'co-existing' });

    const companyId = await resolveCompanyId(tx as never, 'Acme Builders');

    expect(companyId).toBe('co-existing');
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findUnique).not.toHaveBeenCalled();
    expect(allocateUniqueSlug).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it('allocates a slug once when the company name is new', async () => {
    const companyId = await resolveCompanyId(tx as never, 'Acme Builders');

    expect(companyId).toBe('co-new');
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(allocateUniqueSlug).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith({
      data: { name: 'Acme Builders', slug: 'acme-builders' },
    });
  });
});
