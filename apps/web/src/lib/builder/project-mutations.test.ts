import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@toonexpo/db', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      create: vi.fn(),
      updateMany: vi.fn(),
    },
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

import { prisma } from '@toonexpo/db';

import { allocateUniqueSlug } from '@/lib/shared/unique-slug';

import { createProject, setProjectPublication, updateProject } from './project-mutations';

const OWN_COMPANY_ID = 'company-own';
const FOREIGN_COMPANY_ID = 'company-foreign';

describe('project-mutations ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns notFound when updateProject targets another company', async () => {
    vi.mocked(prisma.project.updateMany).mockResolvedValue({ count: 0 });

    const result = await updateProject(FOREIGN_COMPANY_ID, {
      projectId: 'project-1',
      name: 'Hijacked',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.project.updateMany).toHaveBeenCalledWith({
      where: { id: 'project-1', companyId: FOREIGN_COMPANY_ID },
      data: {
        name: 'Hijacked',
        city: undefined,
        address: undefined,
        description: undefined,
      },
    });
  });

  it('returns notFound when setProjectPublication targets another company', async () => {
    vi.mocked(prisma.project.updateMany).mockResolvedValue({ count: 0 });

    const result = await setProjectPublication(FOREIGN_COMPANY_ID, {
      projectId: 'project-1',
      status: 'PUBLISHED',
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(prisma.project.updateMany).toHaveBeenCalledWith({
      where: { id: 'project-1', companyId: FOREIGN_COMPANY_ID },
      data: { status: 'PUBLISHED' },
    });
  });

  it('creates a project scoped to the caller company', async () => {
    vi.mocked(allocateUniqueSlug).mockResolvedValue('sunrise-towers');
    vi.mocked(prisma.project.create).mockResolvedValue({
      id: 'project-new',
      slug: 'sunrise-towers',
    } as never);

    const result = await createProject(OWN_COMPANY_ID, {
      name: 'Sunrise Towers',
      city: 'Yerevan',
    });

    expect(result).toEqual({ ok: true, projectId: 'project-new', projectSlug: 'sunrise-towers' });
    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          companyId: OWN_COMPANY_ID,
          name: 'Sunrise Towers',
          slug: 'sunrise-towers',
        }),
      }),
    );
  });
});
