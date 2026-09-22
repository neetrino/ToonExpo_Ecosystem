import { describe, expect, it } from 'vitest';

import { pickHomeHeroCopy } from './pick-home-hero-copy';

describe('pickHomeHeroCopy', () => {
  it('uses the active locale when present and falls back otherwise', () => {
    const map = { hy: 'Հայերեն վերնագիր', en: '  English title  ' };

    expect(pickHomeHeroCopy(map, 'hy', 'default')).toBe('Հայերեն վերնագիր');
    expect(pickHomeHeroCopy(map, 'en', 'default')).toBe('English title');
    expect(pickHomeHeroCopy(map, 'ru', 'default')).toBe('default');
    expect(pickHomeHeroCopy(undefined, 'hy', 'default')).toBe('default');
  });
});
