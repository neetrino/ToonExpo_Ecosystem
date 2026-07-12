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

import { updateCompanyProfile } from './company-mutations';

const OWN_COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';

describe('company-mutations ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when updateCompanyProfile targets another company', async () => {
    updateMany.mockResolvedValue({ count: 0 });

    const result = await updateCompanyProfile(FOREIGN_COMPANY_ID, {
      name: 'Hijacked Builder',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: FOREIGN_COMPANY_ID },
      }),
    );
  });

  it('updates own company profile', async () => {
    updateMany.mockResolvedValue({ count: 1 });
    findUnique.mockResolvedValue({ slug: 'sunrise-demo' });

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
