import { describe, expect, it } from 'vitest';

import {
  defaultPublicSitePages,
  normalizePublicSitePages,
  parsePublicSitePages,
} from './public-site-pages.js';

describe('public-site-pages', () => {
  it('defaults every page to enabled', () => {
    const pages = defaultPublicSitePages();
    expect(pages.mortgage).toBe(true);
    expect(pages.discover).toBe(true);
  });

  it('parses stored JSON and fills missing keys as enabled', () => {
    expect(parsePublicSitePages(undefined).apartments).toBe(true);
    expect(parsePublicSitePages('not-json').map).toBe(true);
    expect(parsePublicSitePages('{"mortgage":false}').mortgage).toBe(false);
    expect(parsePublicSitePages('{"mortgage":false}').projects).toBe(true);
  });

  it('normalizes only known boolean keys', () => {
    const next = normalizePublicSitePages({
      ...defaultPublicSitePages(),
      mortgage: false,
      expo: false,
    });
    expect(next.mortgage).toBe(false);
    expect(next.expo).toBe(false);
    expect(next.apartments).toBe(true);
  });
});
