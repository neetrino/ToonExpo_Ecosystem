import { describe, expect, it } from 'vitest';

import { buildApartmentSlug } from './slug.js';

describe('buildApartmentSlug', () => {
  it('includes project slug and sanitized unit number', () => {
    const slug = buildApartmentSlug('defans-hauzing-test', 'Apt. 1');

    expect(slug.startsWith('defans-hauzing-test-unit-apt-1-')).toBe(true);
  });

  it('falls back when unit number is blank', () => {
    const slug = buildApartmentSlug('project-x', '   ');

    expect(slug.startsWith('project-x-unit-apt-')).toBe(true);
  });
});
