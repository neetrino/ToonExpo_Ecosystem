import { describe, expect, it } from 'vitest';

import { toCatalogPublicationStatus } from './catalog-publication-status';

describe('toCatalogPublicationStatus', () => {
  it('keeps published and maps everything else to draft', () => {
    expect(toCatalogPublicationStatus('published')).toBe('published');
    expect(toCatalogPublicationStatus('draft')).toBe('draft');
    expect(toCatalogPublicationStatus('archived')).toBe('draft');
  });
});
