import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from 'next-auth';

const redirectMock = vi.fn((path: string): never => {
  throw new Error(`NEXT_REDIRECT:${path}`);
});

vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirectMock(path),
}));

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/admin/assert-admin-session', () => ({
  assertAdminSession: vi.fn(),
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit: vi.fn(),
}));

vi.mock('@/lib/builder/active-company-cookie', () => ({
  readActiveCompanyId: vi.fn(),
  setActiveCompanyCookie: vi.fn(),
  clearActiveCompanyCookie: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    company: {
      findUnique: vi.fn(),
    },
    companyMember: {
      findFirst: vi.fn(),
    },
  },
}));

import { auth } from '@/auth';
import { prisma } from '@toonexpo/db';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { recordAudit } from '@/lib/audit/record-audit';
import {
  clearActiveCompanyCookie,
  readActiveCompanyId,
  setActiveCompanyCookie,
} from '@/lib/builder/active-company-cookie';

import {
  startActingOnBehalfAction,
  stopActingOnBehalfAction,
  switchActiveCompanyAction,
} from './active-company-actions';

const ADMIN_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin',
    role: 'BIGPROJECTS_ADMIN',
  },
} as Session;

const BUILDER_SESSION = {
  expires: new Date().toISOString(),
  user: {
    id: 'builder-1',
    email: 'builder@example.com',
    name: 'Builder',
    role: 'BUILDER',
  },
} as Session;

describe('active-company-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectMock.mockImplementation((path: string): never => {
      throw new Error(`NEXT_REDIRECT:${path}`);
    });
  });

  describe('startActingOnBehalfAction', () => {
    it('rejects non-admin callers', async () => {
      vi.mocked(assertAdminSession).mockResolvedValue(null);

      await expect(startActingOnBehalfAction('en', 'company-1')).resolves.toEqual({
        ok: false,
        errorKey: 'unauthorized',
      });
      expect(setActiveCompanyCookie).not.toHaveBeenCalled();
    });

    it('rejects missing company', async () => {
      vi.mocked(assertAdminSession).mockResolvedValue(ADMIN_SESSION);
      vi.mocked(prisma.company.findUnique).mockResolvedValue(null);

      await expect(startActingOnBehalfAction('en', 'missing')).resolves.toEqual({
        ok: false,
        errorKey: 'notFound',
      });
    });

    it('audits, sets cookie, and redirects for a valid company', async () => {
      vi.mocked(assertAdminSession).mockResolvedValue(ADMIN_SESSION);
      vi.mocked(prisma.company.findUnique).mockResolvedValue({ id: 'company-1' } as never);
      vi.mocked(recordAudit).mockResolvedValue(undefined);

      await expect(startActingOnBehalfAction('en', 'company-1')).rejects.toThrow(
        'NEXT_REDIRECT:/en/portal',
      );

      expect(recordAudit).toHaveBeenCalledWith(
        prisma,
        expect.objectContaining({
          action: 'ACTING_ON_BEHALF_START',
          entityType: 'COMPANY',
          entityId: 'company-1',
          companyId: 'company-1',
          actor: { userId: 'admin-1', role: 'BIGPROJECTS_ADMIN' },
        }),
      );
      expect(setActiveCompanyCookie).toHaveBeenCalledWith('company-1');
      expect(redirectMock).toHaveBeenCalledWith('/en/portal');
    });
  });

  describe('stopActingOnBehalfAction', () => {
    it('rejects non-admin callers', async () => {
      vi.mocked(assertAdminSession).mockResolvedValue(null);

      await expect(stopActingOnBehalfAction('en')).resolves.toEqual({
        ok: false,
        errorKey: 'unauthorized',
      });
      expect(clearActiveCompanyCookie).not.toHaveBeenCalled();
    });

    it('clears cookie and audits when an active company exists', async () => {
      vi.mocked(assertAdminSession).mockResolvedValue(ADMIN_SESSION);
      vi.mocked(readActiveCompanyId).mockResolvedValue('company-1');
      vi.mocked(prisma.company.findUnique).mockResolvedValue({ id: 'company-1' } as never);
      vi.mocked(recordAudit).mockResolvedValue(undefined);

      await expect(stopActingOnBehalfAction('en')).rejects.toThrow(
        'NEXT_REDIRECT:/en/admin/companies',
      );

      expect(recordAudit).toHaveBeenCalledWith(
        prisma,
        expect.objectContaining({
          action: 'ACTING_ON_BEHALF_STOP',
          entityId: 'company-1',
        }),
      );
      expect(clearActiveCompanyCookie).toHaveBeenCalled();
      expect(redirectMock).toHaveBeenCalledWith('/en/admin/companies');
    });
  });

  describe('switchActiveCompanyAction', () => {
    it('rejects unauthenticated callers', async () => {
      vi.mocked(auth).mockResolvedValue(null as never);

      await expect(switchActiveCompanyAction('en', 'company-1')).resolves.toEqual({
        ok: false,
        errorKey: 'unauthorized',
      });
    });

    it('rejects builder switching to a non-membership company', async () => {
      vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
      vi.mocked(prisma.companyMember.findFirst).mockResolvedValue(null);

      await expect(switchActiveCompanyAction('en', 'foreign')).resolves.toEqual({
        ok: false,
        errorKey: 'unauthorized',
      });
      expect(setActiveCompanyCookie).not.toHaveBeenCalled();
    });

    it('sets cookie for builder membership switch', async () => {
      vi.mocked(auth).mockResolvedValue(BUILDER_SESSION as never);
      vi.mocked(prisma.companyMember.findFirst).mockResolvedValue({ id: 'mem-1' } as never);

      await expect(switchActiveCompanyAction('en', 'company-2')).rejects.toThrow(
        'NEXT_REDIRECT:/en/portal',
      );

      expect(setActiveCompanyCookie).toHaveBeenCalledWith('company-2');
      expect(redirectMock).toHaveBeenCalledWith('/en/portal');
    });

    it('sets cookie for admin when company exists', async () => {
      vi.mocked(auth).mockResolvedValue(ADMIN_SESSION as never);
      vi.mocked(prisma.company.findUnique).mockResolvedValue({ id: 'company-9' } as never);

      await expect(switchActiveCompanyAction('en', 'company-9')).rejects.toThrow(
        'NEXT_REDIRECT:/en/portal',
      );

      expect(setActiveCompanyCookie).toHaveBeenCalledWith('company-9');
    });
  });
});
