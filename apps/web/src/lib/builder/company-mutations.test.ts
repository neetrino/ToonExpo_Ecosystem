import { beforeEach, describe, expect, it, vi } from 'vitest';

const { updateMany, findUnique } = vi.hoisted(() => ({
  updateMany: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    company: {
      updateMany,
      findUnique,
    },
  },
}));

vi.mock('@/lib/storage', () => ({
  bestEffortDeleteReplacedR2Object: vi.fn(),
}));

import { updateCompanyProfile } from './company-mutations';

const OWN_COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';

describe('company-mutations ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when company does not exist', async () => {
    findUnique.mockResolvedValue(null);

    const result = await updateCompanyProfile(FOREIGN_COMPANY_ID, {
      name: 'Hijacked Builder',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(updateMany).not.toHaveBeenCalled();
  });

  it('updates own company profile', async () => {
    findUnique.mockResolvedValue({ logoUrl: null, slug: 'sunrise-demo' });
    updateMany.mockResolvedValue({ count: 1 });

    const result = await updateCompanyProfile(OWN_COMPANY_ID, {
      name: 'Sunrise Development',
      description: 'Premium builder.',
    });

    expect(result).toEqual({
      ok: true,
      companyId: OWN_COMPANY_ID,
      companySlug: 'sunrise-demo',
    });
  });
});
