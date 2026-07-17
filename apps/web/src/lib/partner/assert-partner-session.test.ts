import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthSession } from '@toonexpo/contracts';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    companyMember: { findFirst: vi.fn() },
    partner: { findUnique: vi.fn() },
  },
}));

import { auth } from '@/auth';
import { prisma } from '@toonexpo/db';

import { assertPartnerSession } from './assert-partner-session';

const PARTNER_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'user-partner-1',
    email: 'partner@example.com',
    name: 'Partner User',
    role: 'PARTNER',
  },
} as AuthSession;

const BUYER_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'buyer-1',
    email: 'buyer@example.com',
    name: 'Buyer User',
    role: 'BUYER',
  },
} as AuthSession;

const LINKED_PARTNER = {
  id: 'partner-1',
  companyId: 'company-1',
  name: 'Converse Bank',
  slug: 'converse-bank',
  type: 'BANK' as const,
  logoUrl: null,
  description: null,
  phone: null,
  email: null,
  website: null,
  serviceCategories: [] as string[],
  status: 'PUBLISHED' as const,
};

describe('assertPartnerSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(assertPartnerSession()).resolves.toBeNull();
  });

  it('returns null when the user is not PARTNER', async () => {
    vi.mocked(auth).mockResolvedValue(BUYER_SESSION as never);

    await expect(assertPartnerSession()).resolves.toBeNull();
  });

  it('returns null when PARTNER has no company membership', async () => {
    vi.mocked(auth).mockResolvedValue(PARTNER_SESSION as never);
    vi.mocked(prisma.companyMember.findFirst).mockResolvedValue(null);

    await expect(assertPartnerSession()).resolves.toBeNull();
  });

  it('returns null when company has no linked Partner', async () => {
    vi.mocked(auth).mockResolvedValue(PARTNER_SESSION as never);
    vi.mocked(prisma.companyMember.findFirst).mockResolvedValue({
      companyId: 'company-1',
    } as never);
    vi.mocked(prisma.partner.findUnique).mockResolvedValue(null);

    await expect(assertPartnerSession()).resolves.toBeNull();
  });

  it('returns scoped context for a linked PARTNER', async () => {
    vi.mocked(auth).mockResolvedValue(PARTNER_SESSION as never);
    vi.mocked(prisma.companyMember.findFirst).mockResolvedValue({
      companyId: 'company-1',
    } as never);
    vi.mocked(prisma.partner.findUnique).mockResolvedValue(LINKED_PARTNER as never);

    const result = await assertPartnerSession();

    expect(result).toEqual({
      session: PARTNER_SESSION,
      partnerId: 'partner-1',
      companyId: 'company-1',
      partner: LINKED_PARTNER,
    });
    expect(prisma.partner.findUnique).toHaveBeenCalledWith({
      where: { companyId: 'company-1' },
      select: expect.any(Object),
    });
  });
});
