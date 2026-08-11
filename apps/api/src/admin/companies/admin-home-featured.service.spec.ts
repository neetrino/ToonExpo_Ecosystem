import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PrismaService } from '../../prisma/prisma.service.js';
import { AdminHomeFeaturedService } from './admin-home-featured.service.js';

describe('AdminHomeFeaturedService', () => {
  const projectFindUnique = vi.fn();
  const projectCount = vi.fn();
  const projectUpdate = vi.fn();
  const apartmentFindUnique = vi.fn();
  const apartmentCount = vi.fn();
  const apartmentUpdate = vi.fn();
  const revalidateCatalog = vi.fn();
  let service: AdminHomeFeaturedService;

  beforeEach(() => {
    vi.clearAllMocks();
    const prisma = {
      db: {
        project: {
          findUnique: projectFindUnique,
          count: projectCount,
          update: projectUpdate,
        },
        apartment: {
          findUnique: apartmentFindUnique,
          count: apartmentCount,
          update: apartmentUpdate,
        },
      },
    } as unknown as PrismaService;

    service = new AdminHomeFeaturedService(prisma, {
      revalidateCatalog,
    } as never);
  });

  it('pins a project when under the homepage limit', async () => {
    projectFindUnique.mockResolvedValue({ id: 'pr_1', featuredOnHome: false });
    projectCount.mockResolvedValue(2);
    projectUpdate.mockResolvedValue({ id: 'pr_1', featuredOnHome: true });

    await expect(service.setProjectFeaturedOnHome('pr_1', true)).resolves.toEqual({
      id: 'pr_1',
      featuredOnHome: true,
    });
    expect(revalidateCatalog).toHaveBeenCalledWith('pr_1');
  });

  it('rejects pinning when the homepage already has 3 featured projects', async () => {
    projectFindUnique.mockResolvedValue({ id: 'pr_1', featuredOnHome: false });
    projectCount.mockResolvedValue(3);

    await expect(service.setProjectFeaturedOnHome('pr_1', true)).rejects.toMatchObject({
      message: 'Homepage already has 3 featured projects',
    });
    expect(projectUpdate).not.toHaveBeenCalled();
    expect(revalidateCatalog).not.toHaveBeenCalled();
  });

  it('rejects pinning when the homepage already has 6 featured apartments', async () => {
    apartmentFindUnique.mockResolvedValue({
      id: 'apt_1',
      featuredOnHome: false,
      projectId: 'pr_1',
    });
    apartmentCount.mockResolvedValue(6);

    await expect(service.setApartmentFeaturedOnHome('apt_1', true)).rejects.toMatchObject({
      message: 'Homepage already has 6 featured apartments',
    });
    expect(apartmentUpdate).not.toHaveBeenCalled();
    expect(revalidateCatalog).not.toHaveBeenCalled();
  });
});
