import { beforeEach, describe, expect, it, vi } from 'vitest';

const revalidatePath = vi.fn();

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

import { revalidateCatalogPaths } from './revalidate-catalog-paths';

describe('revalidateCatalogPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revalidates builders list and detail paths', () => {
    revalidateCatalogPaths({ companySlug: 'demo-development' });

    expect(revalidatePath).toHaveBeenCalledWith('/en/builders');
    expect(revalidatePath).toHaveBeenCalledWith('/en/builders/demo-development');
    expect(revalidatePath).toHaveBeenCalledWith('/ru/builders/demo-development');
    expect(revalidatePath).toHaveBeenCalledWith('/hy/builders/demo-development');
  });

  it('revalidates project layout paths for nested apartment routes', () => {
    revalidateCatalogPaths({
      companySlug: 'demo-development',
      projectSlug: 'sunrise-residence',
    });

    expect(revalidatePath).toHaveBeenCalledWith(
      '/en/projects/demo-development/sunrise-residence',
      'layout',
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      '/ru/projects/demo-development/sunrise-residence',
      'layout',
    );
    expect(revalidatePath).toHaveBeenCalledWith(
      '/hy/projects/demo-development/sunrise-residence',
      'layout',
    );
  });
});
