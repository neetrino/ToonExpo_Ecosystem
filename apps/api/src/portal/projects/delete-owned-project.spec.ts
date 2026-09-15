import { FavoriteTargetType } from '@toonexpo/db';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TRANSLATION_ENTITY } from '../../catalog/utils/resolve-translation.js';
import { deleteOwnedProject } from './delete-owned-project.js';

describe('deleteOwnedProject', () => {
  const apartmentFindMany = vi.fn();
  const readinessUpdateMany = vi.fn();
  const crmLinkDeleteMany = vi.fn();
  const favoriteDeleteMany = vi.fn();
  const translationDeleteMany = vi.fn();
  const projectDelete = vi.fn();
  const transaction = vi.fn();

  const tx = {
    readinessAssessment: { updateMany: readinessUpdateMany },
    crmDealApartmentLink: { deleteMany: crmLinkDeleteMany },
    buyerFavorite: { deleteMany: favoriteDeleteMany },
    translation: { deleteMany: translationDeleteMany },
    project: { delete: projectDelete },
  };

  const db = {
    apartment: { findMany: apartmentFindMany },
    $transaction: transaction,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    transaction.mockImplementation(async (fn: (client: typeof tx) => Promise<void>) => fn(tx));
    readinessUpdateMany.mockResolvedValue({ count: 0 });
    crmLinkDeleteMany.mockResolvedValue({ count: 0 });
    favoriteDeleteMany.mockResolvedValue({ count: 0 });
    translationDeleteMany.mockResolvedValue({ count: 0 });
    projectDelete.mockResolvedValue({ id: 'proj_1' });
  });

  it('deletes published inventory after clearing Restrict FKs', async () => {
    apartmentFindMany.mockResolvedValue([{ id: 'apt_1' }]);

    await deleteOwnedProject(db as never, 'proj_1');

    expect(readinessUpdateMany).toHaveBeenCalledWith({
      where: { projectId: 'proj_1' },
      data: { projectId: null },
    });
    expect(crmLinkDeleteMany).toHaveBeenCalledWith({
      where: { apartmentId: { in: ['apt_1'] } },
    });
    expect(favoriteDeleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { targetType: FavoriteTargetType.project, targetId: 'proj_1' },
          { targetType: FavoriteTargetType.apartment, targetId: { in: ['apt_1'] } },
        ],
      },
    });
    expect(translationDeleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { entityType: TRANSLATION_ENTITY.project, entityId: 'proj_1' },
          { entityType: TRANSLATION_ENTITY.apartment, entityId: { in: ['apt_1'] } },
        ],
      },
    });
    expect(projectDelete).toHaveBeenCalledWith({ where: { id: 'proj_1' } });
  });

  it('skips apartment link cleanup when the project has no units', async () => {
    apartmentFindMany.mockResolvedValue([]);

    await deleteOwnedProject(db as never, 'proj_2');

    expect(crmLinkDeleteMany).not.toHaveBeenCalled();
    expect(projectDelete).toHaveBeenCalledWith({ where: { id: 'proj_2' } });
  });
});
