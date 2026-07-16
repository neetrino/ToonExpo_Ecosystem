import { describe, expect, it } from 'vitest';

import { isHttpUrl } from '@toonexpo/contracts';

describe('isHttpUrl (contracts re-export usage)', () => {
  it('matches httpUrlSchema acceptance for render guards', () => {
    expect(isHttpUrl('https://bank.example')).toBe(true);
    expect(isHttpUrl('javascript:alert(document.cookie)')).toBe(false);
  });
});
