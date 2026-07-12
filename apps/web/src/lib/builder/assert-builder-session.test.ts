import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from 'next-auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    companyMember: {
      findMany: vi.fn(),
    },
    company: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/builder/active-company-cookie', () => ({
  readActiveCompanyId: vi.fn(),
}));

import { auth } from '@/auth';
import { prisma } from '@toonexpo/db';

import { readActiveCompanyId } from '@/lib/builder/active-company-cookie';
import { assertBuilderSession } from './assert-builder-session';

const BUILDER_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'builder-1',
    email: 'builder@example.com',
    name: 'Builder User',
    role: 'BUILDER',
  },
} as Session;

const ADMIN_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'BIGPROJECTS_ADMIN',
  },
} as Session;

const DEMO_COMPANY = {
  id: 'company-1',
  slug: 'demo-development',
  name: 'Demo Development',
};

const OTHER_COMPANY = {
  id: 'company-2',
  slug: 'other-builders',
  name: 'Other Builders',
};

describe('assertBuilderSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readActiveCompanyId).mockResolvedValue(null);
  });

  it('returns null when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(assertBuilderSession()).resolves.toBeNull();
  });

  it('returns null for unsupported roles', async () => {
    vi.mocked(auth).mockResolvedValue({
      ...BUILDER_SESSION,
      user: { ...BUILDER_SESSION.user, role: 'BUYER' },
    } as never);

    await expect(assertBuilderSession()).resolves.toBeNull();
  });

  it('returns null when the builder has no company membership', async () => {
    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    vi.mocked(prisma.companyMember.findMany).mockResolvedValue([]);

    await expect(assertBuilderSession()).resolves.toBeNull();
  });

  it('falls back to the earliest membership when cookie is unset', async () => {
    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    vi.mocked(prisma.companyMember.findMany).mockResolvedValue([
      { company: DEMO_COMPANY },
      { company: OTHER_COMPANY },
    ] as never);

    await expect(assertBuilderSession()).resolves.toEqual({
      session: BUILDER_SESSION,
      companyId: DEMO_COMPANY.id,
      companySlug: DEMO_COMPANY.slug,
      companyName: DEMO_COMPANY.name,
      actingOnBehalf: false,
      membershipCount: 2,
    });
  });

  it('selects the cookie company when it is among builder memberships', async () => {
    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    vi.mocked(readActiveCompanyId).mockResolvedValue(OTHER_COMPANY.id);
    vi.mocked(prisma.companyMember.findMany).mockResolvedValue([
      { company: DEMO_COMPANY },
      { company: OTHER_COMPANY },
    ] as never);

    await expect(assertBuilderSession()).resolves.toEqual({
      session: BUILDER_SESSION,
      companyId: OTHER_COMPANY.id,
      companySlug: OTHER_COMPANY.slug,
      companyName: OTHER_COMPANY.name,
      actingOnBehalf: false,
      membershipCount: 2,
    });
  });

  it('ignores a foreign cookie and falls back to earliest membership', async () => {
    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    vi.mocked(readActiveCompanyId).mockResolvedValue('foreign-company');
    vi.mocked(prisma.companyMember.findMany).mockResolvedValue([
      { company: DEMO_COMPANY },
    ] as never);

    await expect(assertBuilderSession()).resolves.toEqual({
      session: BUILDER_SESSION,
      companyId: DEMO_COMPANY.id,
      companySlug: DEMO_COMPANY.slug,
      companyName: DEMO_COMPANY.name,
      actingOnBehalf: false,
      membershipCount: 1,
    });
  });

  it('returns null for admin when active-company cookie is missing', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never);

    await expect(assertBuilderSession()).resolves.toBeNull();
    expect(prisma.company.findUnique).not.toHaveBeenCalled();
  });

  it('returns null for admin when cookie company does not exist', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never);
    vi.mocked(readActiveCompanyId).mockResolvedValue('missing-company');
    vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

    await expect(assertBuilderSession()).resolves.toBeNull();
  });

  it('returns actingOnBehalf context for admin with a valid company cookie', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never);
    vi.mocked(readActiveCompanyId).mockResolvedValue(DEMO_COMPANY.id);
    vi.mocked(prisma.company.findUnique).mockResolvedValue(DEMO_COMPANY as never);

    await expect(assertBuilderSession()).resolves.toEqual({
      session: ADMIN_SESSION,
      companyId: DEMO_COMPANY.id,
      companySlug: DEMO_COMPANY.slug,
      companyName: DEMO_COMPANY.name,
      actingOnBehalf: true,
      membershipCount: 0,
    });
  });
});
