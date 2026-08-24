import { describe, expect, it, vi } from 'vitest';

const redirect = vi.fn();

vi.mock('@/i18n/navigation', () => ({
  redirect,
}));

import { ensureCanonicalApartmentSlug } from '@/features/catalog/utils/ensure-canonical-apartment-slug';

describe('ensureCanonicalApartmentSlug', () => {
  it('does nothing when slug already matches', () => {
    ensureCanonicalApartmentSlug({ slug: 'project-unit-1-abc123' }, 'project-unit-1-abc123', 'en');

    expect(redirect).not.toHaveBeenCalled();
  });

  it('redirects legacy id URLs to canonical slug', () => {
    redirect.mockClear();

    ensureCanonicalApartmentSlug(
      { slug: 'project-unit-1-abc123' },
      'cmt6ww2d000a01s6ik6eq1gh',
      'en',
    );

    expect(redirect).toHaveBeenCalledWith({
      href: '/apartments/project-unit-1-abc123',
      locale: 'en',
    });
  });
});
