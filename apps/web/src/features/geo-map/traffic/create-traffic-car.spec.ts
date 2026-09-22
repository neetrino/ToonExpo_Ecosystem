import { describe, expect, it } from 'vitest';

import { createTrafficCarGeometry } from '@/features/geo-map/traffic/create-traffic-car';

describe('createTrafficCarGeometry', () => {
  it('builds a sedan with more than a two-box body', () => {
    const geometry = createTrafficCarGeometry();
    expect(geometry.getAttribute('position').count).toBeGreaterThan(80);
    geometry.dispose();
  });
});
