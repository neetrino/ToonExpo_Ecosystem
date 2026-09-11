import { describe, expect, it } from 'vitest';

import { toWorkerSafeProperties } from '@/features/geo-map/utils/to-worker-safe-properties';

describe('toWorkerSafeProperties', () => {
  it('turns null-prototype tile properties into a normal object', () => {
    const raw = Object.assign(Object.create(null), { render_height: 18 });
    const plain = toWorkerSafeProperties(raw);
    expect(plain.constructor).toBe(Object);
    expect(plain['render_height']).toBe(18);
  });

  it('returns an empty object for missing properties', () => {
    expect(toWorkerSafeProperties(null)).toEqual({});
    expect(toWorkerSafeProperties(undefined)).toEqual({});
  });
});
