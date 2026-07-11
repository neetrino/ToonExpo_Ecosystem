import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from 'next-auth';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    companyMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import { prisma } from '@toonexpo/db';

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

describe('assertBuilderSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when there is no session', async () => {
    vi.mocked(auth).mockResolvedValue(null as never);

    await expect(assertBuilderSession()).resolves.toBeNull();
  });

  it('returns null when the user is not BUILDER', async () => {
    vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never);

    await expect(assertBuilderSession()).resolves.toBeNull();
  });

  it('returns null when the builder has no company membership', async () => {
    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    vi.mocked(prisma.companyMember.findFirst).mockResolvedValue(null);

    await expect(assertBuilderSession()).resolves.toBeNull();
  });

  it('returns resolved company context for a builder with membership', async () => {
    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    vi.mocked(prisma.companyMember.findFirst).mockResolvedValue({
      company: DEMO_COMPANY,
    } as never);

    await expect(assertBuilderSession()).resolves.toEqual({
      session: BUILDER_SESSION,
      companyId: DEMO_COMPANY.id,
      companySlug: DEMO_COMPANY.slug,
      companyName: DEMO_COMPANY.name,
    });

    expect(prisma.companyMember.findFirst).toHaveBeenCalledWith({
      where: { userId: BUILDER_SESSION.user.id },
      orderBy: { createdAt: 'asc' },
      select: {
        company: {
          select: { id: true, slug: true, name: true },
        },
      },
    });
  });

  it('resolves to the earliest membership when a builder belongs to multiple companies', async () => {
    vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
    vi.mocked(prisma.companyMember.findFirst).mockResolvedValue({
      company: DEMO_COMPANY,
    } as never);

    await expect(assertBuilderSession()).resolves.toEqual({
      session: BUILDER_SESSION,
      companyId: DEMO_COMPANY.id,
      companySlug: DEMO_COMPANY.slug,
      companyName: DEMO_COMPANY.name,
    });

    expect(prisma.companyMember.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'asc' },
      }),
    );
  });
});
