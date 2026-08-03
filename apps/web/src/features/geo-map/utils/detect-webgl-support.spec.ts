import { describe, expect, it } from 'vitest';

import { detectWebglSupport } from '@/features/geo-map/utils/detect-webgl-support';

describe('detectWebglSupport', () => {
  it('returns false when `document` is unavailable (e.g. this Node test environment)', () => {
    expect(detectWebglSupport()).toBe(false);
  });
});
