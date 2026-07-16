import { describe, expect, it } from 'vitest';

import { allocateUniqueSlug, MAX_SLUG_ATTEMPTS } from './unique-slug';

describe('allocateUniqueSlug', () => {
  it('returns the base slug when available', async () => {
    const slug = await allocateUniqueSlug('acme', async () => false);
    expect(slug).toBe('acme');
  });

  it('returns a numeric suffix when the base is taken', async () => {
    const slug = await allocateUniqueSlug('acme', async (candidate) => candidate === 'acme');
    expect(slug).toBe('acme-1');
  });

  it('returns null when every candidate including the UUID fallback is taken', async () => {
    const slug = await allocateUniqueSlug('acme', async () => true);
    expect(slug).toBeNull();
  });

  it('caps numeric attempts before the UUID fallback', async () => {
    let calls = 0;
    await allocateUniqueSlug('acme', async () => {
      calls += 1;
      return true;
    });
    expect(calls).toBe(MAX_SLUG_ATTEMPTS + 1);
  });
});
