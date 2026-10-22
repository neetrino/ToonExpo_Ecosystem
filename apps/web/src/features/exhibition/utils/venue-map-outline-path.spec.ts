import { describe, expect, it } from 'vitest';

import { rectsToOutlinePath } from './venue-map-outline-path';

describe('rectsToOutlinePath', () => {
  it('returns an empty path when there are no cells', () => {
    expect(rectsToOutlinePath([])).toBe('');
  });

  it('outlines one cell as a closed rectangle', () => {
    expect(rectsToOutlinePath([{ x: 0, y: 0, width: 10, height: 10 }])).toBe(
      'M 0 0 L 10 0 L 10 10 L 0 10 L 0 0 Z',
    );
  });

  it('merges two adjacent cells and drops the shared edge', () => {
    expect(
      rectsToOutlinePath([
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 10, y: 0, width: 10, height: 10 },
      ]),
    ).toBe('M 0 0 L 10 0 L 20 0 L 20 10 L 10 10 L 0 10 L 0 0 Z');
  });
});
