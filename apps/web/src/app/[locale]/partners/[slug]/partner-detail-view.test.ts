import { describe, expect, it } from 'vitest';

import { isHttpUrl } from '@toonexpo/contracts';

/** Mirrors partner detail website guard without rendering React. */
function shouldRenderWebsiteLink(website: string): boolean {
  return isHttpUrl(website);
}

describe('partner detail website guard', () => {
  it('allows http(s) website links', () => {
    expect(shouldRenderWebsiteLink('https://bank.example')).toBe(true);
    expect(shouldRenderWebsiteLink('http://legacy.example')).toBe(true);
  });

  it('blocks javascript scheme links from becoming anchors', () => {
    expect(shouldRenderWebsiteLink('javascript:alert(1)')).toBe(false);
  });
});
