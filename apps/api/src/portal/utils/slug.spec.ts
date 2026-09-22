import { describe, expect, it } from 'vitest';

import { buildApartmentSlug, buildApartmentSlugBase, normalizePortalSlug } from './slug.js';

describe('normalizePortalSlug', () => {
  it('slugifies a latin name and falls back when nothing remains', () => {
    expect(normalizePortalSlug('Northern Hills', 'project')).toBe('northern-hills');
    expect(normalizePortalSlug('Հյուսիս', 'project')).toBe('project');
  });
});

describe('buildApartmentSlugBase', () => {
  it('joins the project slug and unit number without a random suffix', () => {
    expect(buildApartmentSlugBase('defans-hauzing-test', 'Apt. 1')).toBe(
      'defans-hauzing-test-unit-apt-1',
    );
  });
});

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
