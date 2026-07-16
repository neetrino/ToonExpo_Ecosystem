import { beforeEach, describe, expect, it, vi } from 'vitest';

const { create, update, findUnique } = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
  findUnique: vi.fn(),
}));

vi.mock('@toonexpo/db', () => ({
  prisma: {
    readinessCategory: { create, update, findUnique },
  },
}));

import { upsertReadinessCategory } from './readiness-category-mutations';

describe('upsertReadinessCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a category when categoryId is absent', async () => {
    create.mockResolvedValue({ id: 'cat-1' });

    const result = await upsertReadinessCategory({
      key: 'media_materials',
      name: 'Media',
      sortOrder: 30,
      active: true,
    });

    expect(result).toEqual({ ok: true, categoryId: 'cat-1' });
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          key: 'media_materials',
          name: 'Media',
          sortOrder: 30,
          active: true,
        }),
      }),
    );
  });

  it('returns keyTaken on unique constraint', async () => {
    create.mockRejectedValue(Object.assign(new Error('unique'), { code: 'P2002' }));

    const result = await upsertReadinessCategory({
      key: 'media_materials',
      name: 'Media',
      sortOrder: 30,
      active: true,
    });

    expect(result).toEqual({ ok: false, errorKey: 'keyTaken' });
  });

  it('updates an existing category without changing key', async () => {
    findUnique.mockResolvedValue({ id: 'cat-1' });
    update.mockResolvedValue({ id: 'cat-1' });

    const result = await upsertReadinessCategory({
      categoryId: 'cat-1',
      name: 'Media updated',
      weight: 2,
      sortOrder: 35,
      serviceCategoryKey: 'render_studio',
      active: false,
    });

    expect(result).toEqual({ ok: true, categoryId: 'cat-1' });
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cat-1' },
        data: expect.objectContaining({
          name: 'Media updated',
          weight: 2,
          active: false,
        }),
      }),
    );
  });

  it('returns notFound when updating a missing category', async () => {
    findUnique.mockResolvedValue(null);

    const result = await upsertReadinessCategory({
      categoryId: 'missing',
      name: 'Media',
      sortOrder: 1,
      active: true,
    });

    expect(result).toEqual({ ok: false, errorKey: 'notFound' });
    expect(update).not.toHaveBeenCalled();
  });
});
