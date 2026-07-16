import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findFirst, update, create, updateMany, transaction } = vi.hoisted(() => ({
  findFirst: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  updateMany: vi.fn(),
  transaction: vi.fn(),
}));

const { recordAudit } = vi.hoisted(() => ({
  recordAudit: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      findFirst,
      create,
      update,
      updateMany,
    },
    $transaction: transaction,
  },
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string;
      constructor(message: string, { code }: { code: string }) {
        super(message);
        this.code = code;
      }
    },
  },
}));

vi.mock('@/lib/shared/unique-slug', () => ({
  allocateUniqueSlug: vi.fn(),
}));

vi.mock('@/lib/audit/record-audit', () => ({
  recordAudit,
  formatStatusTransition: (from: string, to: string) => `${from}→${to}`,
}));

import { prisma } from '@toonexpo/db';

import { allocateUniqueSlug } from '@/lib/shared/unique-slug';

import { createProject, setProjectPublication, updateProject } from './project-mutations';

const OWN_COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';
const ACTOR = { userId: 'user-1', role: 'BUILDER' as const };

describe('project-mutations ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        project: { findFirst, update },
        auditLog: { create: vi.fn() },
      }),
    );
  });

  it('returns notFound when updateProject targets another company', async () => {
    vi.mocked(prisma.project.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateProject(FOREIGN_COMPANY_ID, {
      projectId: 'project-1',
      name: 'Hijacked',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
  });

  it('returns notFound when setProjectPublication targets another company', async () => {
    findFirst.mockResolvedValue(null);

    const result = await setProjectPublication(
      FOREIGN_COMPANY_ID,
      { projectId: 'project-1', status: 'PUBLISHED' },
      ACTOR,
    );

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(recordAudit).not.toHaveBeenCalled();
  });

  it('writes an audit row when publication status changes', async () => {
    findFirst.mockResolvedValue({
      id: 'project-1',
      status: 'DRAFT',
      companyId: OWN_COMPANY_ID,
    });
    update.mockResolvedValue({ id: 'project-1' });
    recordAudit.mockResolvedValue(undefined);

    const result = await setProjectPublication(
      OWN_COMPANY_ID,
      { projectId: 'project-1', status: 'PUBLISHED' },
      ACTOR,
    );

    expect(result).toEqual({ ok: true, projectId: 'project-1' });
    expect(recordAudit).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        actor: ACTOR,
        action: 'PUBLICATION_CHANGE',
        entityType: 'PROJECT',
        entityId: 'project-1',
        companyId: OWN_COMPANY_ID,
        detail: 'DRAFT→PUBLISHED',
      }),
    );
  });

  it('creates a project scoped to the caller company', async () => {
    vi.mocked(allocateUniqueSlug).mockResolvedValue('sunrise-towers');
    create.mockResolvedValue({
      id: 'project-new',
      slug: 'sunrise-towers',
    });

    const result = await createProject(OWN_COMPANY_ID, {
      name: 'Sunrise Towers',
      city: 'Yerevan',
    });

    expect(result).toEqual({ ok: true, projectId: 'project-new', projectSlug: 'sunrise-towers' });
  });
});
