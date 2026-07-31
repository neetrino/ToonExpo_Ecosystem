import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_MAP_STYLE_URL } from '@/features/geo-map/constants';
import { resolveMapStyleUrl } from '@/features/geo-map/utils/resolve-map-style-url';

describe('resolveMapStyleUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('falls back to the OpenFreeMap default when unset', () => {
    vi.stubEnv('NEXT_PUBLIC_MAP_STYLE_URL', '');
    expect(resolveMapStyleUrl()).toBe(DEFAULT_MAP_STYLE_URL);
  });

  it('uses the env override when set', () => {
    vi.stubEnv('NEXT_PUBLIC_MAP_STYLE_URL', 'https://example.com/style.json');
    expect(resolveMapStyleUrl()).toBe('https://example.com/style.json');
  });

  it('ignores a whitespace-only override', () => {
    vi.stubEnv('NEXT_PUBLIC_MAP_STYLE_URL', '   ');
    expect(resolveMapStyleUrl()).toBe(DEFAULT_MAP_STYLE_URL);
  });
});
